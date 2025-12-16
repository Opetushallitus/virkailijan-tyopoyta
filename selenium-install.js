// Programmatic selenium-standalone installer that skips Edge drivers
const selenium = require('selenium-standalone')
const fs = require('fs')
const path = require('path')

let finished = false

const findFirst = (dir, predicate) => {
  if (!fs.existsSync(dir)) return null
  const entries = fs.readdirSync(dir)
  for (const entry of entries) {
    const full = path.join(dir, entry)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      const hit = findFirst(full, predicate)
      if (hit) return hit
    } else if (predicate(full)) {
      return full
    }
  }
  return null
}

const ensureExecutable = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.chmodSync(filePath, 0o755)
  }
}

selenium.install(
  {
    drivers: {
      // Use latest drivers to match current browsers
      chrome: { version: 'latest' },
      firefox: { version: 'latest' }
    }
  },
  (err) => {
    // selenium-standalone@6 can invoke the callback twice on certain download errors;
    // guard to avoid "Callback was already called" from async.
    if (finished) return
    finished = true

    if (err) {
      console.error('selenium-standalone install failed:', err)
      process.exit(1)
    }

    // Ensure downloaded binaries are executable (macOS/Linux).
    try {
      const seleniumPkgDir = path.dirname(require.resolve('selenium-standalone/package.json'))
      const base = path.join(seleniumPkgDir, '.selenium')
      const candidates = [
        findFirst(path.join(base, 'selenium-server'), p => p.endsWith('.jar')),
        findFirst(path.join(base, 'chromedriver'), p => p.includes('chromedriver')),
        findFirst(path.join(base, 'geckodriver'), p => p.includes('geckodriver'))
      ]
      candidates.forEach(ensureExecutable)
    } catch (chmodErr) {
      console.warn('Could not chmod selenium binaries:', chmodErr.message)
    }
  }
)
