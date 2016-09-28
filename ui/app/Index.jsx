import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App'
import {initAppState, getController} from './appState.js'

// require('./main.scss');
const appState = initAppState();
const controller = getController();

appState.onValue((state) => {
  ReactDOM.render(<App state={state} controller={controller}/>, document.getElementById('app'));
});
