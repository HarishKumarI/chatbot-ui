import React from 'react'
import './App.css'

import configJSON from './config/UI_configuration.json'
import ChatInterface from './components/ChatInterface'
import {FormFeilds} from './components/FormFeilds'

import { BrowserRouter as Router, Route } from 'react-router-dom'

function MainApp(){
    return (
      <div className="App ">
        <div className="App-header">
          <div className="title">{ configJSON.title }</div>
          <div className="tagline">{ configJSON.tagline }</div>
        </div>
        <div className="separater"></div>

        <div className="chat_interface">
          <div className="chat_window" >
            <ChatInterface />
          </div>
        </div>
      </div>
    );
}


function App(){
  document.title = 'Carwale chatbot | CogniQA'
  return  <Router>
            <Route exact path="/" component={ MainApp } />
            <Route exact path="/formElements" component={ FormFeilds } />
          </Router>
}

export default App