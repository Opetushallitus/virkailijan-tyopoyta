import React from 'react'
import _ from 'lodash'

export default class Notifications extends React.Component {

  constructor(){
    super();
    this.state = {filter: ""}
  }

  render(){
    const notifications = this.props.posts;
    const filtered = notifications.filter(n => n.text.indexOf(this.state.filter) !== -1);
    console.log("filter: " + this.state.filter);
    console.log("filtered size: " + filtered.length);
    console.log("filterActive: " + this.state.filter.trim !== "");

    return(
      <div className="notifications">
        <div className="searchControls">
          <input className="text-input" placeholder="Hakusana" type="text" onChange={e => this.setState({filter: e.target.value})}/>
        </div>
        <div>
          {filtered.map(n => <Notification post={n}/>)}
        </div>
      </div>
    )
  }
}

export class Notification extends React.Component{

  constructor(props){
    super();
    this.state = {expanded : false}
  }

  render(){
    const post = this.props.post;
    const shortPost = _.truncate(post.text);

    return(
      <div className="notification">
        <div className="notificationTitle">
          <h3>{post.title}</h3>
          <a className="expandNotification" onClick={() => this.setState({expanded: !this.state.expanded})}>{this.state.expanded ? "collapse" : "expand"}</a>
        </div>
        <p>{this.state.expanded ? post.text : shortPost}</p>
        <div>{post.type} {post.tags}</div>
        <div> {post.created} {post.creator}</div>
      </div>
    )
  }
}