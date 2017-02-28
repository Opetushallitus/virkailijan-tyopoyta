import React, { PropTypes } from 'react'
import renderHTML from 'react-render-html'
import R from 'ramda'

import PreviewTargetingList from './PreviewTargetingList'
import { translate } from '../common/Translations'
import * as testData from '../../resources/test/testData.json'

import getTimelineItems from './getTimelineItems'

const propTypes = {
  locale: PropTypes.string.isRequired,
  // categories: PropTypes.array.isRequired,
  userGroups: PropTypes.array.isRequired,
  // tags: PropTypes.array.isRequired,
  release: PropTypes.object.isRequired
}

function PreviewRelease (props) {
  const {
    locale,
    // categories,
    userGroups,
    // tags,
    release
  } = props

  const notification = release.notification
  const timeline = release.timeline
  const previewedTimelineItems = getTimelineItems(['incomplete', 'complete'], timeline)

  return (
    <div>
      <h2 className="h3 center mb3">
        {translate('oletjulkaisemassa')}
      </h2>

      {/*Preview*/}
      <div>
        <div className="flex flex-wrap flex-1 col-12">
          {/*Notification*/}
          <div className="flex flex-1 col-12 md-col-6 md-pr2 mb3">
            <div className="col-12 p2 border rounded border-gray-lighten-2 bg-gray-lighten-5">
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
                      <div className="col-5 mb2 sm-mb0">{notification.startDate || translate('eiasetettu')}</div>

                      <div className="italic col-12 sm-col-4 md-col-7 lg-col-5">{translate('poistumispvm')}:</div>
                      <div className="col-5">{notification.endDate || translate('eiasetettu')}</div>
                    </div>
                  </div>
              }
            </div>
          </div>

          {/*Timeline*/}
          <div className="flex flex-1 col-12 md-col-6 md-pl2 mb3">
            <div className="col-12 p2 border rounded border-gray-lighten-2 bg-gray-lighten-5">
              <h3 className="h4">{translate('aikajanatapahtuma')}</h3>

              {previewedTimelineItems.length
                ? <div>
                  {previewedTimelineItems.map((item) =>
                    <div key={`timelineItem${item.id}`} className="mb2">
                      <div className="italic">{item.date ? item.date : translate('eiasetettu')}: </div>
                      {renderHTML(item.content[locale].text) || translate('tyhja')}
                    </div>
                  )}

                  {translate('aikajanatapahtumatjulk')}
                </div>
                : <div>{translate('eitapahtuma')}</div>
              }
            </div>
          </div>
        </div>

        {/*Targeting*/}
        <div
          className="col-12 p2 border rounded border-gray-lighten-2 bg-gray-lighten-5"
        >
          <h3 className="h4 center">{translate('kohdennus')}</h3>

          <div className="flex flex-wrap">
            {/*Categories*/}
            <div className="col-12 md-col-4 md-mb3 md-pr2">
              <PreviewTargetingList
                locale={locale}
                title="julkaisunkategoriat"
                items={testData.categories}
                selectedItems={release.categories}
              />
            </div>

            {/*User groups*/}
            <div className="col-12 md-col-4 md-mb3 md-pr2">
              <PreviewTargetingList
                locale={locale}
                title="julkaisunkayttooikeusryhmat"
                items={userGroups}
                selectedItems={release.userGroups}
              />
            </div>

            {/*Tags*/}
            {
              release.notification.tags
                ? <div className="col-12 md-col-4 md-pr2">
                  <PreviewTargetingList
                    locale={locale}
                    title="julkaisunavainsanat"
                    items={R.flatten(R.pluck('items', testData.tags))}
                    selectedItems={notification.tags}
                  />
                </div>
                : null
            }
          </div>
        </div>
      </div>
    </div>
  )
}

PreviewRelease.propTypes = propTypes

export default PreviewRelease
