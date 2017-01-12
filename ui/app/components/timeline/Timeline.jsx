import React from 'react'

import TimelineHeading from './TimelineHeading'
import TimelineDay from './TimelineDay'
import EditButton from '../EditButton'
import Translation from '../Translations'

function Timeline ({ timeline }) {
  return (
    <div className="timeline timeline-axis autohide-scrollbar relative">
      <h2 className="hide"><Translation trans="tapahtumat"/></h2>

      <div className="alert alert-warning mb3">
        Testidataa, ei muokattavissa
      </div>

      {/*Months*/}
      <div className="sm-center md-left-align lg-center relative">
        {/*Month heading*/}
        <TimelineHeading text="Marraskuu 2016" />

        {/*Month*/}
        <div className="timeline-axis flex flex-column">
          {/*Day*/}
          <TimelineDay />

          <div className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
            <div className="timeline-event left-align p2 relative rounded white bg-blue">
              {/*day date*/}
              <time className="mb1 block" dateTime="22.11.2016">
                <div className="h1 bold line-height-1 mr1 inline-block">25</div>
                <div className="align-top inline-block">
                  <div className="h5">perjantai</div>
                  <div className="h6 caps">marraskuu 2017</div>
                </div>
              </time>

              {/*Description*/}
              <span className="h5">Valintojen tulokset tulee ilmoittaa hakijoille</span>

              {/*Edit button*/}
              {/*<EditButton*/}
                {/*className="absolute top-0 right-0"*/}
              {/*/>*/}
            </div>
          </div>

          <div className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
            <div className="timeline-event left-align p2 relative rounded white bg-blue">
              {/*day date*/}
              <time className="mb1 block" dateTime="22.11.2016">
                <div className="h1 bold line-height-1 mr1 inline-block">30</div>
                <div className="align-top inline-block">
                  <div className="h5">keskiviikko</div>
                  <div className="h6 caps">marraskuu 2016</div>
                </div>
              </time>

              {/*Description*/}
              <span className="h5">Hakijan on tehtävä opiskelupaikan vastaanottaminen viimeistään klo 15.00</span>

              {/*Edit button*/}
              {/*<EditButton*/}
                {/*className="absolute top-0 right-0"*/}
              {/*/>*/}
            </div>
          </div>
        </div>

        <TimelineHeading text="Joulukuu 2016" />

        <div className="timeline-axis flex flex-column">

          <div className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
            <div className="timeline-event break-word left-align p2 relative rounded white bg-blue">
              {/*day date*/}
              <time className="mb1 block" dateTime="22.11.2016">
                <div className="h1 bold line-height-1 mr1 inline-block">19</div>
                <div className="align-top inline-block">
                  <div className="h5">maanantai</div>
                  <div className="h6 caps">joulukuu 2016</div>
                </div>
              </time>

              {/*Description*/}
              <span className="h5">Varasijoilta hakeminen päättyy</span>

              {/*Edit button*/}
              {/*<EditButton*/}
                {/*className="absolute top-0 right-0"*/}
              {/*/>*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timeline
