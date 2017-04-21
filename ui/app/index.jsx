import 'babel-polyfill'
import 'whatwg-fetch'

import React from 'react'
import { render } from 'react-dom'

import App from './components/App'
import { initAppState, getController } from './appState.js'

const controller = getController()
const appState = initAppState()

appState.onValue(state => {
  render(
    <App state={state} controller={controller} />,
    document.getElementById('app')
  )
})
