import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import Field from '../common/form/Field'
import DateField from '../common/form/DateField'
import Icon from '../common/Icon'
import Translation from '../common/Translations'
import TextEditor from '../texteditor/TextEditor'

import getFormattedDate from './getFormattedDate'

const propTypes = {
  item: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired
}

function EditTimelineItem (props) {
  const {
    item,
    locale,
    dateFormat,
    controller
  } = props

  const handleOnDateChange = date => {
    const newDate = getFormattedDate({ date, dateFormat })

    controller.updateTimeline(item.id, 'date', newDate)
  }

  const handleOnRemoveItemClick = () => {
    controller.removeTimelineItem(item.id)
  }

  return (
    <div key={item.id} className="timeline-item-form">
      {/*Info*/}
      <div className="flex flex-wrap">
        <div className="col-12 sm-col-6 sm-pr2">
          <Field
            label={<Translation trans="aikajanateksti" />}
            name={`timeline-item-${item.id}-text-fi`}
            isRequired
          >
            <TextEditor
              data={item.content.fi.text}
              save={controller.updateTimelineContent(item.id, 'fi', 'text')}
            />
          </Field>
        </div>

        <div className="col-12 sm-col-6 sm-pl2">
          <Field
            label={<Translation trans="tekstiSV" />}
            name={`timeline-item-${item.id}-text-sv`}
            isRequired
          >
            <TextEditor
              data={item.content.fi.text}
              save={controller.updateTimelineContent(item.id, 'sv', 'text')}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="col-10 sm-col-6 lg-col-3 sm-pr2 mb0">
          {/*Date*/}
          <DateField
            label={<Translation trans="tapahtumapvmaikajanaavarten" />}
            locale={locale}
            name={`timeline-item-${item.id}-date`}
            dateFormat={dateFormat}
            date={item.date}
            isRequired
            onChange={handleOnDateChange}
          />
        </div>

        {/*Remove event*/}
        {
          item.initialDate
            ? null
            : <div className="flex-auto flex items-end justify-end">
              <Button
                className="button-link h3 pt3 pr0 pb0 pl3 gray-lighten-1"
                title="Poista tapahtuma"
                onClick={handleOnRemoveItemClick}
              >
                <Icon name="trash" />
                <span className="hide">
                  <Translation trans="poistatapahtuma" />
                </span>
              </Button>
            </div>
        }
      </div>
    </div>
  )
}

EditTimelineItem.propTypes = propTypes

export default EditTimelineItem
