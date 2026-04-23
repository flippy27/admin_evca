#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const args = process.argv.slice(2);
const platform = (args[0] || process.env.MAESTRO_PLATFORM || 'android').toLowerCase();
const mode = (args[1] || process.env.MAESTRO_MODE || 'all').toLowerCase();
const explicitAppId = process.env.APP_ID;
const appVariant = process.env.APP_VARIANT || 'production';
const isPreview = appVariant === 'development' || appVariant === 'staging';
const defaultAppId = isPreview ? 'com.example.rnexpothree.dev' : 'com.example.rnexpothree';
const appId = explicitAppId || defaultAppId;

let target = '.maestro';
if (mode === 'smoke') {
  target = '.maestro/flows/01_home_smoke.yaml';
} else if (mode.endsWith('.yaml') || mode.endsWith('.yml')) {
  target = mode;
}

const maestroArgs = ['test', target, '-e', `APP_ID=${appId}`, '--platform', platform];

console.log(`\n▶ Running Maestro`);
console.log(`   platform   : ${platform}`);
console.log(`   appVariant : ${appVariant}`);
console.log(`   appId      : ${appId}`);
console.log(`   target     : ${target}\n`);

const result = spawnSync('maestro', maestroArgs, {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

if (result.error) {
  console.error('No pude ejecutar Maestro. Asegúrate de tener instalado el CLI y Java 17+.');
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
