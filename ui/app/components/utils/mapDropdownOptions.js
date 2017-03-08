/*

  Map options to React Semantic UI Dropdown's options:
  [
    {
      value: [option's id],
      text: [option's name]
    },
    ...
  ]
*/

export default function mapDropdownOptions (options) {
  return options.map(option => ({
    value: option.id,
    text: option.name
  }))
}
