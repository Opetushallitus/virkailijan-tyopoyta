import React from 'react'
import TextEditor from './TextEditor'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import CategorySelect from './CategorySelect'

export default class EditNotification extends React.Component{

  render(){
    return(
      <div className="editNotification">
        <div className="close" onClick={this.props.onClose}>x</div>
        <div className="sideBySide section">
          <div className="basicInfo">
            <LimitedTextField title="Otsikko" name="title_fi"/>
            <text>Kuvaus</text>
            <TextEditor/>
          </div>
          <div className="basicInfo">
            <LimitedTextField title="Otsikko ruotsiksi" name="title_sv"/>
            <text>Kuvaus ruotsiksi</text>
            <TextEditor/>
          </div>
        </div>
        <div className="section">
          <input id="c1" className="checkbox" type="checkbox"/> Näytä aikajanalla
          <div className="sideBySide">
            <div className="basicInfo">
          <LimitedTextField title="Aikajanan teksti" name="timeline_text_fi"/>
              </div>
            <div className="basicInfo">
          <LimitedTextField title="Aikajanan teksti ruotsiksi" name="timeline_text_sv"/>
              </div>
          </div>
          <DateSelect
            id="date_input"
            title="Tapahtumapäivämäärä aikajanaa varten"
            onDateChange={() => {}}
            onFocusChange={this.onFocusChange}/>
        </div>
        <div className="sideBySide section">
          <div className="basicInfo">
            <div>Kategoria(t)</div>
            <CategorySelect/>
            <TypeSelect/>
          </div>
          <div className="basicInfo">
            <KeywordSelect/>
            <div className="sideBySide">
            <DateSelect
              title="Julkaisupäivämäärä"
              initialDate={moment()}/>
            <DateSelect title="Poistumispäivämäärä"/>
            </div>
          </div>
        </div>
        <div className="save">
          <button>Tallenna sisältö</button>
          </div>
      </div>
    )
  }
}

export class LimitedTextField extends React.Component{

  constructor(){
    super();
    this.state = {text: ""}
  }

  render(){
    const maxLength = 200;
    const title = this.props.title;
    const name = this.props.name;
    return(
      <div className="limitedTextField">
        <text className="textFieldTitle">{title} </text>
        <text className="textFieldLength">{maxLength - this.state.text.length} merkkiä jäljellä</text>
        <input type="text" className="text-input" name={name} onChange={e => this.setState({text: e.target.value})}/>
      </div>
    )
  }
}



export class TypeSelect extends React.Component{

  constructor(){
    super();
    this.state = {selectedType: ''}
    this.types = ['Aikataulupäätös', 'Ohje', 'Materiaali', 'Tiedote', 'Häiriötiedote']
    this.renderType = this._renderType.bind(this);
  }


  _renderType(type){

    let isSelected = this.state.selectedType === type;
    let className = isSelected ? "selected" : "selection";

    return <button className={className} onClick={() => this.setState({selectedType: isSelected ? '' : type})}>{type}</button>
  }

  render(){
    return(
      <div>
        <div>Tyyppi</div>
        <div className="type-select">{this.types.map(t => this.renderType(t))}</div>
      </div>)
  }
}

export class KeywordSelect extends React.Component{
  render(){
    return(
      <div>
        <div>Avainsanat</div>
        <div>Käyttäjäryhmät</div>
        <div>
          <input className="checkbox" type="checkbox"/> Lähetä sähköposti valitulle käyttäjäryhmälle välittömästi
        </div>
      </div>
    )
  }
}

export class DateSelect extends React.Component{

  constructor(){
    super();
    this.state = {startDate: moment()};
    this.inFuture = this._inFuture.bind(this);
  }

  _inFuture(date){
    if(this.props.initialDate){
      return (this.props.initialDate).isBefore(date);
    }
    return true;
  }

  render(){
    return(
      <div className="date-select">
        <div>{this.props.title}</div>
        <DatePicker
          dateFormat="DD.MM.YYYY"
          selected={this.state.startDate}
          onChange={date => this.setState({startDate:date})}
          filterDate={this.inFuture}
        />

      </div>)
  }
}