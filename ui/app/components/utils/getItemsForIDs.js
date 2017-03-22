/*
  Returns an array of items matching IDs in selectedItems. If matching item isn't found, filter it out.

  Used to get objects for categories, user groups and tags.
*/
export default function getItemsForIDs (selectedItems, items) {
  return selectedItems
    .map(selectedItem => {
      return items.find(item => item.id === selectedItem)
    })
    .filter(item => {
      if (item) {
        return item
      }
    })
}
