module.exports = {
  luokka: require('./environments').luokka,
  dateFormat: 'D.M.YYYY',
  id: name => `[data-selenium-id="${name}"]`
}
