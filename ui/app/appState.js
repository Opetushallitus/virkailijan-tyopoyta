import Bacon from 'baconjs'
import Promise from 'bluebird'
import Dispatcher from './dispatcher'
import axios from 'axios'
import {initController} from './controller'


const ax = Promise.promisifyAll(axios);
const dispatcher = new Dispatcher;
const noticeUrl = 'api/notifications';

const events = {
  addNotification: 'addNotification',
  deleteNotification: 'deleteNotification',
  showEdit: 'showEdit',
  updateNotifications : 'updateNotifications'
};

const controller = initController(dispatcher, events);

export function getController(){
  return controller;
}

export function initAppState() {

  const initialState = {posts: [
    {
      title: "Häiriötiedote",
      text: "AIKU-palvelussa käyttökatko 16.6.2016 kello 01:00-03:00",
      type: "Hairiotiedote",
      tags: [],
      created: "23.5.2016 12:07",
      creator: "CS"
    },
    {
      title: "Erityisopetuksena järjestettävän ammatillisen koulutuksen haun valinnat",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum porttitor elit molestie urna dictum, ac accumsan felis pharetra. Morbi quis facilisis neque, sed imperdiet erat. Suspendisse potenti. Ut at consectetur enim. Praesent et sollicitudin tellus. Maecenas nec mauris massa. Quisque augue erat, cursus ac leo at, aliquam gravida lacus. Sed metus dolor, ultricies a malesuada porta, convallis quis dolor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. \
             Vestibulum aliquam nibh sed ante rutrum, a pulvinar risus dictum. Proin sit amet pharetra justo, eu eleifend erat. Curabitur vitae risus enim. Vestibulum purus justo, dignissim in scelerisque at, consectetur nec risus. Aliquam massa ligula, pretium eu massa eu, porta luctus nibh. Ut in ligula in magna tincidunt bibendum. Aliquam volutpat mollis imperdiet. Praesent porttitor ultricies velit eget maximus. Suspendisse neque purus, rhoncus sit amet viverra in, maximus vitae diam. In laoreet facilisis mi ut congue. Vivamus non justo laoreet, eleifend ante et, luctus ante. Aliquam erat volutpat.",
      type: "Tiedote",
      tags: ["perusopetus", "toinen aste", "valinnat"],
      created: "26.5.2016 12:07",
      creator: "CS"
    },
    {
      title: "Koetulokset ja harkintaan perustuvan valinnan päätökset sekä aloituspaikat tallennettavat...",
      text: "OPH:n tarkennetun aikataulun mukaisesti kevään yhteishaun koetulokset ja muut pisteet sekä harkintaan...",
      type: "Tiedote",
      tags: ["toinen aste", "ePerusteet", "valinnat"],
      created: "26.5.2016 12:07",
      creator: "CS"
    },
    {
      title: "Pääsy- ja soveltuvuuskoeaihiot 2016",
      text: "Pääsy-ja-soveltuvuuskokeiden-aihiot-kevät-2016",
      type: "Materiaali",
      tags: ["toinen aste","valinnat"],
      created: "26.5.2016 14:51",
      creator: "CS"
    },
    {
      title: "Versiopäivitys 23.5 klo 16.30-17.00",
      text: "Opintopolussa versiopäivitys tänään 23.5 klo 16:30-17:00. Hakemusten käsittely ja Oma Opintopolku-...",
      type: "Tiedote",
      tags: ["toinen aste","valinnat"],
      created: "26.5.2016 14:51",
      creator: "CS"
    }
  ]};

  return Bacon.update(initialState)
}