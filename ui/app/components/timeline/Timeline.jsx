import React, { PropTypes } from 'react'

// Components
import TimelineHeading from './TimelineHeading'
import TimelineDay from './TimelineDay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  timeline: PropTypes.array.isRequired,
  isInitialLoad: PropTypes.bool.isRequired
}

class Timeline extends React.Component {
  componentDidUpdate () {
    this.timeline.scrollTop = this.months.offsetTop
  }

  render () {
    const {
      controller,
      locale,
      dateFormat,
      timeline,
      isInitialLoad
    } = this.props

    return (
      <div>
        {/*Skeleton screen*/}
        <div className={`timeline timeline-axis relative ${isInitialLoad ? '' : 'display-none'}`}>
          <div className="sm-center md-left-align lg-center relative pt3">
            <div className="timeline-heading h6 caps regular center mb0 p1 inline-block rounded white bg-blue-darken">
              <span className="invisible">{translate('hetkinen')}</span>
            </div>

            <div className="timeline-axis flex flex-column">
              <div className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
                <div className="timeline-item p3 relative rounded bg-blue">
                  <span className="invisible">{translate('hetkinen')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={timeline => (this.timeline = timeline)}
          className={`timeline timeline-axis relative autohide-scrollbar ${isInitialLoad ? 'display-none' : ''}`}
        >
          <h2 className="hide">{translate('tapahtumat')}</h2>

          <div className="sm-center md-left-align lg-center relative">
            {/*Months*/}
            <div ref={months => (this.months = months)}>
              {timeline.map(month =>
                <div key={`timelineMonth${month.month}.${month.year}`} className="mb3">
                  <TimelineHeading month={month.month} year={month.year} />

                  <div className="timeline-axis flex flex-column">
                    {/*Days*/}
                    {Object.keys(month.days || {}).map(key =>
                      <TimelineDay
                        key={`timelineDay${key}.${month.month}.${month.year}`}
                        locale={locale}
                        dateFormat={dateFormat}
                        items={month.days[key]}
                        onEditButtonClick={controller.toggleEditor}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <Spinner isVisible={false} />
          </div>
        </div>
      </div>
    )
  }
}

Timeline.propTypes = propTypes

export default Timeline
