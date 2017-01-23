import React, { PropTypes } from 'react'

// Components
import TimelineHeading from './TimelineHeading'
import TimelineDay from './TimelineDay'
import Spinner from '../common/Spinner'
import Translation from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired
}

function Timeline (props) {
  const {
    controller,
    locale,
    dateFormat,
    items
  } = props

  return (
    <div className="timeline timeline-axis relative autohide-scrollbar">
      <h2 className="hide"><Translation trans="tapahtumat" /></h2>

      {/*Months*/}
      <div className="sm-center md-left-align lg-center relative">
        {/*Month heading*/}
        <TimelineHeading text="Marraskuu 2016" />

        {/*Month*/}
        <div className="timeline-axis flex flex-column">
          {/*Timeline items for a single day*/}
          <TimelineDay
            controller={controller}
            locale={locale}
            dateFormat={dateFormat}
            items={items}
          />
        </div>

        <Spinner isVisible={false} />
      </div>
    </div>
  )
}

Timeline.propTypes = propTypes

export default Timeline
