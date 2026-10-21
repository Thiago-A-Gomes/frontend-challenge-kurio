import fs from 'node:fs/promises';
import wawoff2 from 'wawoff2';
import subsetFont from 'subset-font';

// PT: Comprime a mesma fonte variável, preservando glifos, pesos e licença.
// EN: Compresses the same variable font, preserving glyphs, weights and license.
const original = await fs.readFile('public/fonts/RobotoMono-Variable.ttf');
const compressed = await wawoff2.compress(original);
await fs.writeFile('public/fonts/RobotoMono-Variable.woff2', compressed);
// PT: Latin e Latin Extended atendem PT/EN; os outros alfabetos usam a fonte completa.
// EN: Latin and Latin Extended serve PT/EN; other alphabets use the full font.
const latin = Array.from({ length: 0x250 }, (_, index) => String.fromCodePoint(index)).join('') + Array.from({ length: 0xC00 }, (_, index) => String.fromCodePoint(0x2000 + index)).join('');
const subset = await subsetFont(original, latin, { targetFormat: 'woff2', preserveNameIds: [0, 13, 14] });
await fs.writeFile('public/fonts/RobotoMono-Latin.woff2', subset);
console.log(JSON.stringify({ originalBytes: original.length, fullWoff2Bytes: compressed.length, latinWoff2Bytes: subset.length }));
