import React from 'react'

import {Component} from 'react';

let translations =[];
export default class Translation extends Component {
  render(){
    return <span>{translate(this.props.trans)}</span>;
  }
}

export function setTranslations(list) {
  translations = list;
};

export function translate(keyValue) {
  var trans = translations.find(({key}) => key === keyValue);
  return trans ? trans.value : keyValue;
}


