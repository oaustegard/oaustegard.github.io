# ATProto FileDrop

Browser-to-browser file transfer with ATProto as the signaling channel.
Live at [austegard.com/bsky/](https://austegard.com/bsky/).

File bytes never touch a server: they travel over a DTLS-encrypted WebRTC
data channel directly between the two browsers. ATProto carries only the
few kilobytes of SDP offer/answer text needed to set the connection up.

## How it works

WebRTC needs an out-of-band channel to exchange session descriptions
(SDP) before the peer-to-peer connection exists. Traditionally that's a
dedicated signaling server. This app uses each user's ATProto repo
instead:

1. Both users open the page, sign in with their handle and an
   [app password](https://bsky.app/settings/app-passwords), and enter
   *each other's* handle.
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
- **Symmetric pairing.** Signals land in the sender's repo, so a peer
  only finds them by knowing whom to poll. Both sides must enter each
  other's handle. (A backlink index like
  [Constellation](https://constellation.microcosm.blue) could enable
  one-sided discovery; polling it is left as an exercise.)
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
