import React, { PropTypes } from 'react'

import TextEditor from './texteditor/TextEditor'
import IconButton from '../common/buttons/IconButton'
import Field from '../common/form/Field'
import DateField from '../common/form/DateField'
import { translate } from '../common/Translations'

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

  const handleDateChange = date => {
    const newDate = getFormattedDate({ date, dateFormat })

    controller.updateItem(item.id, 'date', newDate)
  }

  const handleRemoveItemClick = () => {
    controller.remove(item.id)
  }

  return (
    <div className="editor-timeline-item-form">
      {/*Info*/}
      <div className="flex flex-wrap mb2">
        <div className="col-12 sm-col-6 sm-pr2 mb2 sm-mb0">
          <Field
            label={translate('aikajanateksti')}
            name={`timeline-item-${item.id}-text-fi`}
            isRequired
          >
            <TextEditor
              data={item.content.fi.text}
              save={controller.updateContent(item.id, 'fi', 'text')}
            />
          </Field>
        </div>

        <div className="col-12 sm-col-6 sm-pl2">
          <Field
            label={translate('tekstiSV')}
            name={`timeline-item-${item.id}-text-sv`}
          >
            <TextEditor
              data={item.content.sv.text}
              save={controller.updateContent(item.id, 'sv', 'text')}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap mb2">
        <div className="col-10 sm-col-6 lg-col-3 sm-pr2">
          {/*Date*/}
          <DateField
            label={translate('tapahtumapvmaikajanaavarten')}
            locale={locale}
            name={`timeline-item-${item.id}-date`}
            dateFormat={dateFormat}
            date={item.date}
            isRequired
            onChange={handleDateChange}
          />
        </div>

        {/*Remove item*/}
        <div className="oph-h3 flex-auto flex items-end justify-end">
          <IconButton
            id={`timeline-item-${item.id}-remove-button`}
            title={translate('poistatapahtuma')}
            icon="trash"
            onClick={handleRemoveItemClick}
          />
        </div>
      </div>
    </div>
  )
}

EditTimelineItem.propTypes = propTypes

export default EditTimelineItem
