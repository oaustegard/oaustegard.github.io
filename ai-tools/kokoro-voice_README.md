# Kokoro Voice

Type text and hear it read aloud by [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), running in the browser
with onnxruntime-web. Each word is highlighted as it is spoken, and the text never leaves the page.

- **Voices**: Muninn (a 2:1 blend of bm_fable and bm_lewis), Emma, Isabella, George, Daniel. British English.
- **Model**: 102 MB (88 MB brotli on the wire) from Cloudflare R2, int8 where weights only shape the sound and fp16
  where they set timing and pitch. A progress bar shows the download on the first visit.
- **Caching**: `sw.js` stores the model, onnxruntime and the page's files, so later visits load from the device and
  work offline. It also adds the COOP/COEP headers GitHub Pages cannot send, which lets onnxruntime use 4 threads.
  "Device, speed and storage" has a button that clears the cache.
- **Text to phonemes**: `g2p.js`, a JavaScript port of misaki's English G2P with its British dictionary
  (`lexicon-gb.json`). Words it has to guess are flagged under the text. Write `[word](/phonemes/)` to set a
  pronunciation.
- **Save WAV** downloads the last thing spoken.
- `?nosw` turns the service worker off; `?model=` and `?ort=` point at other model or onnxruntime URLs (for testing).

How it was built and measured: [kokoro-web](https://github.com/oaustegard/experiments/tree/main/kokoro-web) in
oaustegard/experiments.
