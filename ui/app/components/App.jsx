import React from 'react'

// Components
import Modal from './Modal'
import Button from './Button'
import Icon from './Icon'
import Menu from './menu/Menu'
import Notifications from './notifications/Notifications'
import Timeline from './timeline/Timeline'
import EditRelease from './editor/EditRelease'
import Translations from './Translations'
import roles from '../data/myroles.json';
import translation from '../data/translation.json';
import urls from '../data/virkailijan-tyopoyta-urls.json'

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.getRoles();
  }

  getRoles() {
    fetch(urls["cas.myroles"], {
      credentials: 'include'
    })
        .then(response => response.json())
        .then(roles => {
          this.setState({
            roles: roles
          });
          if (roles) {
            window.myroles = roles;
            this.getTranslate();
          }
        })
        .catch(error => {
          if (location.host.indexOf('localhost') === 0 || location.host.indexOf('10.0.2.2') === 0) { // dev mode (copypaste from upper)
            this.setState({roles});
            if (roles) {
              this.getTranslate();
            }
          } else { // real usage
            if (window.location.href.indexOf('ticket=') > 0) { // to prevent strange cyclic cas login problems (atm related to sticky sessions)
              alert('Problems with login, please reload page or log out and try again');
            } else {
              window.location.href = urls["cas.login"] + location.href;
            }
          }
        });


  }

  getTranslate() {

    var lang = 'fi';

    for (var i = 0; i < this.state.roles.length; i++) {
      if (this.state.roles[i].indexOf('LANG_') === 0) {
        lang = this.state.roles[i].substring(5);
      }
    }

    fetch(urls["lokalisointi.localisation"] + lang, {
      credentials: 'include'
    })
        .then(response => response.json)
        .then(data => Translations.setTranslations(data))
        .catch(error => {
          if (location.host.indexOf('localhost') === 0 || location.host.indexOf('10.0.2.2') === 0) { // dev mode (copypaste from upper)
            Translations.setTranslations(translation);
          } else { // real usage
            if (window.location.href.indexOf('ticket=') > 0) { // to prevent strange cyclic cas login problems (atm related to sticky sessions)
              alert('Problems with login, please reload page or log out and try again');
            } else {
              window.location.href = urls["cas.login"] + location.href;
            }
          }
        });

  }

  render() {
    const {state, controller} = this.props;
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
                          <span className="sr-only">Sulje</span>
                        </Button>

                        <EditRelease
                            controller={controller}
                            locale={state.locale}
                            selectedTab={state.editor.selectedTab}
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
}
//export default App
