import React, { PropTypes } from 'react'

// Components
import Button from '../common/buttons/Button'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  draft: PropTypes.object
}

const defaultProps = {
  draft: null
}

function NotificationsMenu (props) {
  const {
    controller,
    draft
  } = props

  const handleOpenEditorButtonClick = event => {
    // Send event target id to set focus back to button when closing the editor
    const id = event.target.getAttribute('id')

    controller.editor.open(`#${id}`)
  }

  const handleOpenUnpublishedNotificationsButtonClick = event => {
    const id = event.target.getAttribute('id')

    controller.unpublishedNotifications.open(`#${id}`)
  }

  const handleEditDraftButtonClick = event => {
    const id = event.target.getAttribute('id')

    controller.editor.editDraft(`#${id}`)
  }

  return (
    <div className="notifications-menu flex items-stretch" data-selenium-id="notifications-menu">
      <section className="flex col-12 border-bottom">
        {/*Actions*/}
        <div className="flex items-center col-12">
          <div className="center md-left-align lg-flex flex-auto items-center">
            {/*Create a new release*/}
            <Button
              id="open-editor-button"
              variants={['ghost', 'big']}
              className="oph-h3 lg-mr3 px0"
              onClick={handleOpenEditorButtonClick}
              data-selenium-id="open-editor-button"
            >
              +&nbsp;
              {translate('lisaauusi')}
            </Button>

            <br className="lg-hide" />

            {/*Display unpublished notifications*/}
            <Button
              id="open-unpublished-notifications-button"
              variants={['ghost']}
              className="regular px0"
              onClick={handleOpenUnpublishedNotificationsButtonClick}
              data-selenium-id="open-unpublished-notifications-button"
            >
              {translate('julktiedotteet')}
            </Button>

            <br className="lg-hide" />

            {/*Edit draft*/}
            <Button
              id="edit-draft-button"
              variants={['ghost']}
              className="regular lg-ml3 px0"
              onClick={handleEditDraftButtonClick}
              disabled={!draft}
              data-selenium-id="edit-draft-button"
            >
              {translate(draft ? 'jatkaluonnosta' : 'eiluonnosta')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

NotificationsMenu.propTypes = propTypes
NotificationsMenu.defaultProps = defaultProps

export default NotificationsMenu
