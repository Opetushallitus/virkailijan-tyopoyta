import React from 'react'
import TextEditor from './editor/TextEditor'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import CategorySelect from './CategorySelect'

const EditNotification = ({document, controller, onClose}) => {

  return(
    <div className="editNotification">
      <span className="icon-close closeDialog" onClick={onClose}/>
      <div className="sideBySide section">
        <div className="basicInfo">
          <LimitedTextField title="Otsikko"
                            text={document.content.fi.title}
                            onChange={controller.updateDocumentContent('fi', 'title')}
          />
          <text>Kuvaus</text>
          <TextEditor data={document.content.fi.text}
                      save={controller.updateDocumentContent('fi', 'text')}/>
        </div>
        <div className="basicInfo">
          <LimitedTextField title="Otsikko ruotsiksi"
                            text={document.content.sv.title}
                            onChange={controller.updateDocumentContent('sv', 'title')}/>
          <text>Kuvaus ruotsiksi</text>
          <TextEditor data={document.content.sv.text}
                      save={controller.updateDocumentContent('sv', 'text')}/>
        </div>
      </div>
      <div className="section">
        <input type="checkbox"/> Näytä aikajanalla
        <div className="sideBySide">
          <div className="basicInfo">
            <LimitedTextField title="Aikajanan teksti" name="timeline_text_fi"
                              onChange={controller.updateDocumentContent('fi', 'timelineText')}
                              text={document.content.fi.timelineText}/>
          </div>
          <div className="basicInfo">
            <LimitedTextField title="Aikajanan teksti ruotsiksi"
                              name="timeline_tefxt_sv"
                              onChange={controller.updateDocumentContent('sv', 'timelineText')}
                              text={document.content.sv.timelineText}/>
          </div>
        </div>
        <DateSelect
          id="date_input"
          title="Tapahtumapäivämäärä aikajanaa varten"
          onChange={controller.updateDocument('timelineDate')}
          />
      </div>
      <div className="sideBySide section">
        <div className="basicInfo">
          <div>Kategoria(t)</div>
          <CategorySelect
            className="category-wrapper"
            onChange={controller.updateDocument('categories')}/>
          <TypeSelect selectedType={document.type} onChange={controller.updateDocument('type')}/>
        </div>
        <div className="basicInfo">
          <KeywordSelect/>
          <div className="sideBySide">
          <DateSelect
            title="Julkaisupäivämäärä"
            onChange={controller.updateDocument('publishDate')}
            date={document.publishDate}
            />
          <DateSelect
            title="Poistumispäivämäärä"
            onChange={controller.updateDocument('expiryDate')}
            date={document.expiryDate}
          />
          </div>
        </div>
      </div>
      <div className="save">
        <button onClick={controller.saveDocument}>Tallenna sisältö</button>
        </div>
    </div>
  )
};

export default EditNotification;

const LimitedTextField = ({title, text, onChange}) => {

  const maxLength = 200;

  return(
    <div className="limitedTextField">
      <text className="textFieldTitle">{title} </text>
      <text className="textFieldLength">{maxLength - text.length} merkkiä jäljellä</text>
      <input maxLength = {maxLength} type="text" className="text-input"
             value={text}
             onChange={e => onChange(e.target.value)}/>
    </div>
  )
};

const TypeSelect = ({selectedType, onChange}) => {

  const types = ['Aikataulupäätös', 'Ohje', 'Materiaali', 'Tiedote', 'Häiriötiedote'];

  const renderType = (type) => {

    const isSelected = selectedType === type;
    const className = "type-button" + (isSelected ? " selected" : " selection");

    return <span key={type} className={className} onClick={() => onChange(isSelected ? '' : type)}>{type}</span>
  };

  return(
    <div>
      <div>Tyyppi</div>
      <div className="type-select">{types.map(t => renderType(t))}</div>
    </div>)
};

const KeywordSelect = () => {
    return(
      <div>
        <div>Avainsanat</div>
        <div>Käyttäjäryhmät</div>
        <div>
          <input className="checkbox" type="checkbox"/> Lähetä sähköposti valitulle käyttäjäryhmälle välittömästi
        </div>
      </div>
    )
};

const DateSelect = ({date, onChange, title, initialDate}) => {

  const lowerLimit = initialDate ? moment(initialDate) : moment();

  const inFuture = (date) => lowerLimit.isBefore(date);

  return(
    <div className="date-select">
      <div>{title}</div>
      <DatePicker
        dateFormat="DD.MM.YYYY"
        locale='fi'
        selected={date ? moment(date, "DD.MM.YYYY") : lowerLimit}
        onChange={date => onChange(date.format("DD.MM.YYYY"))}
        filterDate={inFuture}
      />
    </div>)
};