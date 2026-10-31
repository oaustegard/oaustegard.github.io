// The host's side of a table game: who sits where, and how a question reaches each seat.
// A seat is 'me' (the host's own screen), 'bot' (the computer, on the host) or 'remote' (a friend's
// phone over HostNet). The game loop calls `ask(seat, kind, options)` and awaits an action; the seat's
// kind decides whether a bot answers after a short pause, the host taps a button, or a guest replies
// over the channel. Every push sends each guest only `view(seat)`, the part of the state its seat may see.
//
// Guest protocol (on top of net.js): host → guest { t: 'state', view, prompt, info };
// guest → host { t: 'act', id, action } answers the prompt with that id.

const sleep = ms => new Promise(r => setTimeout(r, ms));

export class SeatTable {
  // opts:
  //   count               number of seats
  //   bot(seat, kind, options)    → the computer's action for that seat (synchronous)
  //   view(seat)          → what that seat may see right now, or null before a game starts
  //   info(seat)          → table-wide extras for that seat (names, scores…)
  //   local(view, prompt, info)   draws the host's own seat
  //   botDelay(kind, action)      → ms a bot waits before answering (default 600)
  //   timeout(kind)       → ms before a remote seat's question is answered by the bot (default 60000, 0 = never)
  //   hostSeat            the host's seat index (default 0)
  constructor(opts) {
    this.o = opts;
    this.count = opts.count;
    this.hostSeat = opts.hostSeat ?? 0;
    this.kinds = Array.from({ length: this.count }, (_, s) => (s === this.hostSeat ? 'me' : 'bot'));
    this.names = Array.from({ length: this.count }, () => '');
    this.pending = Array(this.count).fill(null);   // per seat: { id, kind, options, resolve, timer }
    this.seq = 0;
    this.net = null;
  }

  prompt(seat) { const p = this.pending[seat]; return p ? { id: p.id, kind: p.kind, options: p.options } : null; }

  pushAll() {
    for (let s = 0; s < this.count; s++) {
      if (this.kinds[s] !== 'remote' || !this.net) continue;
      const view = this.o.view(s);
      if (view) this.net.send(s, { t: 'state', view, prompt: this.prompt(s), info: this.o.info(s) });
    }
    const hv = this.o.view(this.hostSeat);
    if (hv) this.o.local(hv, this.prompt(this.hostSeat), this.o.info(this.hostSeat));
  }

  ask(seat, kind, options) {
    if (this.kinds[seat] === 'bot') {
      const a = this.o.bot(seat, kind, options);
      const delay = this.o.botDelay ? this.o.botDelay(kind, a) : 600;
      return sleep(delay).then(() => a);
    }
    return new Promise(resolve => {
      const p = { id: ++this.seq, kind, options, resolve: null, timer: null };
      p.resolve = a => { if (this.pending[seat] !== p) return; clearTimeout(p.timer); this.pending[seat] = null; resolve(a); };
      this.pending[seat] = p;
      if (this.kinds[seat] === 'remote') {
        // A friend who wanders off: the computer answers for them after the timeout.
        const ms = this.o.timeout ? this.o.timeout(kind) : 60000;
        if (ms > 0) p.timer = setTimeout(() => p.resolve(this.o.bot(seat, kind, options)), ms);
      }
      this.pushAll();
    });
  }

  // An answer from the host's screen or a guest. Ignored unless it matches the open question.
  answer(seat, id, action) {
    const p = this.pending[seat];
    if (p && p.id === id) p.resolve(action);
  }

  // Resolve every open question with the bot's answer (when the game is torn down, say).
  flush() { for (let s = 0; s < this.count; s++) { const p = this.pending[s]; if (p) p.resolve(this.o.bot(s, p.kind, p.options)); } }

  // A seat whose friend left goes back to the computer, including any question it was holding.
  toBot(seat, name) {
    this.kinds[seat] = 'bot';
    if (name != null) this.names[seat] = name;
    const p = this.pending[seat];
    if (p) p.resolve(this.o.bot(seat, p.kind, p.options));
    this.pushAll();
  }

  toRemote(seat, name) {
    this.kinds[seat] = 'remote';
    this.names[seat] = name;
    // A question the bot had not answered yet stays with the seat; the guest sees it on the next push.
    this.pushAll();
  }

  broadcast(msg) { if (this.net) for (let s = 0; s < this.count; s++) if (this.kinds[s] === 'remote') this.net.send(s, msg); }
}
