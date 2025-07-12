#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
  const gradlePath = path.join(
    context.opts.projectRoot,
    'platforms',
    'android',
    'app',
    'build.gradle'
  );

  if (!fs.existsSync(gradlePath)) {
    console.warn('[Hook] build.gradle no encontrado.');
    return;
  }

  let buildGradle = fs.readFileSync(gradlePath, 'utf8');

  const packagingBlock = `
    packagingOptions {
        pickFirst 'lib/arm64-v8a/libcrypto.so'
    }
  `;

  if (buildGradle.includes("packagingOptions")) {
    console.log('[Hook] packagingOptions ya está presente. No se modificó.');
    return;
  }

  // Insertar después de 'android {'
  buildGradle = buildGradle.replace(/android\s*{/, match => `${match}\n${packagingBlock}`);

  fs.writeFileSync(gradlePath, buildGradle, 'utf8');
  console.log('[Hook] Se agregó packagingOptions correctamente a build.gradle.');
};