import React from 'react'
import R from 'ramda'
import TextEditor from './editor/TextEditor'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import CategorySelect from './CategorySelect'

const EditRelease = ({release, controller, onClose}) => {

  const notification = release.notification;
  console.log("Release: "+ JSON.stringify(release))
  const timelineItem = R.head(release.timeline);

  return(
    <div className="editNotification">
      <span className="icon-close closeDialog" onClick={onClose}/>
      <div className="sideBySide section">
        <div className="basicInfo">
          <LimitedTextField title="Otsikko"
                            text={notification.content.fi.title}
                            onChange={controller.updateNotificationContent('fi', 'title')}
          />
          <text>Kuvaus</text>
          <TextEditor data={notification.content.fi.text}
                      save={controller.updateNotificationContent('fi', 'text')}/>
        </div>
        <div className="basicInfo">
          <LimitedTextField title="Otsikko ruotsiksi"
                            text={notification.content.sv.title}
                            onChange={controller.updateNotificationContent('sv', 'title')}/>
          <text>Kuvaus ruotsiksi</text>
          <TextEditor data={notification.content.sv.text}
                      save={controller.updateNotificationContent('sv', 'text')}/>
        </div>
      </div>
      <div className="section">
        <div className="sideBySide">
          <div className="basicInfo">
            <LimitedTextField title="Aikajanan teksti" name="timeline_text_fi"
                              onChange={controller.updateTimelineContent(0, 'fi', 'text')}
                              text={timelineItem.content.fi.text}/>
          </div>
          <div className="basicInfo">
            <LimitedTextField title="Aikajanan teksti ruotsiksi"
                              onChange={controller.updateTimelineContent(0, 'sv', 'text')}
                              text={timelineItem.content.sv.text}/>
          </div>
        </div>
        <DateSelect
          id="date_input"
          title="Tapahtumapäivämäärä aikajanaa varten"
          onChange={controller.updateTimeline(0, 'date')}
          date={timelineItem.date}
          />
      </div>
      <div className="sideBySide section">
        <div className="basicInfo">
          <div>Kategoria(t)</div>
          <CategorySelect
            selectedCategories={release.categories}
            className="category-wrapper"
            toggleCategory={controller.toggleEditorCategory}/>
        </div>
        <div className="basicInfo">
          <KeywordSelect/>
          <div className="sideBySide">
          <DateSelect
            title="Julkaisupäivämäärä"
            onChange={controller.updateNotification('publishDate')}
            date={notification.publishDate}
            />
          <DateSelect
            title="Poistumispäivämäärä"
            onChange={controller.updateNotification('expiryDate')}
            date={notification.expiryDate}
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

export default EditRelease;

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