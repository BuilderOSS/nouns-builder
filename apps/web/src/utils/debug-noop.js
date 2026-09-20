// No-op replacement for debug package in production builds
// This file replaces the debug module via webpack.NormalModuleReplacementPlugin
// Result: All debug() calls become empty functions that get optimized away

function noop() {}
noop.enabled = false

module.exports = function () {
  return noop
}

// Support both default and named exports
module.exports.default = module.exports
