/*

  Map options to Semantic UI Dropdown's options:
  [
    {
      value: [options' id],
      text: [options' localized text]
    },
    ...
  ]
*/

export default function mapDropdownOptions (options, locale) {
  return options.map(option => ({
    value: option.id,
    text: option['name_' + locale]
  }))
}
