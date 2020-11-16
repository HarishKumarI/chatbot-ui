import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { BrowserRouter as Router, Route } from 'react-router-dom'

import Debug from './chat-experiments/debug'
import {FormFeilds} from './chat-experiments/FormFeilds'
import { MainApp, Login} from './App';
import Experiment from './chat-experiments/'


import * as serviceWorker from './serviceWorker';

document.title = 'Carwale chatbot | CogniQA'


const routing = (
  <Router>
      <Route exact path="/" component={Login} />
          <Route exact path="/experiment" component={ MainApp } />
          <Route exact path="/formElements" component={ FormFeilds } />
          <Route exact path="/debug/" component={Debug} />
          <Route exact path="/login/:user_id" component={ Experiment } />
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
