import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const styleLink = document.createElement("link")
styleLink.rel = "stylesheet"
styleLink.href = "https://fonts.googleapis.com/css?family=Do Hyeon"
document.head.appendChild(styleLink)

const styleLink1 = document.createElement("link")
styleLink1.rel = "stylesheet"
styleLink1.href = "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;1,300&display=swap"
document.head.appendChild(styleLink1)


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
