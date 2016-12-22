import React from 'react'

import CheckboxButton from './CheckboxButton'

const classList = [
  "mb1",
  "mr1",
  "lg-mb0",
  "p1"
]

const isChecked = (selectedCategories, id) => {
  return selectedCategories.indexOf(id) >= 0
}

function CategorySelect (props) {
  const {
    locale,
    categories,
    selectedCategories,
    toggleCategory
  } = props

  return (
    <div>
      {
        categories.map((category, index) =>
          <CheckboxButton
            key={category.id}
            id={`category.${category.id}`}
            classList={classList.join(' ')}
            label={category[`name_${locale}`]}
            toggleCategory={toggleCategory}
            isChecked={isChecked(selectedCategories, category.id)}
            onChange={() => toggleCategory(category.id)}
          />
        )
      }
    </div>
  )
}

export default CategorySelect
