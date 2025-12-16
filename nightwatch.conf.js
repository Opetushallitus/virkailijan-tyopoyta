const fs = require('fs')
const path = require('path')

const seleniumPkgDir = path.dirname(require.resolve('selenium-standalone/package.json'))
const seleniumBase = path.join(seleniumPkgDir, '.selenium')
const nightwatchBase = path.join(__dirname, 'ui/app/resources/test/nightwatch')

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

const chromeDriver = findFirst(seleniumBase, p => p.endsWith('chromedriver') || p.endsWith('chromedriver.exe'))

if (!chromeDriver) {
  console.warn('ChromeDriver not found. Run `pnpm e2e-setup` to install drivers.')
}

module.exports = {
  src_folders: [
    path.join(nightwatchBase, 'smoketests'),
    path.join(nightwatchBase, 'componentTests')
  ],
  output_folder: path.join(nightwatchBase, 'reports'),
  // Disable legacy auto-loading of files as custom commands; page commands are defined in pageObjects.js
  custom_commands_path: [],
  custom_assertions_path: '',
  // Only load the actual page object definition from the reports folder (contains pageObjects.js).
  page_objects_path: [path.join(nightwatchBase, 'reports')],
  // Nightwatch resolves globals_path relative to the working directory; keep it relative
  // to avoid double-prefixing the absolute path during resolution.
  globals_path: path.join('ui/app/resources/test/nightwatch', 'config.js'),

  test_settings: {
    default: {
      launch_url: 'http://localhost:8081/virkailijan-tyopoyta',
      webdriver: {
        start_process: true,
        // Talk directly to chromedriver to avoid starting the Selenium server,
        // which cannot bind a port in this environment.
        server_path: chromeDriver || '',
        port: 9515,
        default_path_prefix: '',
        cli_args: {
          // chromedriver accepts --port=<n>; nightwatch will append it.
          port: 9515
        }
      },
      screenshots: {
        enabled: true,
        path: path.join(nightwatchBase, 'reports', 'screenshots')
      },
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['--no-sandbox']
        },
        acceptInsecureCerts: true
      }
    }
  }
}
