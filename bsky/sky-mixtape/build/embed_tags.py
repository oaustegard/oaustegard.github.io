"""Embed tag descriptions with Ettin-17m (../../embedders/models/ettin, the page's model) on CPU
onnxruntime, plus each tag's mean and spread of cosine similarity over a Jetstream sample.
usage: python3 embed_tags.py BACKGROUND_JSON OUT_JSON [--post-prompt query|document]"""
import argparse, base64, json
from pathlib import Path
import numpy as np, onnxruntime as ort
from tokenizers import Tokenizer

MAX_SEQ = 128
D = Path(__file__).resolve().parent.parent.parent / 'embedders' / 'models' / 'ettin'

class Ettin:
    def __init__(self):
        so = ort.SessionOptions(); so.intra_op_num_threads = 4
        self.sess = ort.InferenceSession(str(D / 'model.onnx'), so, providers=['CPUExecutionProvider'])
        self.tok = Tokenizer.from_file(str(D / 'tokenizer.json'))
        self.out = self.sess.get_outputs()[0].name
        self.prompts = json.loads((D / 'meta.json').read_text()).get('prompts') or {}
    def embed(self, texts, prompt='', batch=64):
        enc = []
        for t in texts:
            ids = self.tok.encode(prompt + t).ids
            enc.append(ids if len(ids) <= MAX_SEQ else ids[:MAX_SEQ - 1] + ids[-1:])
        order = np.argsort([len(e) for e in enc])
        X = np.empty((len(texts), 768), np.float32)
        for s in range(0, len(order), batch):
            rows = order[s:s + batch]
            S = max(len(enc[r]) for r in rows)
            ids = np.zeros((len(rows), S), np.int64); att = np.zeros((len(rows), S), np.int64)
            for b, r in enumerate(rows):
                ids[b, :len(enc[r])] = enc[r]; att[b, :len(enc[r])] = 1
            v = self.sess.run([self.out], {'input_ids': ids, 'attention_mask': att})[0]
            X[rows] = v / np.linalg.norm(v, axis=1, keepdims=True)
        return X

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('background'); ap.add_argument('out')
    ap.add_argument('--post-prompt', choices=['query', 'document'], default='document')
    a = ap.parse_args()
    tags = json.load(open(Path(__file__).parent / 'tags.json'))
    bg = json.load(open(a.background))
    m = Ettin()
    pp = m.prompts.get(a.post_prompt, '')
    T = m.embed([f"{t['label']}: {t['desc']}" for t in tags], m.prompts.get('document', ''))
    B = m.embed(bg, pp)
    S = B @ T.T
    stats = [[float(S[:, j].mean()), float(S[:, j].std())] for j in range(len(tags))]
    vec = []
    for v in T:
        s = float(np.abs(v).max()) / 127
        vec.append({'s': s, 'b': base64.b64encode(np.round(v / s).astype(np.int8).tobytes()).decode()})
    json.dump({'model': 'ettin-17m', 'dtype': 'q4', 'dim': 768, 'postPrompt': pp, 'vec': vec, 'stats': stats}, open(a.out, 'w'))
    print('ok', len(tags), 'tags; bg', len(bg), 'mean sim', round(float(S.mean()), 3), 'mean sd', round(float(np.mean([s[1] for s in stats])), 3))
