# ATProto FileDrop

Browser-to-browser file transfer with ATProto as the signaling channel.
Live at [austegard.com/bsky/filedrop.html](https://austegard.com/bsky/filedrop.html).

File bytes never touch a server: they travel over a DTLS-encrypted WebRTC
data channel directly between the two browsers. ATProto carries only the
few kilobytes of SDP offer/answer text needed to set the connection up.

## How it works

WebRTC needs an out-of-band channel to exchange session descriptions
(SDP) before the peer-to-peer connection exists. Traditionally that's a
dedicated signaling server. This app uses each user's ATProto repo
instead:

1. Both users open the page and sign in with their handle and an
   [app password](https://bsky.app/settings/app-passwords). One side adds
   the other by handle — or shares their address link
   (`filedrop.html?peer=<handle>`; a naked `filedrop.html?<handle>` also
   works), which pre-pairs whoever opens it. The other direction is
   discovered automatically (below), subject to a consent prompt.
2. To signal, a peer writes a `com.austegard.filedrop.signal` record into
   its **own** repo via `com.atproto.repo.createRecord`, addressed to the
   other peer's DID.
3. Each side polls the **other's** repo with unauthenticated
   `com.atproto.repo.listRecords` calls straight to the peer's PDS —
   ATProto repos are publicly readable, so no shared infrastructure is
   needed to receive signals.
4. The lexicographically smaller DID creates the WebRTC offer (glare
   avoidance); the other side answers. Once the connection reports
   `connected`, both sides delete their signal records. Stale records are
   also swept at every sign-in and ignored past a 5-minute TTL.
5. Files stream over the data channel in 64 KB chunks with backpressure,
   after an explicit accept from the receiver.

Handle resolution goes through the public Bluesky AppView; the PDS
endpoint comes from the DID document (`plc.directory` for `did:plc`,
`.well-known/did.json` for `did:web`). Credentials are sent only to the
user's own PDS and held in tab memory — nothing is stored.

## Why ATProto is a decent signaling store

- **No server to run.** The PDS each user already has plays the role a
  signaling server would. The page is static HTML.
- **Identity is built in.** Peers are named by handle, verified by DID.
  The SharePoint ancestor of this app had to invent random peer IDs;
  here `alice.bsky.social` *is* the address.
- **Public reads.** The receiving side needs no credentials to poll for
  signals, which keeps the trust model simple: you only ever
  authenticate to your own PDS.

## Caveats

- **Signal records are public.** Anyone can read your repo, and SDP
  embeds IP address candidates. Records live only for the seconds a
  handshake takes (plus the TTL as a bound), and modern browsers mask
  local addresses with mDNS names, but the server-reflexive (public) IP
  is visible while a record exists. Don't use this if that matters to
  you.
- **STUN, no TURN.** A public STUN server discovers each peer's public
  address; it never relays file bytes. Pairs behind symmetric NATs may
  fail to connect — fixing that requires TURN, which *does* relay
  traffic, and is deliberately not included. Append `#nostun` to the URL
  to disable STUN for same-LAN testing.
- **Discovery depends on Constellation.** Signals land in the sender's
  repo, so the receiving side has to learn whom to poll. The side that
  can't initiate (larger DID) writes a `knock` record; the other side
  finds it by polling [Constellation's](https://constellation.microcosm.blue)
  backlink index for signal records targeting its DID (indexing latency
  is a few seconds). Index hits are treated as hints and verified
  against a live, TTL-valid record in the peer's repo before pairing.
  If Constellation is down, both sides entering each other's handle
  still works, exactly as before.
- **Discovered peers require consent.** Anyone can write a signal record
  addressed to any DID, so discovery is an open inbox. Peers you added
  yourself (typed or via a `?peer=` link) pair automatically; anyone else
  appears as a *wants to connect* request, and no connection, offer, or
  knock happens until you accept. Record authorship is bound to the
  author's repo, so the handle on a request can't be forged — but check
  it's the handle you expect before accepting.
- **Signaling metadata is public.** Beyond the IP exposure above, the
  records reveal *who* your account exchanges files with and *when*,
  for the seconds they exist. File names and contents never touch
  ATProto.
- **Memory-bound receive.** Incoming files are buffered in RAM before
  the save dialog, so very large files are limited by browser memory.

## Credits

The original concept — pure browser-to-browser WebRTC file drop with a
minimal signaling shim — comes from
[osama2kabdullah/FileDrop](https://github.com/osama2kabdullah/FileDrop).
This version replaces the signaling layer with ATProto records and adds
handle-based identity. An intermediate iteration used a SharePoint list
as the signal store; the WebRTC and file-transfer plumbing here is
inherited from it.
