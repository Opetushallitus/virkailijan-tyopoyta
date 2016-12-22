import React from 'react'

import Button from '../Button'
import Icon from '../Icon'

function TimelineDay ({ event }) {
  return (
    <div className="timeline-event break-word left-align p2 relative rounded white bg-blue">
      {/*Event date*/}
      <time className="mb1 block" dateTime="22.11.2016">
        <div className="h1 bold line-height-1 mr1 inline-block">22</div>
        <div className="align-top inline-block">
          <div className="h5">tiistai</div>
          <div className="h6 caps">marraskuu 2016</div>
        </div>
      </time>

      {/*Text*/}
      <div className="h5 pr2">Valintaehdotusten tulee olla tallennettuna</div>

      {/*Edit button*/}
      {/*<Button*/}
        {/*classList="button-link absolute top-0 right-0 mt1 mr1"*/}
        {/*title="Muokkaa">*/}
        {/*<Icon name="pencil" />*/}
        {/*<span className="hide">Muokkaa</span>*/}
      {/*</Button>*/}
    </div>
  )
}

export default TimelineDay;
