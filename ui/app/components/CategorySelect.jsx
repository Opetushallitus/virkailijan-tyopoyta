import React from 'react'

export default class CategorySelect extends React.Component{

  constructor(props){
    super();
    this.categories = ['Perusopetus', 'Ammatillinen koulutus', 'Korkeakoulutus', 'Lukiokoulutus'];
    this.state = {selectedCategories: []};
    this.className = (props.className ? props.className : '');
    this.renderCategory = this._renderCategory.bind(this)
  }

  _renderCategory(category){

    let selectedCategories = this.state.selectedCategories;
    let isSelected = selectedCategories.indexOf(category) >= 0;


    let className = "category "+ (isSelected ? "selected" : "");

    let toggleSelection = () => {

      if(isSelected){
        this.setState({selectedCategories: selectedCategories.filter(c => c != category)});
      } else {
        this.setState({selectedCategories: selectedCategories.concat(category)});
      }
    };

    return(<span className={className} onClick={toggleSelection}>
      {isSelected ? <span className="icon-check"/> :''} {category}</span>)
  }

  render(){
    return(
      <div className={this.className}>
        {this.categories.map(c => this.renderCategory(c))}
      </div>)
  }
}