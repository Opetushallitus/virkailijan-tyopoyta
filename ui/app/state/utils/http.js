// Returns a string of '?key=value&key=value...' from params object
function getSearchParamsString (params) {
  const keys = Object.keys(params)
  const values = keys.map(key => params[key])

  return keys.reduce((previous, current, index) => {
    return `${previous}${index ? '&' : ''}${current}=${values[index]}`
  }, '?')
}

// Does an HTTP request
export default function http (options) {
  const minute = 60000

  const {
    url,
    searchParams = null,
    maxRequestTime = minute,
    requestOptions = {},
    onSuccess = () => {},
    onError = () => {}
  } = options

  const urlWithParams = `${url}${searchParams ? getSearchParamsString(searchParams) : ''}`

  requestOptions.headers = requestOptions.headers || {}

  // Don't cache responses, since IE11 always returns the cached response
  requestOptions.headers['Cache-Control'] = 'no-store'
  requestOptions.headers['Pragma'] = 'no-cache'

  // Set credentials: same-origin to allow sending cookies
  requestOptions.credentials = 'same-origin'

  // Timeout after maxRequestTime
  const timeout = new Promise((resolve, reject) => {
    setTimeout(reject, maxRequestTime)
  })

  const request = window.fetch(urlWithParams, requestOptions)
    .then(response => response.json())

  // Return the request or timeout depending which resolves first
  return Promise
    .race([timeout, request])
    .then(json => onSuccess(json))
    .catch(error => {
      console.error(error)

      onError(error)
    })
}