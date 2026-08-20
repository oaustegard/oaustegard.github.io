# Local development

Serve this directory with a server that honours HTTP **Range**:

```bash
python3 -c "import sys,threading;sys.path.insert(0,'dev');from rangeserver import serve;\
s,p=serve('.');print('http://127.0.0.1:%d/shell-search.html'%p);s.serve_forever()"
```

`rangeserver.py` exists because `python3 -m http.server` **ignores Range and
returns the whole file with a 200**. The `.kbc` chunk store is read exclusively
through Range requests, so under the stock server every hit renders the content
of whichever chunk happens to sit at offset 0 — the page looks like it works,
the ranking is right (that comes from the `.kbi`, not the chunk store), and only
the result bodies are silently wrong. GitHub Pages serves Range correctly, so
this only ever bites locally, which is what makes it worth a file.

Verify the server before trusting a local run:

```bash
curl -s -o /dev/null -w '%{http_code} %{size_download}\n' \
  -H 'Range: bytes=100-199' http://127.0.0.1:<port>/shell-search/shell.kbc/shard-0000.bin
# want: 206 100      (not: 200 6115417)
```
