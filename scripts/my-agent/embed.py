"""Sentence embeddings for every backfilled post that contains the phrase,
with the exact model the page runs through transformers.js
(Xenova/all-MiniLM-L6-v2, quantized ONNX): mean pooling, L2-normalized.

usage: embed.py RAW_DIR MODEL_DIR OUT_NPZ
MODEL_DIR holds model_quantized.onnx and tokenizer.json from that repo.
"""
import json, sys
from pathlib import Path

import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer

from features import has_phrase


def embedder(model_dir):
    tok = Tokenizer.from_file(str(Path(model_dir, "tokenizer.json")))
    tok.enable_truncation(512)
    tok.enable_padding()
    sess = ort.InferenceSession(str(Path(model_dir, "model_quantized.onnx")), providers=["CPUExecutionProvider"])
    names = {i.name for i in sess.get_inputs()}

    def embed(texts):
        enc = tok.encode_batch(texts)
        ids = np.array([e.ids for e in enc], dtype=np.int64)
        mask = np.array([e.attention_mask for e in enc], dtype=np.int64)
        feed = {"input_ids": ids, "attention_mask": mask}
        if "token_type_ids" in names:
            feed["token_type_ids"] = np.zeros_like(ids)
        h = sess.run(None, feed)[0]
        m = mask[..., None].astype(np.float32)
        v = (h * m).sum(1) / m.sum(1)
        return v / np.linalg.norm(v, axis=1, keepdims=True)
    return embed


def main(raw, model_dir, out):
    ids, texts = [], []
    for f in sorted(Path(raw).glob("20*.jsonl")):
        for line in f.open():
            p = json.loads(line)
            if has_phrase(p["text"]):
                ids.append(p["uri"].rsplit("/", 1)[-1]); texts.append(p["text"])
    embed = embedder(model_dir)
    order = np.argsort([len(t) for t in texts])  # similar lengths pad less
    E = np.zeros((len(texts), 384), dtype=np.float32)
    for i in range(0, len(order), 64):
        idx = order[i:i + 64]
        E[idx] = embed([texts[j] for j in idx])
        if i % 1280 == 0:
            print(i, flush=True)
    np.savez_compressed(out, ids=np.array(ids), E=E)
    print("done", E.shape)


if __name__ == "__main__":
    main(*sys.argv[1:4])
