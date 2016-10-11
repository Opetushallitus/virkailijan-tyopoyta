import React from 'react'

export default class CategorySelect extends React.Component{

  constructor(){
    super();
    this.categories = ['Perusopetus', 'Ammatillinen koulutus', 'Korkeakoulutus', 'Lukiokoulutus'];
    this.state = {selectedCategories: []};
    this.renderCategory = this._renderCategory.bind(this)
  }

  _renderCategory(category){

    let selectedCategories = this.state.selectedCategories;
    let isSelected = selectedCategories.indexOf(category) >= 0;


    let className = isSelected ? "category-selected" : "category-select";

    let toggleSelection = () => {

      if(isSelected){
        this.setState({selectedCategories: selectedCategories.filter(c => c != category)});
      } else {
        this.setState({selectedCategories: selectedCategories.concat(category)});
      }
    };

    return(<button className={className} onClick={toggleSelection}>{category}</button>)
  }

  render(){
    return(
      <div>
        {this.categories.map(c => this.renderCategory(c))}
      </div>)
  }
}