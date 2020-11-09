import React from 'react'
import './index.css'

import ChatBot from './Chatbot'
import uiJson from './ui-custom.json'

function Experiment(){

    return  <div className="App-container">
                <div className="App-header">
                    <div className="title">{ uiJson.title }</div>
                    <div className="tagline">{ uiJson.tagline }</div>
                </div>
                <div className="separater"></div>

                <div className="chat_interface">
                <div className="chat_window" >
                    <ChatBot />
                </div>
                </div>
            </div>
}


export default Experiment