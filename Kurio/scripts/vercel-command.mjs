import { spawnSync } from 'node:child_process';

// PT: Traduz a opção legada do ambiente para o nome de cache aceito pelo npm.
// EN: Translate the legacy environment option into npm's supported cache setting.
const env = { ...process.env };
let legacyCache;
for (const key of Object.keys(env)) {
  if (key.toLowerCase() === 'npm_config_cache_dir') {
    legacyCache = env[key];
    delete env[key];
  }
}
if (legacyCache && !Object.keys(env).some((key) => key.toLowerCase() === 'npm_config_cache')) {
  env.npm_config_cache = legacyCache;
}

// PT: Somente comandos fixos; argumentos externos não são repassados ao shell.
// EN: Fixed commands only; external arguments are never forwarded to the shell.
const commands = { install: ['ci'], build: ['run', 'build'] };
const args = commands[process.argv[2]];
if (!args) throw new Error('Use vercel-command.mjs install ou build.');
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
  env, stdio: 'inherit', shell: process.platform === 'win32',
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
