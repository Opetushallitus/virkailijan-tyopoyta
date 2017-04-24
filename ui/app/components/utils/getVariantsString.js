// Returns a string of 'oph-{component}-{variant}, ...' for setting variant classes to components
export default function getVariantsString (component, variants) {
  return variants.map(variant => `oph-${component}-${variant}`).join(' ')
}
