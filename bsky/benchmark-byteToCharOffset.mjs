/**
 * Benchmark: byteToCharOffset implementations
 * Compares original (TextEncoder inside loop) vs optimized (charCodeAt arithmetic)
 */

// ── Original implementation (TextEncoder created inside the loop) ──────────────
function byteToCharOffsetOriginal(str, byteOffset) {
    let currentByte = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const charBytes = new TextEncoder().encode(char).length;
        if (currentByte + charBytes > byteOffset) {
            return i;
        }
        currentByte += charBytes;
    }
    return str.length;
}

// ── Optimized implementation (charCodeAt arithmetic, zero allocations) ────────
function byteToCharOffsetOptimized(str, byteOffset) {
    let currentByte = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        // UTF-8 byte widths — lone surrogates match TextEncoder's U+FFFD fallback (3 bytes)
        const charBytes = code < 0x80 ? 1 : code < 0x800 ? 2 : 3;
        if (currentByte + charBytes > byteOffset) {
            return i;
        }
        currentByte += charBytes;
    }
    return str.length;
}

// ── Correctness check ─────────────────────────────────────────────────────────
const testCases = [
    // [str, byteOffset, description]
    ['Hello', 0, 'ASCII start'],
    ['Hello', 3, 'ASCII mid'],
    ['Hello', 5, 'ASCII end'],
    ['café', 4, 'Latin extended (2-byte char)'],
    ['café', 3, 'before multi-byte char'],
    ['日本語', 3, '3-byte CJK char boundary'],
    ['日本語', 6, 'second CJK char'],
    ['日本語', 9, 'end of string'],
    ['Hello 🌍 World', 6, 'before emoji (surrogate pair)'],
    ['abc', 10, 'offset beyond string length'],
];

console.log('=== Correctness Verification ===\n');
let allPassed = true;
for (const [str, byteOffset, desc] of testCases) {
    const orig = byteToCharOffsetOriginal(str, byteOffset);
    const opt  = byteToCharOffsetOptimized(str, byteOffset);
    const pass = orig === opt;
    if (!pass) allPassed = false;
    console.log(`${pass ? '✓' : '✗'} [${desc}] str="${str}" byteOffset=${byteOffset} → orig=${orig}, opt=${opt}`);
}
console.log(`\nAll tests ${allPassed ? 'PASSED' : 'FAILED'}\n`);

// ── Benchmark ─────────────────────────────────────────────────────────────────
const ITERATIONS = 100_000;

// Build a realistic test string: mix of ASCII, multi-byte, and CJK
const testStr = 'Hello, world! Café au lait. 日本語テスト. More ASCII text here for padding.';

// Find a byte offset in the middle of the string
const encoder = new TextEncoder();
const encoded = encoder.encode(testStr);
const midByteOffset = Math.floor(encoded.length / 2);

console.log(`=== Benchmark ===`);
console.log(`String: "${testStr}"`);
console.log(`String length: ${testStr.length} chars, ${encoded.length} bytes`);
console.log(`Target byte offset: ${midByteOffset}`);
console.log(`Iterations: ${ITERATIONS.toLocaleString()}\n`);

function bench(label, fn) {
    // Warmup
    for (let i = 0; i < 1000; i++) fn(testStr, midByteOffset);

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        fn(testStr, midByteOffset);
    }
    const elapsed = performance.now() - start;
    console.log(`${label}: ${elapsed.toFixed(2)}ms total, ${(elapsed / ITERATIONS * 1000).toFixed(2)}µs/call`);
    return elapsed;
}

const origTime = bench('Original (new TextEncoder() in loop)', byteToCharOffsetOriginal);
const optTime  = bench('Optimized (charCodeAt arithmetic)    ', byteToCharOffsetOptimized);

const speedup = origTime / optTime;
console.log(`\nSpeedup: ${speedup.toFixed(2)}x faster`);
console.log(`Reduction: ${((1 - optTime / origTime) * 100).toFixed(1)}% less time`);
