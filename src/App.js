import React from 'react'
import './App.css'

import { Send,
  ThumbUp,
  ThumbDown 
} from '@material-ui/icons'

import * as showdown from 'showdown' 
import * as json2md from 'json2md'

var converter = new showdown.Converter({'noHeaderId':'true'})

class App extends React.Component{
  constructor(props){
    super()

    this.state = {
      query:"",
      msgs: [
          { user_type: 'bot', msg: 'Hi !', ...this.currentTime(), nudges: []},
          // { user_type: 'bot1', msg: 'Welcome to CarsQA chatbot1.', ...this.currentTime() },
          { user_type: 'bot', msg: `I am 'BmBot' , your assistant.<br/> I am here to answer any questions
                                     you may have about the Bharat Matrimony service.<br/> What would you like 
                                     to know?`,
             ...this.currentTime(), nudges: []}
      ],
      suggested:['i am having match problems', 'What is profile validation?'],
      answers:[],
      suggested_visible: 0,
      showSuggestions: true,
      show_dots: false
    } 

    this.handleQuery = this.handleQuery.bind(this)
    this.currentTime = this.currentTime.bind(this)
  }

  currentTime(){
    const date = new Date()
    const hours = date.getHours()
    const min = date.getMinutes()
    const time = `${hours === 0 ? 12 : hours > 12 ? Math.floor( hours/12 ) : hours }:${min}${hours > 12 ? ' PM' : ' AM' }`
    return { time, date }
  }


  async servercall( question ){
    await fetch('/api/106',
      {
        method: 'POST',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ question })
      }
    )
    .then( res => res.json())
    .then( responseJson => {
      this.setState({ show_dots: false })
      // console.log( responseJson )

      responseJson.forEach( answer_element => {
        if( answer_element.type === 'TEXT' ){

          let { msgs, suggested } = this.state

          let answerElement = converter.makeHtml( json2md( answer_element.answer_json.answer ) )
          answerElement = answerElement.replace(/<a href="/g,'<a target="_blank" href="')
          msgs.push( { user_type: 'bot', msg: answerElement, ...this.currentTime(), nudges: answer_element.answer_json.nudges === undefined ? [] : answer_element.answer_json.nudges } )
          // suggested = answer_element.answer_json.nudges
          this.setState({ msgs, suggested })
        }
      })

      document.getElementById('user_input').innerText = null

      try{
        const { clientHeight, scrollHeight } = document.getElementsByClassName('messages')[0]
        if( clientHeight !== scrollHeight )
          document.getElementsByClassName('messages')[0].scrollTop = scrollHeight
      }
      catch(err){}

    })
    .catch(err => {
      console.log( err )
    })

  }


  handleQuery(e, question= ""){
    if ( ( e.keyCode === 13 && this.state.query.length > 0 ) || question.length > 0 ){
      let { msgs} = this.state
      document.getElementById('user_input').innerText = null
      const user_query = { user_type: 'user', msg: question.length > 0 ? question : this.state.query, ...this.currentTime(), nudges: [] }
      msgs.push(user_query)
      this.setState({show_dots: true, query: ''})
      this.servercall( user_query.msg ) 
      this.setState({ msgs})
    }
  }

  move_left(e){
    const ScrollElement = document.getElementsByClassName('suggested_ques_list')[0]
    const { scrollLeft } = ScrollElement
    ScrollElement.scrollLeft = 0 >= scrollLeft - 20 ? 0 : scrollLeft - 20
  }

  move_right(e){
    const ScrollElement = document.getElementsByClassName('suggested_ques_list')[0]
    const { scrollWidth, scrollLeft } = ScrollElement
    ScrollElement.scrollLeft = scrollWidth <= scrollLeft + 20 ? scrollWidth : scrollLeft + 20
  }

  render(){
    let prev_type = 'bot'
    let messages_block = []

    let messages = []
    
    this.state.msgs.forEach( (msg_data, index) => {
      if ( prev_type.length === 0 || prev_type === msg_data.user_type  ){
        // if( this.state.msgs[index + 1] !== undefined )
        //   console.log( msg_data.msg, this.state.msgs[index + 1].time, msg_data.time, prev_type, this.state.msgs[index + 1].user_type  )

        messages_block.push(  <div key={index}>
                                <div className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` } > 
                                  <div className={`${msg_data.user_type}`} suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: msg_data.msg}} /> 
                                  
                                  {  msg_data.nudges.length > 0 ?
                                    <ul className="nudges">
                                      { msg_data.nudges.map( ( nudge, index) => {
                                          return  <li key={ index } onClick={e => { this.setState({showSuggestions: true}); this.handleQuery({...e, keyCode: 13}, nudge) } } >
                                                    {nudge}
                                                  </li>
                                        }) 
                                      }
                                    </ul>
                                  : null }

                                </div>  
                                { this.state.msgs[index + 1] === undefined 
                                  || ( this.state.msgs[index + 1] !== undefined && this.state.msgs[index + 1].time !== msg_data.time ) 
                                    || ( this.state.msgs[index + 1] !== undefined && msg_data.user_type !== this.state.msgs[index + 1].user_type )?  
                                    <div className="time">{msg_data.time}</div> 
                                : null }

                            </div>
          )
      }
      else {
        messages.push( <div key={ `*${index}`}> 
                          <div className="block "  >{ messages_block }</div>  
                          { msg_data.user_type === 'user' ?
                            <div className="feedback">
                                  <ThumbUp   className="ThumbUp" />
                                  <ThumbDown className="ThumbDown" />
                            </div>
                          : null }
                        </div>
                      )

        messages_block = []
        // if( this.state.msgs[index + 1] !== undefined )
        // console.log( msg_data.msg, this.state.msgs[index + 1].time, msg_data.time, prev_type, this.state.msgs[index + 1].user_type  )

        messages_block.push( <div key={ index }>
                              <div className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` } > 
                                <div className={`${msg_data.user_type}`} suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: msg_data.msg}} /> 

                                {  msg_data.nudges.length > 0 ?
                                  <ul className="nudges">
                                    { msg_data.nudges.map( ( nudge, index) => {
                                        return  <li key={ index } onClick={e => { this.setState({showSuggestions: true}); this.handleQuery({...e, keyCode: 13}, nudge) } } >
                                                  {nudge}
                                                </li>
                                      }) 
                                    }
                                  </ul>
                                : null }
                              </div>
                              
                              { this.state.msgs[index + 1] === undefined 
                                  || ( this.state.msgs[index + 1] !== undefined && this.state.msgs[index + 1].time !== msg_data.time ) 
                                    || ( this.state.msgs[index + 1] !== undefined && msg_data.user_type !== this.state.msgs[index + 1].user_type )?  
                                    <div className="time">{msg_data.time}</div> 
                              : null }

                            </div>
          )
      }

      if( index === this.state.msgs.length -1 ){
        messages.push( <div key={ `_${index}`}> 
                          <div className="block "  >{ messages_block }</div>  
                          {/* { msg_data.user_type === 'user' ? */}
                            <div className="feedback">
                                  <ThumbUp   className="ThumbUp" />
                                  <ThumbDown className="ThumbDown" />
                            </div>
                          {/* : null }  */}
                        </div>
                      )
      }

      prev_type = msg_data.user_type
    })

    document.title = 'Bharat Matrimony Chatbot | CogniQA Framebot'
    

    return (
      <div className="App ">
        <div className="App-header">
          <div className="title">Bharat Matrimony Chatbot</div>
          <div className="tagline">powered by CogniQA platform</div>
        </div>
        <div className="separater"></div>

        <div className="chat_interface">
          <div className="chat_window" >
            <div className="messages">
              { messages }
            </div>

            { this.state.show_dots ?
              <div  className="dots">
                <div className="dot1"></div>
                <div className="dot2"></div>
                <div className="dot3"></div>
              </div>
            : null }

            { this.state.showSuggestions ?
              <div className="suggestion_ques_box">
                { this.state.suggested.length > 2 ? <div className="lt-arrow" onClick={this.move_left}>&#10094;</div> : null }
                <div className="suggested_ques_list">
                  {
                    this.state.suggested.map(( question, index) => {
                        return <div key={index} className="suggested_que" 
                                  onClick={e => { this.setState({showSuggestions: true}); this.handleQuery({...e, keyCode: 13}, question) } }
                                >{question}</div>
                    })
                  }
                </div>
                { this.state.suggested.length > 2 ? <div className="rt-arrow" onClick={this.move_right} >&#10095;</div> : null }
              </div>
            : null }

            <div className="chat_text_handler">
              <div id="user_input" contentEditable="true" suppressContentEditableWarning="true" className="msg_input" data-placeholder="Ask Something..." 
                onInput={e => this.setState({ query: e.target.innerText === '\n\n\n' ? '' : e.target.innerText})  } onKeyUp={this.handleQuery} >{''}</div>
              <Send className={`send_icon ${ this.state.query.length > 0 ? 'query_available' : ''}`} onClick={e => this.handleQuery({...e,keyCode: 13}) } />
          </div>
        </div>
      </div>
    </div>
    );
  }
}

export default App