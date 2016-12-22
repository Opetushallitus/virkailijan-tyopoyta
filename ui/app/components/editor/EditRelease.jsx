import React from 'react'
import R from 'ramda'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import { Dropdown } from 'semantic-ui-react';
import mapDropdownOptions  from '../utils/mapDropdownOptions';

import TextEditor from './TextEditor'
import CategorySelect from '../CategorySelect'
import Field from '../Field'
import Fieldset from '../Fieldset'
import Checkbox from '../Checkbox'
import Button from '../Button'

const handleOnChange = (controller, event, { value }) => {
  controller.updateNotificationTags(value);
}

const handleOnLabelClick = (controller, event, { value }) => {
  controller.updateNotificationTags(value)
}

function LimitedTextarea (props) {
  const {
    label,
    name,
    value,
    rows,
    maxLength,
    isRequired,
    onChange
  } = props;

  return (
    <Field
      isRequired={isRequired}
      label={label}
      name={name}
    >
      <div className="muted md-right mb1 md-mb0">{maxLength - value.length} merkkiä jäljellä</div>

      <textarea
        className="input"
        name={name}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </Field>
  )
}

function LimitedTextField (props) {
  const {
    label,
    name,
    value,
    maxLength,
    inputClassName,
    isRequired,
    onChange
  } = props;

  return (
    <Field
      isRequired={isRequired}
      label={label}
      name={name}
    >
      <div className="muted md-right mb1 md-mb0">{maxLength - value.length} merkkiä jäljellä</div>

      <input
        className="input"
        maxLength={maxLength}
        type="text"
        name={name}
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </Field>
  )
}

/*
  Updates startDate
  Updates endDate if startDate > endDate
*/
const handleChangeStartDate = (item, updateFunction, date, minDate, dateFormat) => {
  const newDate = date ? date.format(dateFormat) : null

  updateFunction('startDate', newDate)

  // Only update endDate if startDate exists and is before endDate
  if (newDate && item.startDate && date.isAfter(moment(item.endDate, dateFormat))) {
    updateFunction('endDate', date.add(1, 'days').format(dateFormat))
  }
}

/*
  Updates endDate
  Updates startDate if endDate < startDate
*/
const handleChangeEndDate = (item, updateFunction, date, minDate, dateFormat) => {
  const newDate = date ? date.format(dateFormat) : null

  updateFunction('endDate', newDate)

  // No need to update startDate if endDate has been removed
  if (!newDate) {
    return
  }

  // Check if new startDate should be endDate - 1 or minDate
  let newStartDate = date.subtract(1, 'days')

  if (newStartDate.isBefore(minDate)) {
    newStartDate = minDate
  }

  // Only update startDate if endDate exists and is before startDate
  if (newDate && item.endDate && date.isBefore(moment(item.startDate, dateFormat))) {
    updateFunction('startDate', newStartDate.format(dateFormat))
  }
}

function DateField (props) {
  const {
    className,
    locale,
    label,
    name,
    date,
    isRequired,
    initialDate,
    selectsStart,
    selectsEnd,
    startDate,
    endDate,
    onChange
  } = props

  const dateFormat = 'D.M.YYYY'

  // Add 2 hours to minDate for first days of months, otherwise the previous days are also selectable
  const minDate = initialDate ? moment(initialDate, dateFormat).add(2, 'hours') : moment().add(2, 'hours')

  return(
    <Field
      classList={className}
      name={name}
      label={label}
      isRequired={isRequired}
    >
      <DatePicker
        className="input"
        minDate={minDate}
        fixedHeight
        dateFormat={dateFormat}
        highlightDates={[new Date()]}
        isClearable
        locale="fi"
        onChange={date => onChange(date, minDate, dateFormat)}
        placeholderText="p.k.vvvv"
        popoverAttachment="bottom center"
        popoverTargetAttachment="top center"
        selected={date ? moment(date, dateFormat) : null}
        selectsStart={selectsStart ? true : false}
        selectsEnd={selectsEnd ? true : false}
        startDate={moment(startDate, dateFormat)}
        endDate={moment(endDate, dateFormat)}
        showMonthDropdown
        showWeekNumbers
      />
    </Field>
  )
}

const handleSubmit = (event, submitFunction) => {
  event.preventDefault();

  submitFunction();
}

function EditRelease (props) {
  const {
    controller,
    locale,
    selectedTab,
    release,
    notificationTags,
    categories
  } = props

  const notification = release.notification
  const timeline = release.timeline
  const timelineItem = R.head(release.timeline)

  return (
    <form onSubmit={(event) => handleSubmit(event, controller.saveDocument)}>
      <h2 className="hide">Luo uusi sisältö</h2>

      {/*Tabs and state*/}
      <div className="flex flex-wrap px3">
        <div className="tabs col-12">
          <a
            className={`tab-item ${selectedTab === 'edit-notification' ? 'tab-item-is-active' : ''}`}
            onClick={() => controller.toggleEditorTab('edit-notification')}
            href="#notification"
          >
            Tiedote
          </a>
          <a
            className={`tab-item ${selectedTab === 'edit-events' ? 'tab-item-is-active' : ''}`}
            onClick={() => controller.toggleEditorTab('edit-events')}
            href="#events"
          >
            Aikajana
          </a>
        </div>

        {/*State*/}
        {/*<div*/}
          {/*className="h5 caps muted sm-flex items-center justify-end col-12 sm-col-6*/}
            {/*mt2 sm-mt0 sm-border-bottom border-gray-lighten-2"*/}
        {/*>*/}
          {/*Tila:*/}
          {/*{release.state === 'DRAFT' ? ' Luonnos' : ''}*/}
        {/*</div>*/}
      </div>

      {/*Editor*/}
      <div className="tab-content px3">
        {/*Notification*/}
        <section className={`tab-pane ${selectedTab === 'edit-notification' ? 'tab-pane-is-active' : ''}`}>
          <h3 className="hide">Muokkaa tiedotetta</h3>

          {/*Title*/}
          <div className="flex flex-wrap">
            <div className="col-12 sm-col-6 sm-pr2">
              <LimitedTextField
                label="Otsikko"
                name="notification-title-fi"
                value={notification.content.fi.title}
                maxLength={200}
                isRequired
                onChange={controller.updateNotificationContent('fi', 'title')}
              />
            </div>

            <div className="col-12 sm-col-6 sm-pl2">
              <LimitedTextField
                label="Otsikko ruotsiksi"
                name="notification-title-sv"
                value={notification.content.sv.title}
                maxLength={200}
                onChange={controller.updateNotificationContent('sv', 'title')}
              />
            </div>

            {/*<Checkbox className="mb2" label="Häiriötiedote" />*/}
          </div>

          {/*Description*/}
          <div className="flex flex-wrap">
            <div className="col-12 sm-col-6 sm-pr2">
              <Field
                label="Kuvaus"
                name="notification-description-fi"
                isRequired
              >
                <TextEditor
                  data={notification.content.fi.text}
                  save={controller.updateNotificationContent('fi', 'text')}
                />
              </Field>
            </div>

            <div className="col-12 sm-col-6 sm-pl2">
              <Field
                label="Kuvaus ruotsiksi"
                name="notification-description-sv"
              >
                <TextEditor
                  data={notification.content.sv.text}
                  save={controller.updateNotificationContent('sv', 'text')}
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-wrap">
            {/*Tags*/}
            <div className="col-12 sm-col-6 sm-pr2">
              <Field
                label="Tiedotteen avainsanat"
                name="notification-tags"
                isRequired
              >
                <Dropdown
                  className="semantic-ui"
                  fluid
                  multiple
                  name="notification-tags"
                  noResultsMessage="Ei avainsanoja"
                  onChange={handleOnChange.bind(null, controller)}
                  onLabelClick={handleOnLabelClick.bind(null, controller)}
                  options={mapDropdownOptions(notificationTags, locale)}
                  placeholder="Lisää avainsana"
                  search
                  selection
                  value={release.notification.tags}
                />
              </Field>
            </div>

            {/*Publishing period*/}
            <div className="md-flex flex-wrap col-12 sm-col-6 sm-pl2">
              {/*Publish date*/}
              <DateField
                className="md-col-6 lg-col-4 md-pr2"
                label="Julkaisupäivämäärä"
                name="notification-start-date"
                isRequired
                date={notification.startDate}
                initialDate={notification.initialStartDate}
                selectsStart
                startDate={notification.startDate}
                endDate={notification.endDate}
                onChange={handleChangeStartDate.bind(this, notification, controller.updateNotification)}
              />

              {/*Expiry date*/}
              <DateField
                className="md-col-6 lg-col-4 md-pl2"
                label="Poistumispäivämäärä"
                name="notification-end-date"
                date={notification.endDate}
                initialDate={notification.initialStartDate}
                selectsEnd
                startDate={notification.startDate}
                endDate={notification.endDate}
                onChange={handleChangeEndDate.bind(this, notification, controller.updateNotification)}
              />
            </div>
          </div>
        </section>

        {/*Events*/}
        <section className={`tab-pane ${selectedTab === 'edit-events' ? 'tab-pane-is-active' : ''}`}>
          <h2 className="sr-only">Muokkaa tapahtumia</h2>

          {timeline.map((item) =>
            <div key={item.id}>
              {/*Info*/}
              <div className="flex flex-wrap">
                <div className="col-12 sm-col-6 sm-pr2">
                  <LimitedTextarea
                    label="Aikajanalla näytettävä teksti"
                    name={`timeline-item-${item.id}-text-fi`}
                    value={item.content.fi.text}
                    rows="4"
                    maxLength={200}
                    isRequired
                    onChange={controller.updateTimelineContent(item.id, 'fi', 'text')}
                  />
                </div>

                <div className="col-12 sm-col-6 sm-pl2">
                  <LimitedTextarea
                    label="Teksti ruotsiksi"
                    name={`timeline-item-${item.id}-text-sv`}
                    value={item.content.sv.text}
                    rows="4"
                    maxLength={200}
                    onChange={controller.updateTimelineContent(item.id, 'sv', 'text')}
                  />
                </div>
              </div>

              {/*Date*/}
              <DateField
                className="sm-col-6 lg-col-3 sm-pr2"
                label="Tapahtumapäivämäärä aikajanaa varten"
                name={`timeline-item-${item.id}-date`}
                isRequired
                date={item.date}
                initialDate={item.initialDate}
                onChange={controller.updateTimeline(item.id, 'date')}
              />
            </div>
          )}

          {/*Add new event*/}
          <Button classList="button-link primary px0" onClick={() => controller.addTimelineItem(release)}>
            <span aria-hidden>+ </span>
            Lisää uusi tapahtuma
          </Button>
        </section>
      </div>

      {/*Categories and user groups*/}
      <section className="py2 px3 border-top border-bottom border-gray-lighten-2">
        <h2 className="sr-only">Julkaisun kategoria(t) ja kohdekäyttäjäryhmät</h2>

        <div className="flex flex-wrap">
          {/*Categories*/}
          <div className="col-12 sm-col-6 sm-pr2">
            <Fieldset isRequired legend="Julkaisun kategoria(t)">
              <CategorySelect
                locale={locale}
                categories={categories}
                selectedCategories={release.categories}
                toggleCategory={controller.toggleReleaseCategory}
              />
            </Fieldset>
          </div>

          {/*User groups*/}
          <div className="col-12 sm-col-6 sm-pl2">
            <Field name="release-usergroups" label="Julkaisun kohdekäyttäjäryhmät">
              <Dropdown
                fluid
                multiple
                name="release-usergroups"
                noResultsMessage="Ei käyttäjäryhmiä"
                options={[]}
                placeholder="Lisää käyttäjäryhmä"
                search
                selection
                value={[]}
              />
            </Field>

            <Checkbox name="release-send-email" label="Lähetä sähköposti valituille käyttäjäryhmille välittömästi" />
          </div>
        </div>
      </section>

      {/*Form actions*/}
      <div className="center pt3 px3">
        <input
          className="button button-primary button-lg"
          type="submit"
          value="Julkaise"
        />
      </div>
    </form>
  )
}

export default EditRelease
