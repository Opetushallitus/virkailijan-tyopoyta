import React from 'react'
import Notifications from './Notifications'
import EditNotification from './EditNotification'
import CategorySelect from './CategorySelect'
import placeholder from '../resources/img/placeholder.png'

const App = ({state, controller}) => {
  return (
    <div>
      <div className="mainMenu">
        <span className="menu-content">Näytä</span>
        <span style={{float: 'left'}}> <CategorySelect/></span>
        <span className="addNew" onClick={() => controller.toggleEditor(true)}>+ Luo uusi sisältö</span>
      </div>
      {state.editor.visible ?
        <Modal>
          <EditNotification document={state.editor.document} controller={controller} onClose={() => controller.toggleEditor(false)}/>
        </Modal> : ""
      }
      <div className="sideBySide">
        <Notifications notifications={state.notifications} filter={state.filter} expandedNotifications={state.expandedNotifications} controller={controller}/>
        <img src={placeholder}/>
      </div>
    </div>)
};

export default App;

const Modal = ({children}) => {
  return (
    <div className="editor-modal" data-modal="true">
      <div className="modal-children">{children}</div>
    </div>)
};
