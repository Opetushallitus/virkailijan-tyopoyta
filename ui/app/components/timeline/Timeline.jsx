import React, { PropTypes } from 'react'
import Bacon from 'baconjs'
import moment from 'moment'

// Components
import TimelineHeading from './TimelineHeading'
import TimelineDay from './TimelineDay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  defaultLocale: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
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
    const body = document.body

    // Load next or previous month when scrolling the timeline
    Bacon
      .fromEvent(this.timelineViewport, 'scroll')
      .debounce(100)
      .onValue(event => this.loadTimeline(event))

    // Keep timeline in viewport when scrolling the page
    Bacon
      .fromEvent(window, 'scroll')
      .debounce(100)
      .onValue(() => this.moveTimeline())

    //  If page has a scrollbar, hide/display it when mousing over the timeline
    Bacon
      .fromEvent(this.timelineViewport, 'mouseenter')
      .onValue(() => {
        const scrollBarWidth = window.innerWidth - document.body.clientWidth

        if (scrollBarWidth) {
          body.classList.add('overflow-hidden')
          body.style.marginRight = `${scrollBarWidth}px`
          document.querySelector('.alert-container').style.right = `100px`
        }
      })

    Bacon
      .fromEvent(this.timelineViewport, 'mouseleave')
      .onValue(() => {
        body.classList.remove('overflow-hidden')
        body.style.marginRight = 0
        document.querySelector('.alert-container').style.right = 0
      })
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

    // Scroll to first month on initial load and after user scrolls to the previous month
    if (timeline.items.length === 1 || timeline.direction === 'up') {
      this.timelineViewport.scrollTop = this.months.offsetTop
    }

    // Automatically load next months until items fill the whole timeline node
    if (this.months.clientHeight < this.timeline.clientHeight) {
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
    const virkailijaRaamitHeight = virkailijaRaamit ? virkailijaRaamit.clientHeight : 0

    if (window.pageYOffset > virkailijaRaamitHeight) {
      this.timelineViewport.style.top = `${window.pageYOffset - virkailijaRaamitHeight}px`
      this.timelineViewport.style.height = '95vh'
    } else {
      this.timelineViewport.style.top = 0
      this.timelineViewport.style.height = '85vh'
    }
  }

  render () {
    const {
      controller,
      defaultLocale,
      user,
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
      <div data-selenium-id="timeline">
        <div
          ref={timelineViewport => (this.timelineViewport = timelineViewport)}
          className="timeline-viewport"
        >
          <h2 className="hide">{translate('tapahtumatalkaen')} {currentDate}</h2>

          {/*Visually hidden button for loading the previous month*/}
          <button
            className="hide"
            type="button"
            onClick={controller.getPreviousMonth}
          >
            {translate('naytaedellinenkuukausi')}
          </button>

          <div ref={timeline => (this.timeline = timeline)} className="timeline relative">
            <div className="timeline-line sm-center md-left-align lg-center my3">
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
                        id={`timeline-day${key}-${month.month}-${month.year}`}
                        defaultLocale={defaultLocale}
                        user={user}
                        dateFormat={dateFormat}
                        items={month.days[key]}
                        onDisplayRelatedNotificationLinkClick={controller.getRelatedNotification}
                        onEditButtonClick={controller.edit}
                        onConfirmRemoveButtonClick={controller.confirmRemove}
                      />
                    )}
                  </div>
                </div>
              )}

              {/*Visually hidden button for loading the next month*/}
              <button
                className="hide"
                type="button"
                onClick={controller.getNextMonth}
              >
                {translate('naytaseuraavakuukausi')}
              </button>

              <div
                className={`py3 ${isInitialLoad ? 'display-none' : ''}`}
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
