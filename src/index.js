import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { BrowserRouter as Router, Route } from 'react-router-dom'

import Debug from './debug'
import {FormFeilds} from './chat-experiments/FormFeilds'
import { Login} from './App';
import Experiment from './chat-experiments/'


import * as serviceWorker from './serviceWorker';

document.title = 'Carwale chatbot | CogniQA'

window.addEventListener("load",function() {
  if( document.body.offsetWidth < 480 )
    setTimeout(function(){
        // This hides the address bar:
        window.scrollTo(0, 1);
    }, 0);
});

let user_data = {}

const routing = (
  <Router>
      <Route exact path="/" component={props => <Login { ...props} updateData={ data => {user_data = data } } /> } />
          <Route exact path="/formElements" component={ FormFeilds } />
          <Route exact path="/debug" component={ Debug } />
          <Route exact path="/debug/:session_id" component={ Debug } />
          <Route exact path="/login/:user_id" component={props => <Experiment { ...props } user_data={ user_data } /> } />
  </Router>
)
ReactDOM.render(routing, document.getElementById('root'))



// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
