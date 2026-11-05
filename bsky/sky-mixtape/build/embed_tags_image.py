"""Tag vectors for the photo seed: the 247 tag descriptions embedded with EmbeddingGemma 2's text model
(q4 ONNX on CPU, with the query prompt the image search uses), plus each tag's mean and spread of
cosine similarity over the 16,878 Bluesky images indexed by ../../image-search/ (EG2 vision, 70 soft
tokens, stored there as remex 2-bit codes and scored here from those codes).

usage: python3 embed_tags_image.py HF_DIR [--out ../image-tags.json]
  HF_DIR holds model_q4.onnx, model_q4.onnx_data and tokenizer.json from onnx-community/embeddinggemma-2-ONNX.
needs: numpy, onnxruntime, tokenizers, remex==2.1.0 (the version that built the image index)."""
import argparse, base64, json
from pathlib import Path
import numpy as np, onnxruntime as ort, remex
from remex.packing import unpack
from tokenizers import Tokenizer

HERE = Path(__file__).resolve().parent
IDX = HERE.parent.parent / 'image-search' / 'data'
QUERY = 'task: search result | query: '


def eg2_text(hf, texts):
    so = ort.SessionOptions(); so.intra_op_num_threads = 4
    sess = ort.InferenceSession(str(hf / 'model_q4.onnx'), so, providers=['CPUExecutionProvider'])
    tok = Tokenizer.from_file(str(hf / 'tokenizer.json'))
    empty = np.zeros((0, 512), np.float32)
    out = np.empty((len(texts), 768), np.float32)
    for i, t in enumerate(texts):  # one at a time: no padding, so no question of how the graph pools it
        ids = np.array([tok.encode(QUERY + t).ids[:128]], np.int64)
        e = sess.run(['sentence_embedding'], {'input_ids': ids, 'attention_mask': np.ones_like(ids),
                                              'image_features': empty, 'video_features': empty, 'audio_features': empty})[0][0]
        out[i] = e / np.linalg.norm(e)
    return out


def image_scores(T):
    """Cosine of each tag vector with each indexed image, from the 2-bit codes (rx2 scoring, as build_index.py)."""
    meta = json.loads((IDX / 'index.json').read_text())
    n, d = meta['n'], meta['d']
    qz = remex.Quantizer(d, bits=meta['bits'], seed=meta['seed'], mean=np.array(meta['mu'], np.float32))
    codes = unpack(np.fromfile(IDX / 'codes.u8.bin', np.uint8), meta['bits'], n * d).reshape(n, d)  # packed flat
    aux = np.fromfile(IDX / 'aux.f32.bin', '<f4').reshape(n, 2)
    dirs = qz.centroids.astype(np.float32)[codes]
    # The codes hold x - mu, so rx2 scores are q.(x - mu); add q.mu back for the raw cosine the page computes.
    mu = np.array(meta['mu'], np.float32)
    return (qz._rotate_rows(T).astype(np.float32) @ dirs.T) * aux[:, 0] + aux[:, 1] + (T @ mu)[:, None], meta


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('hf', type=Path)
    ap.add_argument('--out', type=Path, default=HERE.parent / 'image-tags.json')
    a = ap.parse_args()
    tags = json.load(open(HERE / 'tags.json'))
    cat = json.load(open(HERE.parent / 'catalog.json'))
    assert [t['id'] for t in tags] == [t['id'] for t in cat['tags']], 'tags.json and catalog.json disagree'
    T = eg2_text(a.hf, [f"{t['label']}: {t['desc']}" for t in tags])
    S, meta = image_scores(T)
    stats = [[round(float(S[j].mean()), 5), round(float(S[j].std()), 5)] for j in range(len(tags))]
    vec = []
    for v in T:
        s = float(np.abs(v).max()) / 127
        vec.append({'s': s, 'b': base64.b64encode(np.round(v / s).astype(np.int8).tobytes()).decode()})
    json.dump({'model': 'onnx-community/embeddinggemma-2-ONNX q4', 'dim': 768, 'queryPrompt': QUERY,
               'visionSoftTokens': meta['vision_soft_tokens'], 'background': f"{meta['n']} Bluesky images (../image-search)",
               'tagVec': vec, 'tagStats': stats}, open(a.out, 'w'), separators=(',', ':'))
    print('ok', len(tags), 'tags; bg', S.shape[1], 'images; mean sim', round(float(S.mean()), 3),
          'mean sd', round(float(np.mean([s[1] for s in stats])), 4), '->', a.out)
