import React from 'react'
import Translation from '../Translations'

function TimePeriod (props) {
  return (
    <div>
      <div className="inline-block lg-inline md-col-1 mb1 md-mb0">Aikaväli</div>

      <div className="md-inline-block flex justify-center items-center md-col-9 lg-ml2">
        {/*Start date*/}
        <div className="md-inline-block col-6 sm-col-4 md-col-3 lg-col-5 pr1">
          <label className="hide" htmlFor="startDate"><Translation trans="alkaen"/></label>
          <input className="input" name="startDate" type="text" placeholder={<Translation trans="alkaen"/>} />
        </div>

        <span className="muted" aria-hidden>–</span>

        {/*End date*/}
        <div className="md-inline-block col-6 sm-col-4 md-col-3 lg-col-5 pl1">
          <label className="hide" htmlFor="endDate"><Translation trans="loppuen"/></label>
          <input className="input" name="endDate" type="text" placeholder={<Translation trans="loppuen"/>} />
        </div>
      </div>
    </div>
  )
}

export default TimePeriod
