import React from 'react'

// Components
import Button from '../Button'
import Icon from '../Icon'
import Translation from '../Translations'

function MobileMenu (props) {
  const {
    controller,
    isVisible,
    hasUnpublishedReleases
  } = props

  return (
    <div className="md-hide lg-hide flex justify-center col-12">
      <Button
        classList={`button-link h5 caps ${isVisible ? 'primary' : 'gray'}`}
        onClick={() => controller.toggleMenu(!isVisible)}
      >
        <Icon classList="mr1" name="sliders" />
        <Translation trans="rajaahakua"/>
      </Button>

      <Button
        classList="button-link h5 caps gray"
        onClick={() => controller.toggleEditor(true)}
      >
        <Icon classList="mr1" name="plus" />
        <Translation trans="lisaauusi"/>
      </Button>

      {
        hasUnpublishedReleases
          ?
            <Button classList="button-link h5 caps gray">
              <Icon classList="mr1" name="files-o" />
              <Translation trans="julktiedotteet"/>
            </Button>
          : null
      }
    </div>
  )
}

export default MobileMenu
