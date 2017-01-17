import React, { PropTypes } from 'react'
import renderHTML from 'react-render-html'

import Translation from '../common/Translations'

import getTimelineItems from './getTimelineItems'

const propTypes = {
  locale: PropTypes.string.isRequired,
  release: PropTypes.object.isRequired
}

function PreviewRelease (props) {
  const {
    locale,
    release
  } = props

  const notification = release.notification
  const timeline = release.timeline
  const incompleteTimelineItems = getTimelineItems(['incomplete', 'complete'], timeline)
  const previewedTimelineItems = getTimelineItems(['incomplete', 'complete'], timeline)

  return (
    <div>
      <h2 className="h3 center mb3">
        <Translation trans="oletjulkaisemassa" />
      </h2>

      <div className="flex flex-wrap">
        {/*Notification*/}
        <div className="flex col-12 md-col-6 md-pr2 mb3 md-mb0">
          <div className="flex-1 col-12 p2 border rounded border-gray-lighten-2 bg-gray-lighten-5">
            <h3 className="h4">
              <Translation trans="tiedote" />
            </h3>

            {
              notification.validationState === 'empty'
                ? <div><Translation trans="eitiedote" /></div>
                : <div>
                  <div className="mb2">
                    <span className="italic"><Translation trans="otsikko" />: </span>
                    {notification.content[locale].title || <Translation trans="tyhja" />}
                  </div>

                  <div className="mb2">
                    <span className="italic"><Translation trans="tiedote" />: </span>
                    {renderHTML(notification.content[locale].text) || <Translation trans="tyhja" />}
                  </div>

                  <div className="flex flex-wrap">
                    <div className="italic col-12 sm-col-4 md-col-7 lg-col-5"><Translation trans="julkaisupvm" />:</div>
                    <div className="col-5 mb2 sm-mb0">{notification.startDate || '–'}</div>

                    <div className="italic col-12 sm-col-4 md-col-7 lg-col-5"><Translation trans="poistumispvm" />:</div>
                    <div className="col-5">{notification.endDate || '–'}</div>
                  </div>
                </div>
            }
          </div>
        </div>

        {/*Timeline*/}
        <div className="flex col-12 md-col-6 md-pl2">
          <div className="flex-1 col-12 p2 border rounded border-gray-lighten-2 bg-gray-lighten-5">
            <h3 className="h3"><Translation trans="aikajanatapahtuma" /></h3>

            {incompleteTimelineItems.length
              ? <div>
                {previewedTimelineItems.map((item) =>
                  <div key={item.id} className="mb2">
                    <span className="italic">{item.date ? item.date : 'Ei päivämäärää'}: </span>
                    {renderHTML(item.content[locale].text) || <Translation trans="tyhja" />}
                  </div>
                )}

                <Translation trans="aikajanatapahtumatjulk" />
              </div>
              : <div><Translation trans="eitapahtuma" /></div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

PreviewRelease.propTypes = propTypes

export default PreviewRelease
