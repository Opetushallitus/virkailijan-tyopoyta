import React, { PropTypes } from 'react'
import renderHTML from 'react-render-html'

import PreviewTargetingList from './PreviewTargetingList'
import { translate } from '../common/Translations'

import getTimelineItems from './getTimelineItems'

const propTypes = {
  locale: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  userGroups: PropTypes.array.isRequired,
  release: PropTypes.object.isRequired
}

function PreviewRelease (props) {
  const {
    locale,
    categories,
    userGroups,
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
      <div className="flex flex-wrap">
        <div className="flex flex-wrap flex-1 col-12 md-col-6 mb2 md-mb0 md-pr2">
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

            {previewedTimelineItems.length
              ? <div>
                {previewedTimelineItems.map((item) =>
                  <div key={`timelineItem${item.id}`} className="mb2">
                    <div className="italic">{item.date ? item.date : translate('eipvm')}: </div>
                    {renderHTML(item.content[locale].text) || translate('tyhja')}
                  </div>
                )}

                {translate('aikajanatapahtumatjulk')}
              </div>
              : <div>{translate('eitapahtuma')}</div>
            }
          </div>
        </div>

        {/*Targeting*/}
        <div
          className="flex-1 col-12 md-col-6 md-pl2 p2
          border rounded border-gray-lighten-2 bg-gray-lighten-5"
        >
          <h3 className="h4">{translate('kohdennus')}</h3>

          <p>{translate('julkaisunkohdennus')}</p>

          {/*Categories*/}
          <PreviewTargetingList
            locale={locale}
            title="kohdennuskategoriat"
            items={categories}
            selectedItems={release.categories}
          />

          {/*User groups*/}
          {
            release.userGroups.length > 0
              ? <PreviewTargetingList
                locale={locale}
                title="kohdennusroolit"
                items={userGroups}
                selectedItems={release.userGroups}
              />
              : null
          }

          {/*Focused category and category user groups*/}
          {
            release.focusedCategory
              ? <PreviewTargetingList
                locale={locale}
                title="kohdennustarkennettukategoria"
                items={categories}
                selectedItems={[release.focusedCategory]}
              />
              : null
          }

          {/*Focused user groups*/}
          {
            release.focusedUserGroups
              ? <PreviewTargetingList
                locale={locale}
                title="kohdennustarkennetutroolit"
                items={userGroups}
                selectedItems={release.focusedUserGroups}
              />
              : null
          }
        </div>
      </div>
    </div>
  )
}

PreviewRelease.propTypes = propTypes

export default PreviewRelease
