// Returns a string of '?key=value&key=value...' from params object
function getSearchParamsString (params) {
  const keys = Object.keys(params)
  const values = keys.map(key => params[key])

  return keys.reduce((previous, current, index) => {
    return `${previous}${index ? '&' : ''}${current}=${values[index]}`
  }, '?')
}

function getData (options) {
  const minute = 60000

  const {
    url,
    searchParams = null,
    time = minute,
    requestOptions = {},
    onSuccess,
    onError
  } = options

  const urlWithParams = `${url}${searchParams ? getSearchParamsString(searchParams) : ''}`

  // Don't cache responses, since IE11 always returns the cached response
  requestOptions.headers = requestOptions.headers || {}
  requestOptions.headers['Cache-Control'] = 'no-store'
  requestOptions.headers['Pragma'] = 'no-cache'

  const timeout = new Promise((resolve, reject) => {
    setTimeout(reject, time)
  })

  const request = window.fetch(urlWithParams, requestOptions)
    .then(response => response.json())

  return Promise
    .race([timeout, request])
    .then(json => onSuccess(json))
    .catch(error => {
      console.error(error)
      onError(error)
    })
}

export default getData