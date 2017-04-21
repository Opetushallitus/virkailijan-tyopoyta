export default function createAlert (options) {
  // Use millisecond timestamp as ID
  const id = Date.now()

  return {
    id,
    ...options
  }
}
