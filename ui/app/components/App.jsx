import React from 'react'
import Notifications from './Notifications'

export default class App extends React.Component {

  render(){
    return (
      <div>
        <h1>Virkailijan Työpöytä</h1>
        <Notifications posts={this.props.state.posts}/>
      </div>)
  }
}