import React from 'react'
import Notifications from './Notifications'
import EditRelease from './EditNotification'
import CategorySelect from './CategorySelect'
import Timeline from './Timeline'
import placeholder from '../resources/img/placeholder.png'

const App = ({state, controller}) => {
  console.log("t:" + JSON.stringify(state.timeline))
  return (
    <div>
      <div className="mainMenu">
        <span className="menu-content">Näytä</span>
        <span style={{float: 'left'}}>
          <CategorySelect
            selectedCategories={[]}
            toggleCategory={(category, selected) => {}}/></span>
        <span className="addNew" onClick={() => controller.toggleEditor(true)}>+ Luo uusi sisältö</span>
      </div>
      {state.editor.visible ?
        <Modal>
          <EditRelease release={state.editor.document} controller={controller} onClose={() => controller.toggleEditor(false)}/>
        </Modal> : ""
      }
      <div className="sideBySide">
        <Notifications notifications={state.notifications} filter={state.activeFilter} expandedNotifications={state.expandedNotifications} controller={controller}/>
        <Timeline timeline={state.timeline}/>

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
