import React from 'react'

const Modal = ({children}) => {
  return (
    <div className="editor-modal" data-modal="true">
      <div className="modal-children">{children}</div>
    </div>
  )
};

export default Modal;
