import React from 'react'
import './App.css'
import $ from 'jquery'
import configJSON from './config/UI_configuration.json'
import { useHistory } from 'react-router-dom'
import { Person } from '@material-ui/icons'


function Title(props){
  return <div className="App-header">
          { props.userName !== undefined ? <div className="user_name"> <Person /> { props.userName } </div> : null }
          <div className="title">{ configJSON.title }</div>
          <div className="tagline">{ configJSON.tagline }</div>
        </div>
}


function Login( props ){
  const history = useHistory();
  
  function verifyUser(e){
      e.preventDefault();
      let userid = $('#userid').val() 
      if( userid !== '' ){
        $.post('/api/verify', JSON.stringify({"user_id":  parseInt( userid )} ),
          res => {

            if( res.isvalid === 'VALID' ){
              history.push(`login/${userid}`);
              console.log( res )
              props.updateData( res )
            }
          }
        )
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
                <button floated="right"
                    style={{ padding: '5px 10px', fontWeight: 'bolder', color: 'white', backgroundColor: '#44a1fd', border: 'none', borderRadius: '4px' }}
                  >Login</button>
              </div>
            </form>
          </div>
      </div>
      )
}



// function App(){
//   document.title = 'Carwale chatbot | CogniQA'
//   return  <Router>
//             <Route exact path="/" component={Login} />
//             <Route exact path="/experiment" component={ MainApp } />
//             <Route exact path="/formElements" component={ FormFeilds } />
//             <Route strict path="/debug/:sessionId" component={Debug} />
//             <Route path="/:user_id" component={ Experiment } />
//           </Router>
// }

export { Login, Title }