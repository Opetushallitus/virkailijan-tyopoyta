import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import Popup from '../common/Popup'
import { translate } from '../common/Translations'

const propTypes = {
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  text: PropTypes.string.isRequired,
  hasSaveFailed: PropTypes.bool,
  onOutsidePopupClick: PropTypes.func.isRequired,
  saveErrorMessage: PropTypes.string
}

const defaultProps = {
  disabled: false,
  isLoading: false,
  hasSaveFailed: false,
  saveErrorMessage: ''
}

function PreviewAndReleaseButton (props) {
  const {
    disabled,
    isLoading,
    text,
    hasSaveFailed,
    onOutsidePopupClick,
    saveErrorMessage
  } = props

  return (
    <div>
      <Button
        id="editor-button-save"
        variants={['primary', 'big']}
        type="submit"
        disabled={disabled}
        isLoading={isLoading}
      >
        {text}
      </Button>

      {
        hasSaveFailed
          ? <Popup
            target="#editor-button-save"
            variant="error"
            position="right"
            title={translate('julkaisuepaonnistui')}
            text={translate('kokeileuudestaan').concat(saveErrorMessage)}
            onOutsidePopupClick={onOutsidePopupClick}
          />
          : null
      }
    </div>
  )
}

PreviewAndReleaseButton.propTypes = propTypes
PreviewAndReleaseButton.defaultProps = defaultProps

export default PreviewAndReleaseButton
