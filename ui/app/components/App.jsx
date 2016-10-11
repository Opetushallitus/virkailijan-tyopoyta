import React from 'react'
import Notifications from './Notifications'
import EditNotification from './EditNotification'
import CategorySelect from './CategorySelect'
// import Modal from 'simple-react-modal'
import placeholder from '../resources/img/placeholder.png'

export default class App extends React.Component {

  constructor(){
    super();
    this.state = {modalOpen: false}
    this.closeModal = this._closeModal.bind(this)
  }

  openModal(){
    this.setState({modalOpen: true})
  }

  _closeModal() {
    this.setState({modalOpen: false })
  }

  render(){

    return (
      <div>
        <div className="mainMenu">
          <div className="menu-content">Näytä</div>
          <div style={{float: 'left'}}> <CategorySelect/></div>
          <div className="addNew"><a  onClick={() => this.openModal()}>+ Luo uusi sisältö</a></div>
        </div>
        <Modal show={this.state.modalOpen}>
          <EditNotification onClose={this.closeModal}/>
        </Modal>
        <div className="sideBySide">
          <Notifications posts={this.props.state.posts}/>
          <img src={placeholder}/>
        </div>
      </div>)
  }
}

class Modal extends React.Component {
  render() {
    if (this.props.show === false)
      return null

    return (
        <div className="foo" data-modal="true">
          <div className="bar" onClick={e => this.close(e)}>{this.props.children}</div>
        </div>)
  }

  close(e) {
    e.preventDefault()

    if (this.props.onClose) {
      this.props.onClose()
    }
  }
}