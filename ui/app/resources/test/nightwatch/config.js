const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, 'environments.js')

// Load credentials either from the legacy environments.js (gitignored) or env vars.
const loadLuokkaConfig = () => {
  if (fs.existsSync(envPath)) {
    // Prefer the project-local config if present
    return require(envPath).luokka
  }

  const url = process.env.LUOKKA_URL
  const username = process.env.LUOKKA_USERNAME
  const password = process.env.LUOKKA_PASSWORD

  if (!url || !username || !password) {
    throw new Error(
      'Nightwatch test credentials missing. Provide ui/app/resources/test/nightwatch/environments.js or set LUOKKA_URL, LUOKKA_USERNAME, LUOKKA_PASSWORD.'
    )
  }

  return { url, username, password }
}

module.exports = {
  luokka: loadLuokkaConfig(),
  dateFormat: 'D.M.YYYY',
  id: name => `[data-selenium-id="${name}"]`
}
