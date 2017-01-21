
import urls from './data/virkailijan-tyopoyta-urls.json'

module.exports = function() {

  const getRoles = function (){
    fetch(urls["cas.myroles"],{
      credentials: 'include'
    })
      .then(response => response.json())
      .then(roles => {
        this.setState({
          roles: roles
        });
        if(roles){
          window.myroles = roles;
          this.getTranslate();
        }
      })
      .catch(error => {
        if (location.host.indexOf('localhost') === 0 || location.host.indexOf('10.0.2.2') === 0) { // dev mode (copypaste from upper)
          this.setState({roles});
          if(roles){
            this.getTranslate();
          }
        } else { // real usage
          if (window.location.href.indexOf('ticket=') > 0) { // to prevent strange cyclic cas login problems (atm related to sticky sessions)
            alert('Problems with login, please reload page or log out and try again');
          } else {
            window.location.href = urls["cas.login"]+ location.href;
          }
        }
      });
  }

  const getTranslate = function(){

    let lang='fi';

    for (let i = 0; i < this.state.roles.length; i++) {
      if (this.state.roles[i].indexOf('LANG_') === 0) {
        lang = this.state.roles[i].substring(5);
      }
    }

    fetch(urls["lokalisointi.localisation"] + lang,{
      credentials: 'include'
    })
      .then(response => response.json)
      .then(data => Translations.setTranslations(data))
      .catch (error =>{
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
}
