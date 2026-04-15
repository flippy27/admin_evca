if (typeof URL.canParse !== 'function') {
  URL.canParse = function(input, base) {
    try {
      new URL(input, base);
      return true;
    } catch {
      return false;
    }
  };
}
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
