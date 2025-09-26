const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .zkey files
config.resolver.assetExts.push('zkey');

module.exports = config;
