import React from 'react'
import './App.css'
import ChatInterface from './components/ChatInterface'

class App extends React.Component{
  

  render(){    

    return (
      <div className="App ">
        <div className="App-header">
          <div className="title">Bharat Matrimony Chatbot</div>
          <div className="tagline">powered by CogniQA platform</div>
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
}

export default App