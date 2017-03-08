import R from 'ramda'

/*
  Returns an matching items for IDs in selectedItems

  Used to get objects for categories, user groups and tags.
*/
export default function getItemsForIDs (selectedItems, items) {
  return R.map(selectedItem => {
    const matchingItem = R.find(item => item.id === selectedItem)(items)

    return matchingItem || null
  }, selectedItems)
}
