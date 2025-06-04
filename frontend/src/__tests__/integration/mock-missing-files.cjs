const fs = require('fs')
const path = require('path')

const originalExistsSync = fs.existsSync
const originalReaddirSync = fs.readdirSync

fs.existsSync = function (p) {
  if (p.endsWith(path.join('frontend', '.env.local'))) {
    return false
  }
  return originalExistsSync.call(this, p)
}

fs.readdirSync = function (p, options) {
  let result = originalReaddirSync.call(this, p, options)
  if (p.includes(path.join('frontend', 'src', 'services', 'api'))) {
    result = result.filter((f) => f !== 'config.ts')
  }
  return result
}
