import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Conversão de formato para entrega web; mantém os PNGs originais intactos.
let before = 0, after = 0;
async function walk(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.png$/i.test(file)) {
      const output = file.replace(/\.png$/i, '.webp');
      await sharp(file).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 88 }).toFile(output);
      await sharp(file).resize({ width: 360, withoutEnlargement: true }).webp({ quality: 85 }).toFile(file.replace(/\.png$/i, '-360.webp'));
      await sharp(file).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 87 }).toFile(file.replace(/\.png$/i, '-600.webp'));
      before += fs.statSync(file).size; after += fs.statSync(output).size;
    }
  }
}
await walk('public/images');
console.log(JSON.stringify({ originalBytes: before, webpBytes: after, reductionPercent: Math.round((1 - after / before) * 100) }));
