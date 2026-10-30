"""Tokenizer shared by train.py and refresh.py. `tokens()` in
bsky/my-agent.html mirrors it line for line; change all three or none."""
import re

URL = re.compile(r"https?://\S+|\b[\w-]+(\.[\w-]+)*\.(com|org|net|io|ai|app|dev|social|co|uk)\b\S*", re.A)
TOK = re.compile(r"[a-z0-9_]+")


def tokens(text):
    t = URL.sub(" zzurl ", text.lower())
    w = TOK.findall(t)
    return w + [a + " " + b for a, b in zip(w, w[1:])]


PHRASE = re.compile(r"\bmy\s+agent", re.I)


def has_phrase(text):
    """Bluesky search also returns posts where the words are apart, or where
    the phrase is only in a quoted post or link card; only the text counts."""
    return bool(PHRASE.search(text))


def dedupe_key(day, text):
    """Bots repeat one text hundreds of times; it counts once a day."""
    return (day, " ".join(text.lower().split())[:200])
