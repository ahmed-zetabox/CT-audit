#!/usr/bin/env node

/*
  Postinstall script to patch native modules for RN 0.77 compatibility
 */

const fs = require('fs');
const path = require('path');

// Helper function to patch a file
function patchFile(filePath, patches, description) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, { encoding: 'utf8' });
  let originalContent = content;
  
  patches.forEach(({ search, replace }) => {
    content = content.replace(search, replace);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log(`✓ Patched: ${description}`);
    return true;
  }
  return false;
}

// List of libraries to patch for SDK 34
const librariesToPatch = [
  'react-native-wifi-reborn',
  'rn-fetch-blob',
  'react-native-charts-wrapper',
  'react-native-system-setting',
  'react-native-mail',
  'react-native-splash-screen',
  'react-native-document-picker',
  'react-native-file-viewer',
  'react-native-view-shot',
  'react-native-localize',
  'react-native-progress-circle',
  '@react-native-community/checkbox',
  '@react-native-community/datetimepicker',
];

librariesToPatch.forEach(lib => {
  const gradlePath = path.resolve(__dirname, `../node_modules/${lib}/android/build.gradle`);
  patchFile(gradlePath, [
    { search: /compileSdkVersion\s+\d+/g, replace: 'compileSdkVersion 34' },
    { search: /targetSdkVersion\s+\d+/g, replace: 'targetSdkVersion 34' },
    { search: /buildToolsVersion\s+["'][\d.]+["']/g, replace: 'buildToolsVersion "34.0.0"' },
  ], `${lib} for SDK 34`);
});

console.log('Postinstall patches complete!');
