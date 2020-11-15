import React from 'react'
import './App.css'
import $ from 'jquery'
import configJSON from './config/UI_configuration.json'
import ChatInterface from './components/ChatInterface'
import {FormFeilds} from './chat-experiments/FormFeilds'
import Experiment from './chat-experiments/'

import { BrowserRouter as Router, Route, useHistory } from 'react-router-dom'

function Title(props){
  return <div className="App-header">
          <div className="title">{ configJSON.title }</div>
          <div className="tagline">{ configJSON.tagline }</div>
        </div>
}

function MainApp(props){
    return (
      <div className="App ">
        <Title />
        <div className="separater"></div>

        <div className="chat_interface">
          <div className="chat_window" >
            <ChatInterface props={props} />
          </div>
        </div>
      </div>
    );
}


function Login( ){
  const history = useHistory();
  
  function verifyUser(event){
      let userid = $('#userid').val() 
      if( userid !== '' ){
        history.push(`/${userid}`);
      }
  }
  
  return(
      <div className="App">
        <Title />
      
        <div className="separater"></div>
          <div className="chat_interface">
            <form  style={{ width: '80vw',maxWidth: 280+'px', textAlign: 'left', margin: '50px auto auto'}} onSubmit={verifyUser} >
            
              <h3 style={{ marginTop: '30px', color: '#44a1fd' }}> Login </h3> 
              <div >
                <label style={{ fontWeight: 'bolder' }}> User Id </label>
                <input type="text" placeholder='Enter User Id' id="userid" style={{padding: '3px', outline: 'none', width: '210px'}} />
              </div>
              <div style={{ alignItems: 'end', flexDirection: 'row-reverse', justifyContent: 'end', display: 'flex', marginTop: '25px' }}>
                <button primary floated="right"
                    style={{ padding: '5px 10px', fontWeight: 'bolder', color: 'white', backgroundColor: '#44a1fd', border: 'none', borderRadius: '4px' }}
                  >Login</button>
              </div>
            </form>
          </div>
      </div>
      )
}



function App(){
  document.title = 'Carwale chatbot | CogniQA'
  return  <Router>
            <Route exact path="/experiment" component={ MainApp } />
            <Route exact path="/formElements" component={ FormFeilds } />
            {/* <Route exact path="/:user_id" component={ Experiment } /> */}
            <Route exact path="/" component={Experiment} />
          </Router>
}

export default App