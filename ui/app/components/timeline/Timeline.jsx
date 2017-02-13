import React, { PropTypes } from 'react'
import Bacon from 'baconjs'
import moment from 'moment'

// Components
import TimelineHeading from './TimelineHeading'
import TimelineDay from './TimelineDay'
import TimelineSkeleton from './TimelineSkeleton'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  timeline: PropTypes.object.isRequired
}

class Timeline extends React.Component {
  componentDidMount () {
    // Create a stream from scrolling event
    Bacon
      .fromEvent(this.timeline, 'scroll')
      .debounce(100)
      .onValue((event) => {
        const node = event.target

        // Fetch previous month or current month's past days when scrolling to top
        if (node.scrollTop === 0) {
          this.props.timeline.preloadedItems.length
            ? this.props.controller.getPreloadedMonth()
            : this.props.controller.getPreviousMonth()
        }

        // Fetch next month when scrolling to bottom
        if ((node.offsetHeight + node.scrollTop) === node.scrollHeight) {
          this.props.controller.getNextMonth()
        }
      })
  }

  // Only update if timeline items has changed or loading has failed
  shouldComponentUpdate (nextProps) {
    const newTimeline = nextProps.timeline
    const timeline = this.props.timeline

    return newTimeline.items.length !== timeline.items.length ||
      newTimeline.hasLoadingFailed !== timeline.hasLoadingFailed
  }

  componentDidUpdate () {
    const timeline = this.props.timeline

    if (timeline.hasLoadingFailed) {
      return
    }

    // Scroll to first month on initial load and after user fetches the previous month
    if (timeline.items.length === 1 || timeline.direction === 'up') {
      this.timeline.scrollTop = this.months.offsetTop
    }

    // Autoload next months until timeline has more than 20 items
    if (timeline.count < 10) {
      this.props.controller.getNextMonth()
    }
  }

  render () {
    const {
      controller,
      locale,
      dateFormat,
      timeline
    } = this.props

    const {
      items,
      isInitialLoad,
      hasLoadingFailed
    } = timeline

    const currentDate = moment().format(dateFormat)

    // TODO: Block scrolling/tab focusing while loading OR block new fetches while loading

    return (
      <div>
        {/*Skeleton screen*/}
        {
          isInitialLoad &&
            <TimelineSkeleton />
        }

        <div
          ref={timeline => (this.timeline = timeline)}
          className={`${hasLoadingFailed ? '' : 'timeline-container'} timeline-line relative autohide-scrollbar
          ${isInitialLoad ? 'display-none' : ''}`}
        >
          <h2 className="hide">{translate('tapahtumatalkaen')} {currentDate}</h2>

          {/*Focusable button for searching previous events*/}
          <button
            className="hide"
            type="button"
            onClick={() => {}}
          >
            {translate('haeedellisiatapahtumia')}
          </button>

          <div
            className={`timeline timeline-line relative ${isInitialLoad ? 'display-none' : ''}`}
          >
            <Spinner isVisible={!hasLoadingFailed} />

            <div
              ref={months => (this.months = months)}
              className="timeline-line sm-center md-left-align lg-center relative"
            >
              {/*Months*/}
              {items.map((month, index) =>
                <div
                  ref={index === 0 ? firstMonth => (this.firstMonth = firstMonth) : ''}
                  key={`timelineMonth${month.month}${month.part ? `.${month.part}` : ''}.${month.year}`}
                  className="mb3"
                >
                  <TimelineHeading month={month.month} year={month.year} />

                  <div className="flex flex-column">
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

              <Spinner isVisible={!hasLoadingFailed} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Timeline.propTypes = propTypes

export default Timeline
