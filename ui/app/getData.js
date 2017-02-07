function getData (options) {
  const minute = 60000

  const {
    url,
    time = minute,
    requestOptions = {},
    onSuccess,
    onError
  } = options

  // Don't cache responses, since IE11 always returns the cached response
  requestOptions.headers = requestOptions.headers || {}
  requestOptions.headers['Cache-Control'] = 'no-store'
  requestOptions.headers['Pragma'] = 'no-cache'

  const timeout = new Promise((resolve, reject) => {
    setTimeout(reject, time)
  })

  const request = window.fetch(url, requestOptions)
    .then(response => response.json())

  return Promise
    .race([timeout, request])
    .then(json => onSuccess(json))
    .catch(error => onError(error))
}

export default getData
