// StorageSink implementations for FileDrop (scripts/fd/PROTOCOL.md).
//
// Two sinks, one interface:
//   MemorySink — accumulates bytes in RAM, closeFile() returns a Blob. Fallback
//                path when the File System Access API isn't available.
//   FsaSink    — streams verified chunks straight to disk via the File System
//                Access API (showSaveFilePicker / showDirectoryPicker).
//                closeFile() returns { blob: null } since bytes already landed
//                on disk.
//
// Pure ES module: no top-level access to `window`/`document`; the only FSA
// globals referenced (`globalThis.showSaveFilePicker`, `showDirectoryPicker`)
// are read lazily inside the default picker functions and `storageAvailable`,
// so this module imports cleanly under Node where they don't exist.

function toUint8(data) {
  if (data instanceof Uint8Array) return data;
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return new Uint8Array(data);
}

// --- MemorySink -------------------------------------------------------

export class MemorySink {
  constructor() {
    this._meta = null;
    this._files = new Map(); // fid -> { meta, buf: Uint8Array }
  }

  async begin(collectionMeta) {
    this._meta = collectionMeta;
  }

  async openFile(fileMeta) {
    const handle = { meta: fileMeta, buf: new Uint8Array(fileMeta.size) };
    this._files.set(fileMeta.fid, handle);
    return handle;
  }

  async write(fileHandle, offset, bytes) {
    fileHandle.buf.set(toUint8(bytes), offset);
  }

  async closeFile(fileHandle) {
    const blob = new Blob([fileHandle.buf], { type: fileHandle.meta.mime || 'application/octet-stream' });
    return { blob };
  }

  async finish() {
    const summary = { id: this._meta ? this._meta.id : undefined };
    this._files.clear();
    return summary;
  }

  async abort() {
    this._files.clear();
  }
}

// --- FsaSink ------------------------------------------------------------

async function defaultPickSaveFile(suggestedName) {
  return globalThis.showSaveFilePicker({ suggestedName });
}

async function defaultPickDirectory() {
  return globalThis.showDirectoryPicker();
}

export class FsaSink {
  constructor(opts = {}) {
    this.pickSaveFile = opts.pickSaveFile || defaultPickSaveFile;
    this.pickDirectory = opts.pickDirectory || defaultPickDirectory;
    this.preferDirectory = !!opts.preferDirectory;
    this._meta = null;
    this._dirHandle = null;
    this._useDirectory = false;
    this._open = new Set(); // writables opened but not yet closed (for abort())
  }

  async begin(collectionMeta) {
    this._meta = collectionMeta;
    const files = collectionMeta.files || [];
    const hasPaths = files.some((f) => typeof f.name === 'string' && f.name.includes('/'));
    this._useDirectory = this.preferDirectory || hasPaths;
    if (this._useDirectory && !this._dirHandle) {
      this._dirHandle = await this.pickDirectory();
    }
  }

  async _resolveDirFileHandle(name) {
    const parts = name.split('/');
    const base = parts.pop();
    let dir = this._dirHandle;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: true });
    }
    return dir.getFileHandle(base, { create: true });
  }

  async openFile(fileMeta) {
    const fileHandle = this._useDirectory
      ? await this._resolveDirFileHandle(fileMeta.name)
      : await this.pickSaveFile(fileMeta.name);
    const writable = await fileHandle.createWritable();
    const handle = { meta: fileMeta, fileHandle, writable };
    this._open.add(handle);
    return handle;
  }

  async write(fileHandle, offset, bytes) {
    await fileHandle.writable.write({ type: 'write', position: offset, data: toUint8(bytes) });
  }

  async closeFile(fileHandle) {
    await fileHandle.writable.close();
    this._open.delete(fileHandle);
    return { blob: null };
  }

  async finish() {
    return { id: this._meta ? this._meta.id : undefined };
  }

  async abort() {
    for (const handle of this._open) {
      try {
        if (handle.writable.abort) await handle.writable.abort();
        else await handle.writable.close();
      } catch {
        // best-effort; nothing more we can do here
      }
    }
    this._open.clear();
  }
}

// --- capability check -----------------------------------------------------

export function storageAvailable() {
  return typeof globalThis.showSaveFilePicker === 'function' || typeof globalThis.showDirectoryPicker === 'function';
}
