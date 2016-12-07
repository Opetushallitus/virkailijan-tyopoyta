import React from 'react'
import R from 'ramda'

const Timeline = ({timeline}) => {
  console.log("timeline:"+ JSON.stringify(timeline))

  return(<div>
    {timeline.map(item => <TimelineItem item={item}/>)}
  </div>)
};

const TimelineItem = ({item}) => {
  console.log("item:"+ JSON.stringify(item))
  return (<div>
    <p>{item.date} : {item.content.fi.text}</p>
  </div>)
};

export default Timeline;