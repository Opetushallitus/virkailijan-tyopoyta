// Adds animation CSS classes to node and removes them after timeout
export default function animate (options) {
  const {
    node,
    animation,
    duration
  } = options

  if (node.classList.contains('is-animating')) {
    return
  }

  const animationCSSClass = `animation-${animation}`

  node.classList.add('is-animated', 'is-animating', animationCSSClass)

  setTimeout(() => {
    node.classList.remove('is-animated', 'is-animating', animationCSSClass)
  }, duration)
}
