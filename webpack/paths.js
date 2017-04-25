const path = require('path')

module.exports = {
  dev: path.join(__dirname, '../target/scala-2.11/classes/ui'),
  build: path.join(__dirname, '../src/main/resources/ui'),
  app: path.join(__dirname, '../ui/app'),
  style: path.join(__dirname, '../ui/app/resources/styles/app.css'),
  images: path.join(__dirname, '../ui/app/resources/img'),
  fonts: path.join(__dirname, '../ui/app/resources/fonts')
}
