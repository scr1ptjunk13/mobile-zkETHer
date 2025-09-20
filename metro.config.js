const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = { buffer: require.resolve('buffer') };
config.resolver.fallback = { buffer: require.resolve('buffer') };
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
