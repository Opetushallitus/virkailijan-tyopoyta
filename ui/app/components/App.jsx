import React from 'react'

// Components
import Modal from './Modal'
import Button from './Button'
import Icon from './Icon'
import Menu from './menu/Menu'
import Notifications from './notifications/Notifications'
import Timeline from './timeline/Timeline'
import EditRelease from './editor/EditRelease'
// import Translations from './Translations'
// import roles from '../data/myroles.json';
// import translation from '../data/translation.json';

function App ({ state, controller }) {
    return (
      <div>
        <div className="container flex flex-wrap mx-auto">
          {/*Menu*/}
          <Menu
            controller={controller}
            isVisible={state.menu.isVisible}
            hasUnpublishedReleases={state.hasUnpublishedReleases}
          />

          {/*Tabs for tablet and mobile*/}
          {/*<label className="md-hide lg-hide" htmlFor="tab1">*/}
            {/*Tiedotteet*/}
          {/*</label>*/}
          {/*<input className="md-hide lg-hide" type="radio" id="tab1" name="tabs" />*/}

          {/*<label className="md-hide lg-hide" htmlFor="tab2">*/}
            {/*Aikajana*/}
          {/*</label>*/}
          {/*<input className="md-hide lg-hide" type="radio" id="tab2" name="tabs" />*/}

          {/*Notifications*/}
          <section className="col-12 md-col-7 mt3 md-pr2">
            <Notifications
              controller={controller}
              locale={state.locale}
              nextPage={state.nextPage}
              notifications={state.notifications}
              expandedNotifications={state.expandedNotifications}
              notificationTags={state.notificationTags}
              selectedNotificationTags={state.selectedNotificationTags}
            />
          </section>

          {/*Timeline*/}
          <section className="col-12 md-col-5 mt3 md-pl2">
            <Timeline />
          </section>

        {/*Modals*/}
        <div className={`overlay ${state.editor.isVisible ? 'overlay-is-visible' : ''}`}>
          {/*Editor*/}
          {
            state.editor.isVisible
              ?
                <div className="modal modal-lg">
                  <div className="modal-dialog">
                    {/*Close button*/}
                    <Button
                      classList="modal-close-button button-link absolute top-0 right-0"
                      onClick={() => controller.toggleEditor(false)}
                      title="Sulje"
                    >
                      &times;
                      <span className="hide">Sulje</span>
                    </Button>

                    <EditRelease
                      controller={controller}
                      locale={state.locale}
                      dateFormat={state.dateFormat}
                      selectedTab={state.editor.selectedTab}
                      isPreviewed={state.editor.isPreviewed}
                      release={state.editor.document}
                      categories={state.categories}
                      notificationTags={state.notificationTags}
                    />
                  </div>
                </div>
              : null
          }

          {/*Unpublished releases*/}
          </div>

        </div>
      </div>

      // <div>
      //  <div className="mainMenu">
      //    <span className="menu-content">Näytä</span>
      //    <span style={{float: 'left'}}>
      //      <CategorySelect
      //        selectedCategories={[]}
      //        toggleCategory={(category, selected) => {}}/></span>
      //    <span className="addNew" onClick={() => controller.toggleEditor(true)}>+ Luo uusi sisältö</span>
      //  </div>
      //  <div className="sideBySide">
      //    <Notifications notifications={state.notifications} filter={state.activeFilter} expandedNotifications={state.expandedNotifications} controller={controller}/>
      //    <Timeline timeline={state.timeline}/>
      //
      //  </div>
      //</div>
    )
  }

export default App
