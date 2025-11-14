#!/usr/bin/env node

/*
  Fixes react-native-ble-plx@1.1.1 build on android for RN 0.62
  See issue https://github.com/Polidea/react-native-ble-plx/issues/663
 */

const fs = require('fs');
const path = require('path');

const RN_BLEPLX_BUILDGRADLE = path.resolve(
  __dirname,
  '../',
  'node_modules',
  'react-native-ble-plx',
  'android',
  'build.gradle',
);
if (!fs.existsSync(RN_BLEPLX_BUILDGRADLE)) {
  console.error('react-natibe-ble-plx not installed.');
  process.exit(1);
}

console.debug(
  'Updating file ' +
    path.relative(__dirname, RN_BLEPLX_BUILDGRADLE) +
    ' so it builds with RN 0.62',
);
const buildGradleText = fs.readFileSync(RN_BLEPLX_BUILDGRADLE, {
  encoding: 'utf8',
});
const fixedGradleText = buildGradleText.replace(
  "apply plugin: 'groovyx.android'",
  '',
);
fs.writeFileSync(RN_BLEPLX_BUILDGRADLE, fixedGradleText, {encoding: 'utf8'});
console.debug('react-native-ble-plx@1.1.1 updated!');
