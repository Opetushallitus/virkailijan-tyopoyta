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
    <div className="notifications-menu flex items-stretch">
      <section className="flex col-12 border-bottom border-gray-lighten-2">
        {/*Actions*/}
        <div className="flex items-center col-12">
          <div className="center md-left-align lg-flex flex-auto items-center justify-end">
            {/*Create a new release*/}
            <Button
              id="button-open-editor"
              className="button-link h3 bold px0 lg-mr3"
              onClick={handleOpenEditorButtonClick}
            >
              +&nbsp;
              {translate('lisaauusi')}
            </Button>

            <br className="lg-hide" />

            {/*Display unpublished notifications*/}
            <Button
              id="button-open-unpublished-notifications"
              className="button-link regular right-align px0"
              onClick={handleOpenUnpublishedNotificationsButtonClick}
            >
              {translate('julktiedotteet')}
            </Button>

            <br className="lg-hide" />

            {/*Edit draft*/}
            {
              draft
                ? <Button
                  id="button-edit-draft"
                  className="button-link regular right-align px0 lg-ml3"
                  onClick={handleEditDraftButtonClick}
                >
                  {translate('jatkaluonnosta')}
                </Button>
                : <div className="lg-ml3 py1 muted">{translate('eiluonnosta')}</div>
            }
          </div>
        </div>
      </section>
    </div>
  )
}

NotificationsMenu.propTypes = propTypes
NotificationsMenu.defaultProps = defaultProps

export default NotificationsMenu
