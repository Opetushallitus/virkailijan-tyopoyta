import React from 'react'


const CategorySelect = ({selectedCategories, className, toggleCategory}) => {
  const categories = ['Perusopetus', 'Ammatillinen koulutus', 'Korkeakoulutus', 'Lukiokoulutus'];

  const renderCategory = category => {
    const isSelected = selectedCategories.indexOf(category) >= 0;
    const selectionClass = "category "+ (isSelected ? "selected" : "");

    return(<span key={category} className={selectionClass} onClick={() => toggleCategory(category, !isSelected)}>
      {isSelected ? <span className="icon-check"/> :''} {category}</span>)
  };

  return(
    <div className={className}>
      {categories.map(c => renderCategory(c))}
    </div>)
};

export default CategorySelect