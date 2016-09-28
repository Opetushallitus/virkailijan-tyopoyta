import React from 'react'

export default class Notifications extends React.Component {

  render(){

    const notifications = this.props.posts;

    return(
      <div>
        <h2>Tiedotteet</h2>
        <div>
          {notifications.map(n => <Notification post={n}/>)}
        </div>
      </div>
    )
  }
}

export class Notification extends  React.Component {

  render(){

    const post = this.props.post;

    return(
      <div>
        <h3>{post.title}</h3>
        <p>{post.text}</p>
        <div>{post.type} {post.tags}</div>
        <div> {post.created} {post.creator}</div>
      </div>
    )
  }
}