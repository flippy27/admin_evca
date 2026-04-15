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
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for @ path alias
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      if (name === '@') {
        return path.join(__dirname);
      }
      return path.join(__dirname, 'node_modules', name);
    },
  }
);

module.exports = config;
