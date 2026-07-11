# FileDrop transfer protocol v2

Iroh/sendme-inspired verified streaming over a serverless WebRTC DataChannel.
No relay, no TURN, no signaling server — the tiny SDP ticket still rides the
link / QR / acoustic transports unchanged. Everything here happens **in-band**
over the already-established channel, so the ticket size budget (~130 bytes) is
untouched.

This document is the contract. `scripts/fd/tests/*.test.mjs` pins it. Modules
must satisfy the tests, not just the prose.

## Design goals mapped to sendme/iroh techniques

1. **Verified streaming** — per-chunk SHA-256 manifest sent as the first in-band
   frame; every chunk verified on arrival (not whole-file-at-the-end).
2. **Resume** — receiver reports what it already has on reconnect; sender resends
   only the gap.
3. **Stream to disk** — verified chunks written straight to a storage sink
   (File System Access API) instead of buffered whole in RAM; memory fallback.
4. **Content addressing** — a collection has a stable content-derived id; per-file
   `root` anchors integrity independent of transport.
5. **Collections** — a directory / multi-file send is one logical transfer with
   one id and one accept gate.

Explicitly **out of scope: #6 relay/TURN**. STUN-only, stays serverless.

## Layering (module boundaries)

```
transfer.js   transport-agnostic protocol: Sender, Receiver. No DOM, no WebRTC,
              no QR. Talks to an injected ChannelAdapter + StorageSink.
storage.js    StorageSink implementations: MemorySink, FsaSink.
sdp-codec.js  pure SDP <-> compact-code functions (extracted verbatim).
signaling.js  WebRTC lifecycle + manual code exchange; yields an open channel.
app.js        DOM glue: wires signaling + transfer + storage to the UI.
```

`transfer.js` is the piece reused by other tools (e.g. Bsky/filedrop). It must
depend on **nothing** but the two injected interfaces below and Web Crypto
(`crypto.subtle`, present in Node via `node:crypto`.webcrypto and in browsers on
secure origins).

## Interfaces

### ChannelAdapter

A minimal duplex message channel, RTCDataChannel-shaped so the WebRTC adapter is
a thin pass-through, but mockable for tests.

```
interface ChannelAdapter {
  send(data)                       // data: string (control) | ArrayBuffer/Uint8Array (binary)
  onMessage(cb)                    // cb(data): string for control, ArrayBuffer for binary
  onClose(cb)                      // cb(): channel died
  bufferedAmount: number           // bytes queued but not yet sent
  bufferedAmountLowThreshold: number
  onBufferedAmountLow(cb)          // cb(): buffer drained below threshold
  readonly maxMessageSize: number  // may be Infinity in tests; adapters clamp chunkSize to this
}
```

Binary frames received MUST be delivered to `onMessage` as an `ArrayBuffer`
(not a Blob). Control frames as `string`.

### StorageSink

Where verified bytes land. One sink instance per collection.

```
interface StorageSink {
  async begin(collectionMeta)               // collectionMeta = COLLECTION_OFFER payload
  async openFile(fileMeta) -> fileHandle    // fileMeta = one entry of files[]
  async write(fileHandle, offset, bytes)    // write verified chunk at byte offset
  async closeFile(fileHandle) -> result     // finalize one file; result may carry {blob} for MemorySink
  async finish() -> summary                 // finalize collection
  async abort()                             // discard partials
}
```

`MemorySink.closeFile` returns `{ blob }` so the app can offer a download link.
`FsaSink.closeFile` returns `{ blob: null }` (already on disk). Offsets may
arrive out of order in principle; sinks must honor `offset` (FsaSink via
`WritableStream` seek or per-file handle). For v1 the ordered DataChannel
delivers chunks in order, but do not *rely* on it in the sink.

## Chunking and hashing

- **Hash:** SHA-256 everywhere (Web Crypto, no WASM, preserves single-file /
  zero-dependency ethos). 32-byte digests.
- **Adaptive chunk size:** choose so a file splits into at most `MAX_CHUNKS`
  chunks, with a floor of `MIN_CHUNK`:

  ```
  MIN_CHUNK = 64 * 1024
  MAX_CHUNKS = 4096
  chunkSize(size) = max(MIN_CHUNK, ceilTo64K(ceil(size / MAX_CHUNKS)))
  ceilTo64K(n) = Math.ceil(n / 65536) * 65536
  nchunks(size) = size === 0 ? 0 : Math.ceil(size / chunkSize(size))
  ```

  Consequence: manifest is at most `MAX_CHUNKS * 32 = 128 KiB`, regardless of
  file size; small files use 64 KiB chunks. `chunkSize` is carried per-file in
  the offer so the receiver never recomputes it.

- **Per-file manifest:** the concatenation of each chunk's 32-byte SHA-256, in
  order. `manifestBytes` length = `nchunks * 32`.
- **Per-file root:** `root = SHA-256(manifestBytes)`, hex-encoded (64 chars). A
  zero-length file has `nchunks = 0`, `manifestBytes` empty, `root =
  SHA-256("")`.
- **Collection id (content address):** hex SHA-256 over the concatenation, for
  each file in `files[]` order, of: the 32 raw bytes of that file's root
  (i.e. hex-decoded `root`). Depends only on content, so identical content ⇒
  identical id (dedup / idempotent), any content change ⇒ different id.

Helpers live in transfer.js and are individually exported for testing:
`chunkSizeFor(size)`, `chunkCountFor(size)`, `buildManifest(file)` →
`{ chunkSize, nchunks, manifestBytes, root }`, `collectionId(roots[])`.

## Wire format

Two frame classes on the channel, disambiguated by JS type at `onMessage`:

- **Control frames:** `string`, a JSON object with a `type` field.
- **Binary frames:** `ArrayBuffer`, a 6-byte little-endian header + payload:

  ```
  offset 0  u8   kind     0 = MANIFEST, 1 = CHUNK
  offset 1  u8   fid      file index within the collection (0..255)
  offset 2  u32  index    chunk index (0 for MANIFEST)
  offset 6  ...  payload  MANIFEST: manifestBytes ; CHUNK: chunk bytes
  ```

  Self-describing `(fid, index)` is what makes resume and out-of-order robust;
  6 bytes on a 64 KiB chunk is 0.009% overhead.

### Control messages

Sender → Receiver:
```
COLLECTION_OFFER {
  type:"COLLECTION_OFFER", v:2, id, totalSize,
  files:[ { fid, name, size, mime, chunkSize, nchunks, root } ]
}
FILE_BEGIN   { type:"FILE_BEGIN", fid }
FILE_END     { type:"FILE_END", fid }
COLLECTION_END { type:"COLLECTION_END", id }
```

Receiver → Sender:
```
COLLECTION_ACCEPT {
  type:"COLLECTION_ACCEPT", id,
  need:[ { fid, from } ]        // from = first chunk index still needed (0 = whole file)
}                                // files omitted from need[] are already complete
COLLECTION_DECLINE { type:"COLLECTION_DECLINE", id }
CHUNK_NACK  { type:"CHUNK_NACK", fid, index }   // verification failed; resend this chunk
FILE_OK     { type:"FILE_OK", fid }              // file fully received + verified
COLLECTION_OK { type:"COLLECTION_OK", id }
```

`need[].from` is a single contiguous watermark (the ordered channel guarantees a
contiguous verified prefix). Out-of-order holes are handled reactively by
`CHUNK_NACK`. A future bitmap extension may replace `from`; keep the field name.

## Sender state machine

1. For each input file, `buildManifest(file)` (streaming: slice → digest, never
   load the whole file). Assemble `COLLECTION_OFFER`; compute `id`.
2. Send `COLLECTION_OFFER`; await `COLLECTION_ACCEPT` (or `DECLINE`).
3. For each file with a `need` entry (default all, `from:0`):
   - `FILE_BEGIN`
   - MANIFEST binary frame (kind 0)
   - CHUNK frames from `need.from` to `nchunks-1`, honoring backpressure:
     if `bufferedAmount >= BUF_HIGH`, wait for `onBufferedAmountLow` before
     continuing (thresholds below).
   - `FILE_END`
4. On `CHUNK_NACK`, resend that one `(fid,index)` chunk.
5. After all files, `COLLECTION_END`; await `COLLECTION_OK`.
6. On channel close mid-transfer: stop; on a fresh `COLLECTION_ACCEPT` for the
   same `id` (post-reconnect), resume from the new `need` watermarks —
   **resending only the gap**, never chunks below `from`.

## Receiver state machine

1. On `COLLECTION_OFFER`: surface to app for accept/decline. On accept, open the
   sink (`begin` + `openFile` per file), compute per-file `need.from` from any
   bytes already durably written (0 on a fresh transfer), send
   `COLLECTION_ACCEPT`.
2. On MANIFEST frame for `fid`: verify `SHA-256(manifestBytes) === files[fid].root`;
   reject the file if not. Store manifest for chunk verification.
3. On CHUNK frame `(fid,index)`: verify `SHA-256(chunk) === manifest[index]`. If
   ok, `sink.write(handle, index*chunkSize, chunk)`, advance watermark. If bad,
   send `CHUNK_NACK{fid,index}` and do not advance.
4. When a file reaches `nchunks` verified: `sink.closeFile`, send `FILE_OK`.
5. When all files done: `sink.finish`, send `COLLECTION_OK`.
6. Resume: receiver tracks `received[fid]` = count of contiguous verified chunks
   (in memory; survives the reconnect because the page survives). On a new
   channel it re-sends `COLLECTION_ACCEPT` with `from = received[fid]`.

## Constants

```
MIN_CHUNK   = 64 * 1024
MAX_CHUNKS  = 4096
BUF_HIGH    = 4 * 1024 * 1024      // pause sending above this bufferedAmount
BUF_LOW     = 1 * 1024 * 1024      // resume sending below this
MAX_FILE_BYTES default = 8 * 1024 * 1024 * 1024   // FsaSink lifts the old 2 GiB RAM cap; MemorySink keeps 2 GiB
```

## Public API (transfer.js)

```
export function chunkSizeFor(size): number
export function chunkCountFor(size): number
export async function buildManifest(file): { chunkSize, nchunks, manifestBytes, root }
export function collectionId(rootsHex: string[]): string        // hex

export class Sender {
  constructor(channel: ChannelAdapter, opts?)
  async send(files: Array<File | {file:File, path:string}>): Promise<{id}>
  resume(channel: ChannelAdapter)         // rebind to a fresh channel, await new ACCEPT
  on(event, cb)   // 'progress'({id,fid,index,nchunks,sentBytes,totalBytes}), 'done', 'declined', 'error'
}

export class Receiver {
  constructor(channel: ChannelAdapter, sink: StorageSink, opts?)
  onOffer(cb)     // cb(offer, accept, decline) — app decides; accept()/decline() resolve it
  resume(channel: ChannelAdapter)
  on(event, cb)   // 'progress', 'file'({fid,blob?}), 'done'({id,summary}), 'error'
}
```

`progress` events drive the existing per-file UI rows. Event payloads are part of
the contract (tests assert `progress` fires with monotonic `index`).

## Notes for implementers

- Use `crypto.subtle.digest('SHA-256', bytes)` — in Node tests import
  `webcrypto` from `node:crypto` and expose as `globalThis.crypto` if absent;
  transfer.js must reference `crypto.subtle` (works in both).
- Never load a whole file to hash it: slice `file.slice(o, o+chunkSize)` and
  digest each slice. This fixes the current sender-side whole-file `arrayBuffer`
  memory spike as a side effect.
- Hex encode/decode helpers must be constant and shared (root/id are hex, header
  index is binary).
- Keep transfer.js free of `RTCDataChannel`, `document`, `window`,
  `showSaveFilePicker` — those belong to adapters/sinks/app.
