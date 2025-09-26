// Minimal polyfills for React Native
import 'react-native-get-random-values';

// TextEncoder/TextDecoder polyfill for Hermes
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
