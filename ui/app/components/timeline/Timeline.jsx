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
  constructor (props) {
    super(props)

    this.loadTimeline = this.loadTimeline.bind(this)
    this.moveTimeline = this.moveTimeline.bind(this)
  }

  componentDidMount () {
    const menuContainer = document.querySelector('.menu-container')
    this.timeline.style.height = menuContainer ? '75vh' : '80vh'

    // Load next or previous month when scrolling the timeline
    Bacon
      .fromEvent(this.timeline, 'scroll')
      .debounce(100)
      .onValue(event => this.loadTimeline(event))

    // Keep timeline in viewport when scrolling the page
    Bacon
      .fromEvent(window, 'scroll')
      .debounce(100)
      .onValue(() => this.moveTimeline())
  }

  // Only update if timeline items have changed or loading has failed
  shouldComponentUpdate (nextProps, nextState) {
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

    // Autoload next months until timeline has more than 10 items
    if (timeline.count < 10) {
      this.props.controller.getNextMonth()
    }
  }

  loadTimeline (event) {
    const node = event.target

    if (this.props.timeline.hasLoadingFailed) {
      return
    }

    // Get previous month or current month's past days when scrolling above the first month
    if (node.scrollTop < this.months.offsetTop) {
      this.props.timeline.preloadedItems.length
        ? this.props.controller.getPreloadedMonth()
        : this.props.controller.getPreviousMonth()
    }

    // Get next month when scrolling to spinner
    if ((node.offsetHeight + node.scrollTop) >= (node.scrollHeight - this.nextMonthSpinner.clientHeight)) {
      this.props.controller.getNextMonth()
    }
  }

  moveTimeline () {
    const virkailijaRaamit = document.querySelector('header')
    const menuContainer = document.querySelector('.menu-container')
    const menuHeight = menuContainer ? menuContainer.clientHeight : 0
    const topOffset = virkailijaRaamit.clientHeight + menuHeight

    if (window.pageYOffset > topOffset) {
      this.timeline.style.top = `${window.pageYOffset - topOffset}px`
      this.timeline.style.height = '95vh'
    } else {
      this.timeline.style.top = 0
      this.timeline.style.height = menuContainer ? '75vh' : '80vh'
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

    return (
      <div>
        {/*Skeleton screen*/}
        {
          isInitialLoad &&
            <TimelineSkeleton />
        }

        <div
          ref={timeline => (this.timeline = timeline)}
          className={`timeline-viewport timeline-line
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
            <div className="my3">
              <Spinner isVisible={!hasLoadingFailed} />
            </div>

            <div
              ref={months => (this.months = months)}
              className="timeline-line sm-center md-left-align lg-center relative"
            >
              {/*Months*/}
              {items.map(month =>
                <div
                  key={`timelineMonth${month.month}${month.part ? `.${month.part}` : ''}.${month.year}`}
                  className="mb3"
                >
                  <TimelineHeading month={month.month} year={month.year} />

                  <div className="flex flex-column pr2 sm-pl2 md-pl0 lg-pl2">
                    {/*Days*/}
                    {Object.keys(month.days || {}).map(key =>
                      <TimelineDay
                        key={`timelineDay${key}.${month.month}.${month.year}`}
                        locale={locale}
                        dateFormat={dateFormat}
                        items={month.days[key]}
                        onEditButtonClick={controller.edit}
                      />
                    )}
                  </div>
                </div>
              )}

              <div
                className="py3"
                ref={nextMonthSpinner => (this.nextMonthSpinner = nextMonthSpinner)}
              >
                <Spinner isVisible={!hasLoadingFailed} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Timeline.propTypes = propTypes

export default Timeline
