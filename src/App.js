import React from 'react'
import './App.css'

import config_json from './config/UI_configuration.json'
import ChatInterface from './components/ChatInterface'
import FormFeilds from './components/FormFeilds'
import ExperimentComponent from './components/ExperimentComponent'

import { BrowserRouter as Router, Route } from 'react-router-dom'

function MainApp(){

  document.title = 'Carwale Chatbot | CogniQA Framebot'

  return  <div className="App ">
            <div className="App-header">
              <div className="title"> { config_json.title } </div>
              <div className="tagline">{ config_json.tagline }</div>
            </div>
            <div className="separater"></div>

            <div className="chat_interface">
              <div className="chat_window" >
                <ChatInterface />
              </div>
            </div>
          </div>
}


function ExperimentApp(){

  document.title = 'Carwale Chatbot | CogniQA Framebot'

  return  <div className="App ">
            <div className="App-header">
              <div className="title"> { config_json.title } </div>
              <div className="tagline">{ config_json.tagline }</div>
            </div>
            <div className="separater"></div>

            <div className="chat-interface">
              <div className="main-container">
                Main page
              </div>
              <div className="bottom-align" >
                <div className="chat-container">
                  <ExperimentComponent />
                </div>
              </div>

            </div>
          </div>
}


function App(){
  return  <Router >
            <Route exact path="/" component={ MainApp } />
            <Route exact path="/formElements" component={ FormFeilds } />
            <Route exact path="/experiment" component={ ExperimentApp } />
          </Router>
}

export default App