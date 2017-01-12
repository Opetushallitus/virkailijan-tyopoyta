import React from 'react'
import R from 'ramda'
import moment from 'moment'
import renderHTML from 'react-render-html'
import DatePicker from 'react-datepicker'
import { Dropdown } from 'semantic-ui-react';
import mapDropdownOptions  from '../utils/mapDropdownOptions';

import TextEditor from './TextEditor'
import CategorySelect from '../CategorySelect'
import Field from '../Field'
import Fieldset from '../Fieldset'
import Checkbox from '../Checkbox'
import Button from '../Button'
import Translation,{translate} from '../Translations'

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
      <div className="muted md-right mb1 md-mb0">{maxLength - value.length}<Translation trans="merkkiajaljella"/></div>

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
    validation,
    maxLength,
    isRequired,
    onChange
  } = props;

  return (
    <Field
      isRequired={isRequired}
      label={label}
      name={name}
      validation={validation}
    >
      <div className="muted md-right mb1 md-mb0">{maxLength - value.length}<Translation trans="merkkiajaljella"/></div>

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
  const newDate = getDate(date, dateFormat)

  updateFunction('startDate', newDate)

  // Update endDate if it's before startDate
  if (newDate && date.isAfter(moment(item.endDate, dateFormat))) {
    updateFunction('endDate', date.add(1, 'days').format(dateFormat))
  }
}

/*
  Updates endDate
  Updates startDate if endDate < startDate
*/
const handleChangeEndDate = (item, updateFunction, date, minDate, dateFormat) => {
  const newDate = getDate(date, dateFormat)

  updateFunction('endDate', newDate)

  // No need to update startDate if endDate is null
  if (!newDate) {
    return
  }

  // Check if new startDate should be endDate - 1 or minDate
  let newStartDate = date.subtract(1, 'days')

  if (newStartDate.isBefore(minDate)) {
    newStartDate = minDate
  }

  // Update startDate if it's before endDate
  if (newDate && date.isBefore(moment(item.startDate, dateFormat))) {
    updateFunction('startDate', newStartDate.format(dateFormat))
  }
}

const handleChangeTimelineItemDate = (id, updateFunction, dateFormat, date) => {
  const newDate = getDate(date, dateFormat)

  updateFunction(id, 'date', newDate)
}

const getNotificationMinDate = (initialDate, dateFormat) => {
  // Notification is published (has initialDate) = minDate is initialDate
  let minDate = moment(initialDate, dateFormat)

  // Notification is a draft (no initialDate) = minDate is today
  // Notification is unpublished (initialDate is after today) = minDate is today
  if (!initialDate || initialDate && moment(initialDate, dateFormat).isAfter(moment())) {
    minDate = moment()
  }

  return getMinDate(minDate)
}

// Returns formatted date or null
const getDate = (date, dateFormat) => {
  return date ? date.format(dateFormat) : null
}

// Returns minDate + 2 hours for first days of months, otherwise the previous days are also selectable
const getMinDate = (date, dateFormat) => {
  return moment(date, dateFormat).add(2, 'hours')
}

function DateField (props) {
  const {
    className,
    locale,
    dateFormat,
    label,
    name,
    date,
    isRequired,
    minDate,
    selectsStart,
    selectsEnd,
    startDate,
    endDate,
    onChange
  } = props

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

const handleTabItemClick = (event, action, tab) => {
  event.preventDefault()

  action(tab)
}

const handleSubmit = (event, controller, isPreviewed) => {
  event.preventDefault()

  if (isPreviewed) {
    controller.saveDocument()
  }
  else {
    controller.toggleDocumentPreview(true)
  }
}

// Returns a string representing the notification's publication state
const getNotificationPublicationState = (initialStartDate, dateFormat) => {
  // No initialStartDate = a draft
  if (!initialStartDate) {
    return <Translation trans="luonnos"/>
  }

  // initialStartDate is after today = unpublished
  if (moment(initialStartDate, dateFormat).isAfter(moment())) {
    return <Translation trans="julkaisematon"/>
  }

  // initialStartDate is before today = published
  if (moment(initialStartDate, dateFormat).isBefore(moment())) {
    return <Translation trans="julkaistu"/>
  }
}

// Returns a string representing the notification's validation state
const getNotificationValidationStateString = state => {
  if (state === 'empty') {
    return <Translation trans="eisisaltoa"/>
  }

  if (state === 'incomplete') {
    return <Translation trans="kesken"/>
  }

  if (state === 'complete') {
    return <Translation trans="valmis"/>
  }
}

// Returns timeline items with defined state(s)
const getTimelineItems = (state, timeline) => {
  const hasState = item => {
    item.validationState = item.validationState || 'complete'

    return R.contains(item.validationState, state)
  }

  return R.filter(hasState, timeline)
}


function EditRelease (props) {
  const {
    controller,
    locale,
    dateFormat,
    selectedTab,
    isPreviewed,
    release,
    notificationTags,
    categories
  } = props;

  const notification = release.notification;
  const timeline = release.timeline;

  // Set default release and notification validation states for unpublished/published releases
  release.validationState = release.validationState || 'valid';

  notification.validationState = notification
    ? notification.validationState || 'complete'
    : 'empty';


return (
    <form noValidate onSubmit={(event) => handleSubmit(event, controller, isPreviewed)}>
      <h2 className="hide"><Translation trans="lisaauusi"/></h2>

      {/*Tabs and release's state*/}
      <div className="flex flex-wrap px3">
        <div className="tabs col-12 sm-col-6">
          <a
              className={`tab-item ${selectedTab === 'edit-notification' ? 'tab-item-is-active' : ''}`}
              onClick={(event) => handleTabItemClick(event, controller.toggleEditorTab, 'edit-notification')}
              href="#notification"
          >
            <Translation trans="tiedote"/>
            <span className="lowercase">
              &nbsp;({getNotificationValidationStateString(notification.validationState)})
            </span>
          </a>
          <a
              className={`tab-item ${selectedTab === 'edit-timeline' ? 'tab-item-is-active' : ''}`}
              onClick={(event) => handleTabItemClick(event, controller.toggleEditorTab, 'edit-timeline')}
              href="#timeline"
          >
            <Translation trans="aikajana"/>
            <span className="lowercase">
              &nbsp;({
              getTimelineItems(['complete'], timeline).length
                  ? getTimelineItems(['complete'], timeline).length
                  : <Translation trans="eisisaltoa"/>
            })
            </span>
          </a>
        </div>

        {/*Publication state*/}
        <div
            className="h5 caps muted sm-flex items-center justify-end col-12 sm-col-6
            mt2 sm-mt0 sm-border-bottom border-gray-lighten-2"
        >
          Tila: {getNotificationPublicationState(notification.initialStartDate, dateFormat)}
        </div>
      </div>

      {/*Editor*/}
      <div className="tab-content px3">
        {/*Notification*/}
        <section className={`tab-pane ${selectedTab === 'edit-notification' ? 'tab-pane-is-active' : ''}`}>
          <h3 className="hide"><Translation trans="muokkaatiedotteita"/></h3>

          {/*Title*/}
          <div className="flex flex-wrap">
            <div className="col-12 sm-col-6 sm-pr2">
              <LimitedTextField
                  label={<Translation trans="otsikko"/>}
                  name="notification-title-fi"
                  value={notification.content.fi.title}
                  maxLength={200}
                  isRequired
                  onChange={controller.updateNotificationContent('fi', 'title')}
              />
            </div>

            <div className="col-12 sm-col-6 sm-pl2">
              <LimitedTextField
                  label={<Translation trans="otsikkoSV"/>}
              name="notification-title-sv"
              value={notification.content.sv.title}
              maxLength={200}
              onChange={controller.updateNotificationContent('sv', 'title')}
              />
            </div>

            {/*Is a fault notification?*/}
            {/*<Checkbox className="mb2" label="Häiriötiedote" />*/}
          </div>

          {/*Description*/}
          <div className="flex flex-wrap">
            <div className="col-12 sm-col-6 sm-pr2">
              <Field
                  label={<Translation trans="kuvaus"/>}
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
                  label={<Translation trans="kuvausSV"/>}
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
                  label={<Translation trans="tiedotteenavainsanat"/>}
                  name="notification-tags"
                  isRequired
              >
                <Dropdown
                    className="semantic-ui"
                    fluid
                    multiple
                    name="notification-tags"
                    noResultsMessage={<Translation trans="eiavainsanoja"/>}
                    onChange={handleOnChange.bind(null, controller)}
                    onLabelClick={handleOnLabelClick.bind(null, controller)}
                    options={mapDropdownOptions(notificationTags, locale)}
                    placeholder={<Translation trans="lisaaavainsanoja"/>}
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
                  label={<Translation trans="julkaisupvm"/>}
                  name="notification-start-date"
                  dateFormat={dateFormat}
                  date={notification.startDate}
                  minDate={getNotificationMinDate(notification.initialStartDate, dateFormat)}
                  initialDate={notification.initialStartDate}
                  selectsStart
                  startDate={notification.startDate}
                  endDate={notification.endDate}
                  isRequired
                  onChange={handleChangeStartDate.bind(this, notification, controller.updateNotification)}
              />

              {/*Expiry date*/}
              <DateField
                  className="md-col-6 lg-col-4 md-pl2"
                  label={<Translation trans="poistumispvm"/>}
                  name="notification-end-date"
                  dateFormat={dateFormat}
                  date={notification.endDate}
                  minDate={getNotificationMinDate(notification.initialStartDate, dateFormat)}
                  selectsEnd
                  startDate={notification.startDate}
                  endDate={notification.endDate}
                  onChange={handleChangeEndDate.bind(this, notification, controller.updateNotification)}
              />
            </div>
          </div>
        </section>

        {/*Timeline*/}
        <section className={`tab-pane ${selectedTab === 'edit-timeline' ? 'tab-pane-is-active' : ''}`}>
          <h3 className="hide"><Translation trans="muokkaaaikajanantapahtumia"/></h3>

          {timeline.map(item =>
              <div key={item.id}>
                {/*Info*/}
                <div className="flex flex-wrap">
                  <div className="col-12 sm-col-6 sm-pr2">
                    <LimitedTextarea
                        label={<Translation trans="aikajanateksti"/>}
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
                        label={<Translation trans="tekstiSV"/>}
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
                    label={<Translation trans="tapahtumapvmaikajanaavarten"/>}
                    name={`timeline-item-${item.id}-date`}
                    dateFormat={dateFormat}
                    date={item.date}
                    isRequired
                    onChange={handleChangeTimelineItemDate.bind(this, item.id, controller.updateTimeline, dateFormat)}
                />
              </div>
          )}

          {/*Add new event*/}
          <Button classList="button-link primary px0" onClick={() => controller.addTimelineItem(release)}>
            <span aria-hidden>+ </span>
            <Translation trans="lisaauusitapahtuma"/>
          </Button>
        </section>
      </div>

      {/*Categories and user groups*/}
      <section className="py2 px3 border-top border-bottom border-gray-lighten-2">
        <h2 className="hide"><Translation trans="julkkategoriaryhma"/></h2>

        <div className="flex flex-wrap">
          {/*Categories*/}
          <div className="col-12 sm-col-6 sm-pr2">
            <Fieldset isRequired legend={<Translation trans="julkkategoria"/>}>
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
            <Field name="release-usergroups" label={<Translation trans="julkryhma"/>}>
              <Dropdown
                  fluid
                  multiple
                  name="release-usergroups"
                  noResultsMessage={<Translation trans="eiryhma"/>}
                  options={[]}
                  placeholder={<Translation trans="lisaaryhma"/>}
                  search
                  selection
                  value={[]}
              />
            </Field>

            <Checkbox
                name="release-send-email"
                label={<Translation trans="lahetasahkoposti"/>}
                checked={release.sendEmail}
                onChange={() => controller.updateRelease('sendEmail', !release.sendEmail)}
            />
          </div>
        </div>
      </section>

      {/*Preview*/}
      { isPreviewed
          ?
          <section className="p3 border-bottom border-gray-lighten-2">
            <h2 className="h3 center mb3"><Translation trans="oletjulkaisemassa"/></h2>

            <div className="flex flex-wrap">
              {/*Notification*/}
              <div className="flex col-12 md-col-6 md-pr2 mb3 md-mb0">
                <div className="flex-1 col-12 p2 border rounded border-gray-lighten-2 bg-silver">
                  <h3 className="h4"><Translation trans="tiedote"/></h3>

                  {
                    notification.validationState === 'empty'
                        ? <div><Translation trans="eitiedote"/></div>
                        :
                        <div>
                          <div className="mb2">
                            <span className="italic"><Translation trans="otsikko"/>: </span>
                            {notification.content[locale].title || <Translation trans="tyhja"/>}
                          </div>

                          <div className="mb2">
                            <span className="italic"><Translation trans="tiedote"/>: </span>
                            {renderHTML(notification.content[locale].text) || <Translation trans="tyhja"/>}
                          </div>

                          <div className="flex flex-wrap">
                            <div className="italic col-12 sm-col-4 md-col-7 lg-col-5"><Translation trans="julkaisupvm"/>:</div>
                            <div className="col-5 mb2 sm-mb0">{notification.startDate || '–'}</div>

                            <div className="italic col-12 sm-col-4 md-col-7 lg-col-5"><Translation trans="poistumispvm"/>:</div>
                            <div className="col-5">{notification.endDate || '–'}</div>
                          </div>
                        </div>
                  }

                </div>
              </div>

              {/*Timeline*/}
              <div className="flex col-12 md-col-6 md-pl2">
                <div className="flex-1 col-12 p2 border rounded border-gray-lighten-2 bg-silver">
                  <h3 className="h4"><Translation trans="aikajanatapahtuma"/></h3>

                  {getTimelineItems(['incomplete', 'complete'], timeline).length
                      ?
                      <div>
                        {getTimelineItems(['incomplete', 'complete'], timeline).map((item) =>
                            <div key={item.id} className="mb2">
                              <span className="italic">{item.date ? item.date : <Translation trans="eipvm"/>}: </span>
                              {item.content[locale].text || <Translation trans="tyhja"/>}
                            </div>
                        )}

                        <Translation trans="aikajanatapahtumatjulk"/>
                      </div>
                      : <div><Translation trans="eitapahtuma"/></div>
                  }
                </div>
              </div>
            </div>
          </section>
          : null
      }

      <div className="px3">
        <p>notification content state: {notification.validationState}</p>
        <p>
          timeline items: {timeline.length},
          complete: {getTimelineItems(['complete'], timeline).length},
          incomplete: {getTimelineItems(['incomplete'], timeline).length},
          empty: {getTimelineItems(['empty'], timeline).length}
        </p>
        <p>release: {release.validationState}</p>
      </div>

      {/*Form actions*/}
      <div className="center pt3 px3">
        <input
            className="button button-primary button-lg"
            type="submit"
            disabled={
              release.validationState !== 'complete'
              || (notification.validationState === 'empty' && getTimelineItems(['empty'], timeline).length === timeline.length)
              || notification.validationState === 'incomplete'
              || getTimelineItems(['incomplete'], timeline).length
            }
            value={isPreviewed ? translate("julkaise") : translate("esikatselejulkaise")}
        />
      </div>
    </form>
)
}

export default EditRelease
