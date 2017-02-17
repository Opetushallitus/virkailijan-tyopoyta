import React from 'react'
import { render } from 'react-dom'

import App from './components/App'
import { initAppState, getController } from './appState.js'

import './resources/styles/app.css'

const controller = getController()
const appState = initAppState()

console.log(controller)

appState.onValue((state) => {
  render(
    <App
      state={state}
      controller={controller}
    />,
    document.getElementById('app')
  )
})
