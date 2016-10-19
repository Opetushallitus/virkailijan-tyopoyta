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

    return(
      <div className="notifications">
        <div className="searchControls">
          <input className="text-input" placeholder="Hakusana" type="text" onChange={e => this.setState({filter: e.target.value})}/>
          <div className="tag-list">
            <span>Näytä</span>
            {['ohje', 'materiaali', 'tiedote', 'hairiotiedote', 'aikataulupaatos'].map(t => <span key={t} className={"large-tag "+t}>{t}</span>)}
          </div>
        </div>
        <div>
          {filtered.map(n => <Notification key={n.id} post={n}/>)}
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
    const shortPost = _.truncate(post.text, {length: 100});

    return(
      <div className={"notification "+post.type}>
        <div className="">
          <span className="notificationTitle"> {post.title}</span>
          <span className={"expandNotification " + (this.state.expanded ? "icon-angle-up" : "icon-angle-down")}
                onClick={() => this.setState({expanded: !this.state.expanded})}/>
        </div>
        <p>{this.state.expanded ? post.text : shortPost}</p>
        <div>
          <span key={post.id} className={"small-tag "+post.type}>{_.upperCase(post.type)}</span>
          {post.tags.map(t => <span key={post.id+'.'+t} className={"small-tag"}>{_.upperCase(t)}</span>)}
        </div>
        <div> {post.created} {post.creator}</div>
      </div>
    )
  }
}