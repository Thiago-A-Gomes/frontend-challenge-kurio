import fs from 'node:fs';
import path from 'node:path';

// Impede dependências invertidas e importação de fixtures pela interface.
let errors = 0;
function walk(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!/\.tsx?$/.test(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:from\s+|import\s+)['"]([^'"]+)['"]/g)) {
      if (!match[1].startsWith('.')) continue;
      const target = path.resolve(path.dirname(file), match[1]).replaceAll('\\', '/');
      const relative = file.replaceAll('\\', '/');
      const illegal = relative.startsWith('src/shared/') && /\/src\/(app|pages|widgets|features|mocks)\//.test(target)
        || relative.startsWith('src/features/') && /\/src\/(app|pages|widgets|mocks)\//.test(target)
        || !relative.startsWith('src/mocks/') && target.includes('/src/mocks/') && !relative.endsWith('src/main.tsx');
      if (illegal) { console.error(`${file}: dependência não permitida: ${match[1]}`); errors++; }
    }
    if (/dangerouslySetInnerHTML|\beval\s*\(|new Function\s*\(/.test(source)) { console.error(`${file}: execução ou HTML dinâmico exige revisão de segurança.`); errors++; }
  }
}
walk('src');
if (errors) process.exitCode = 1; else console.log('Arquitetura: dependências verificadas, sem importações proibidas ou sinks dinâmicos.');
