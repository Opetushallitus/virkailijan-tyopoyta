import React, { PropTypes } from 'react'
import renderHTML from 'react-render-html'

import { translate } from '../common/Translations'

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
        {translate('oletjulkaisemassa')}
      </h2>

      {/*Targeting selection name*/}
      <div className="center mb3">
        <label
          className="block md-inline-block mb1 md-mb0 mr1"
          htmlFor="targeting-name"
        >
          {translate('kohderyhmavalinnannimi')}
        </label>

        <input
          className="input md-col-3"
          type="text"
          name="targeting-name"
        />
      </div>

      {/*Preview*/}
      <div className="flex flex-wrap">
        <div className="flex flex-wrap flex-1 col-12 md-col-6 md-pr2 mb3 md-mb0">
          {/*Notification*/}
          <div className="col-12 mb2 p2 border rounded border-gray-lighten-2 bg-gray-lighten-5">
            <h3 className="h4">
              {translate('tiedote')}
            </h3>

            {
              notification.validationState === 'empty'
                ? <div>{translate('eitiedote')}</div>
                : <div>
                  <div className="mb2">
                    <span className="italic">{translate('otsikko')}: </span>
                    {notification.content[locale].title || translate('tyhja')}
                  </div>

                  <div className="mb2">
                    <span className="italic">{translate('tiedote')}: </span>
                    {renderHTML(notification.content[locale].text) || translate('tyhja')}
                  </div>

                  <div className="flex flex-wrap">
                    <div className="italic col-12 sm-col-4 md-col-7 lg-col-5">{translate('julkaisupvm')}:</div>
                    <div className="col-5 mb2 sm-mb0">{notification.startDate || '–'}</div>

                    <div className="italic col-12 sm-col-4 md-col-7 lg-col-5">{translate('poistumispvm')}:</div>
                    <div className="col-5">{notification.endDate || '–'}</div>
                  </div>
                </div>
            }
          </div>

          {/*Timeline*/}
          <div className="col-12 p2 border rounded border-gray-lighten-2 bg-gray-lighten-5">
            <h3 className="h4">{translate('aikajanatapahtuma')}</h3>

            {incompleteTimelineItems.length
              ? <div>
                {previewedTimelineItems.map((item) =>
                  <div key={item.id} className="mb2">
                    <span className="italic">{item.date ? item.date : 'Ei päivämäärää'}: </span>
                    {renderHTML(item.content[locale].text) || translate('tyhja')}
                  </div>
                )}

                {translate('aikajanatapahtumatjulk')}
              </div>
              : <div>{translate('eitapahtuma')}</div>
            }
          </div>
        </div>

        <div
          className="flex-1 col-12 md-col-6 md-pl2 mb3 md-mb0 p2
          border rounded border-gray-lighten-2 bg-gray-lighten-5"
        >
          <h3 className="h4">{translate('kohdennus')}</h3>

          <p>{translate('julkaisunkohdennus')}</p>
          <p>{translate('kohdennuskategoriat')}</p>
          <p>{translate('kohdennusroolit')}</p>
        </div>
      </div>
    </div>
  )
}

PreviewRelease.propTypes = propTypes

export default PreviewRelease
