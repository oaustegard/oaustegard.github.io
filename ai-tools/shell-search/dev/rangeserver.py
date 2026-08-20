"""Static server that honours HTTP Range, which GitHub Pages does and
http.server does not. remax_kb's .kbc chunk store is read exclusively through
Range requests, so a harness without it silently returns the whole shard for
every chunk and the page renders one chunk's content for every hit."""
import http.server, os, re, socketserver, functools

class RangeHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        rng = self.headers.get("Range")
        if not rng:
            return super().send_head()
        path = self.translate_path(self.path)
        if not os.path.isfile(path):
            return super().send_head()
        m = re.match(r"bytes=(\d+)-(\d*)", rng.strip())
        if not m:
            return super().send_head()
        size = os.path.getsize(path)
        start = int(m.group(1))
        end = int(m.group(2)) if m.group(2) else size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_error(416); return None
        f = open(path, "rb"); f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        self._limit = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        if getattr(self, "_limit", None) is None:
            return super().copyfile(source, outputfile)
        remaining, limit = self._limit, self._limit
        self._limit = None
        while remaining > 0:
            buf = source.read(min(64 * 1024, remaining))
            if not buf: break
            outputfile.write(buf); remaining -= len(buf)

    def log_message(self, *a): pass

def serve(directory, ports=range(8970, 9020)):
    h = functools.partial(RangeHandler, directory=directory)
    socketserver.TCPServer.allow_reuse_address = True
    for port in ports:
        try: return socketserver.TCPServer(("127.0.0.1", port), h), port
        except OSError: continue
    raise RuntimeError("no free port")
