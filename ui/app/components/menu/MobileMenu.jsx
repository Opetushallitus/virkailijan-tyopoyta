import React from 'react'

// Components
import Button from '../Button'
import Icon from '../Icon'

function MobileMenu (props) {
  const {
    controller,
    isVisible,
    hasUnpublishedReleases
  } = props

  return (
    <div className="md-hide lg-hide flex justify-center col-12">
      <Button
        classList={`button-link h5 caps ${isVisible ? 'primary' : 'muted'}`}
        onClick={() => controller.toggleMenu(!isVisible)}
      >
        <Icon classList="mr1" name="sliders" />
        Rajaa hakua
      </Button>

      <Button
        classList="button-link h5 caps muted"
        onClick={() => controller.toggleEditor(true)}
      >
        <Icon classList="mr1" name="plus" />
        Uusi tiedote
      </Button>

      {
        hasUnpublishedReleases
          ?
            <Button classList="button-link h5 caps muted">
              <Icon classList="mr1" name="files-o" />
              Julkaisemattomat
            </Button>
          : null
      }
    </div>
  )
}

export default MobileMenu
