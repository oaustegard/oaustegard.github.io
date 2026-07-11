/* ============================================================
   scripts/fd/rtc-channel.js

   Thin adapter: wraps a raw, already-open RTCDataChannel (as handed
   out by signaling.js's 'channelopen' event) into the ChannelAdapter
   shape documented in scripts/fd/PROTOCOL.md, so transfer.js's
   Sender/Receiver (which know nothing about WebRTC) can drive it.

   Uses addEventListener (not the single-slot onmessage/onclose
   properties) throughout, because signaling.js ALSO listens on the
   same channel (to intercept its own ICE_NUDGE / ICE_RESTART_* control
   messages) via addEventListener - both listeners must coexist without
   clobbering each other.
   ============================================================ */

/* The SDP that signaling.js negotiates (via sdp-codec.js's fixed
   reconstruction template) always carries "a=max-message-size:262144",
   so 256 KiB is the real negotiated ceiling regardless of browser -
   see scripts/fd/sdp-codec.js unpackSdp(). transfer.js clamps its
   adaptive chunk size to this. */
const NEGOTIATED_MAX_MESSAGE_SIZE = 262144;

export function wrapRtcChannel(dc, maxMessageSize = NEGOTIATED_MAX_MESSAGE_SIZE) {
  dc.binaryType = 'arraybuffer';

  let lowCb = null;
  dc.addEventListener('bufferedamountlow', () => { if (lowCb) lowCb(); });

  return {
    send(data) {
      dc.send(data);
    },
    onMessage(cb) {
      dc.addEventListener('message', (ev) => cb(ev.data));
    },
    onClose(cb) {
      dc.addEventListener('close', () => cb());
    },
    get bufferedAmount() {
      return dc.bufferedAmount;
    },
    get bufferedAmountLowThreshold() {
      return dc.bufferedAmountLowThreshold;
    },
    set bufferedAmountLowThreshold(v) {
      dc.bufferedAmountLowThreshold = v;
    },
    onBufferedAmountLow(cb) {
      lowCb = cb;
    },
    get maxMessageSize() {
      return maxMessageSize;
    }
  };
}
