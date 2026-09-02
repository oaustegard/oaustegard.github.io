# Embedding inversion

Browse 1,000 recorded attempts to write a sentence back from its
[bekko-embedding-v1-a8m](https://huggingface.co/hotchpotch/bekko-embedding-v1-a8m)
vector, and from the 384-bit sign code a 1-bit index keeps of it. Each target shows
the nearest training string (the memorisation control) and six rounds of a
vec2text-shaped inverter, with token F1 per round and the verifier cosine at the end.
Nothing runs in the page; it reads a 1.2 MB JSON of results.

## Where the numbers come from

[oaustegard/experiments/embedding-inversion](https://github.com/oaustegard/experiments/tree/main/embedding-inversion):
a t5-small decoder conditioned on the vector, a corrector trained on the decoder's own
guesses, and bekko as the verifier picking among candidates each round. 40,000 training
pairs, 7.4 hours on four CPU cores, pre-registered before the first stage ran.

| | float vector | 384-bit sign code |
|---|---|---|
| nearest training string (control), exact | 0.1% | 0.1% |
| zero-step, top beam, exact | 0.8% | 0.3% |
| after 5 correction rounds, exact | 2.4% | 0.9% |
| after 5 rounds, token F1 | 0.41 | 0.34 |

Exact recovery is zero past ten words in both arms. The outputs are on-topic
paraphrases, never training strings, and sit closer to the target than any training
string does. vec2text reports 92% exact recovery after five million pairs on a GPU; the
gap here is the training budget, not the mechanism, which behaves as the paper
describes: verifier selection, one large correction round, convergence.

## Data and licences

Strings from [Natural Questions](https://huggingface.co/datasets/sentence-transformers/natural-questions)
and [MS MARCO](https://huggingface.co/datasets/sentence-transformers/msmarco), licences per
those cards. Encoder hotchpotch/bekko-embedding-v1-a8m, licence per its model card.
Inverter base [t5-small](https://huggingface.co/google-t5/t5-small), Apache 2.0.
