import React from 'react'
import './App.css'

import { Send } from '@material-ui/icons'

import * as showdown from 'showdown' 
import * as json2md from 'json2md'

var converter = new showdown.Converter({'noHeaderId':'true'})


class App extends React.Component{
  constructor(props){
    super()

    this.state = {
      query:"",
      msgs: [
          { user_type: 'bot', msg: 'Hi', ...this.currentTime()},
          // { user_type: 'bot1', msg: 'Welcome to CarsQA chatbot1.', ...this.currentTime() },
          { user_type: 'bot', msg: 'How can I help you?', ...this.currentTime()}
      ],
      suggested:[
        "what are the variants of alto?",
        "what is the mileage of alto?",
        "list of new cars",
        "most sold car"
      ],
      answers:[
        [
          [
              [
                  {
                      "p": "Alto has following variants :"
                  },
                  {
                      "ul": [
                          {
                              "p": "Maruti Suzuki Alto LXi (O) CNG. It's fuel type - CNG"
                          },
                          {
                              "p": "Maruti Suzuki Alto LXi CNG. It's fuel type - CNG"
                          },
                          {
                              "p": "Maruti Suzuki Alto STD. It's fuel type - Petrol"
                          },
                          {
                              "p": "Maruti Suzuki Alto LXi (O). It's fuel type - Petrol"
                          },
                          {
                              "p": "Maruti Suzuki Alto VXi. It's fuel type - Petrol"
                          },
                          {
                              "p": "Maruti Suzuki Alto VXi Plus. It's fuel type - Petrol"
                          },
                          {
                              "p": "Maruti Suzuki Alto STD (O). It's fuel type - Petrol"
                          }
                      ]
                  }
              ]
          ]
        ],
        [{"p": "which variant are you interested in?"}],
      ],
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
    const time = `${hours === 0 ? 12 : hours}:${min}${hours > 12 ? ' PM' : ' AM' }`
    return { time, date }
  }



  handleQuery(e, question= ""){
    if ( ( e.keyCode === 13 && this.state.query.length > 0 ) || question.length > 0 ){
      this.setState({show_dots: true})
      let {query, msgs} = this.state
      const user_query = { user_type: 'user', msg: question.length > 0 ? question : this.state.query, ...this.currentTime() }
      msgs.push(user_query)
      
      setTimeout( () => {
        try{

          setTimeout(()=>{
            let answerElement = converter.makeHtml( json2md( this.state.answers[0] ) )
            answerElement = answerElement.replace(/<a href="/g,'<a target="_blank" href="')
            msgs.push( { user_type: 'bot', msg: answerElement, ...this.currentTime() } )
            this.setState({ msgs, show_dots: true })
           
            try{
              const { clientHeight, scrollHeight } = document.getElementsByClassName('messages')[0]
              if( clientHeight !== scrollHeight )
                document.getElementsByClassName('messages')[0].scrollTop = scrollHeight
            }
            catch(err){}

            setTimeout(() => {
              let answerElement = converter.makeHtml( json2md( this.state.answers[1] ) )
              answerElement = answerElement.replace(/<a href="/g,'<a target="_blank" href="')
              msgs.push( { user_type: 'bot', msg: answerElement, ...this.currentTime() } )
              this.setState({ msgs, show_dots: false })

              try{
                const { clientHeight, scrollHeight } = document.getElementsByClassName('messages')[0]
                if( clientHeight !== scrollHeight )
                  document.getElementsByClassName('messages')[0].scrollTop = scrollHeight
              }
              catch(err){}
              
            }, 800)
          }, 200)

          this.setState({ show_dots: false })
          query = ''
          document.getElementById('user_input').innerText = null

          const { clientHeight, scrollHeight } = document.getElementsByClassName('messages')[0]
          if( clientHeight !== scrollHeight )
            document.getElementsByClassName('messages')[0].scrollTop = scrollHeight
        }
        catch(err){}

      }, 250) 

      this.setState({ query, msgs})
    }
  }

  move_left(e){
    const ScrollElement = document.getElementsByClassName('suggested_ques_list1')[0]
    const { scrollLeft } = ScrollElement
    ScrollElement.scrollLeft = 0 >= scrollLeft - 20 ? 0 : scrollLeft - 20
  }

  move_right(e){
    const ScrollElement = document.getElementsByClassName('suggested_ques_list1')[0]
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
                                  <div key={index} className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` } > 
                                    <div className={`${msg_data.user_type}`} suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: msg_data.msg}} /> 
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
        messages.push(<div key={ `_${index}`} className="block "  >{ messages_block }</div> )
        messages_block = []
        // if( this.state.msgs[index + 1] !== undefined )
        // console.log( msg_data.msg, this.state.msgs[index + 1].time, msg_data.time, prev_type, this.state.msgs[index + 1].user_type  )

        messages_block.push( <div key={ index }>
                              <div className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` } > 
                                <div className={`${msg_data.user_type}`} suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: msg_data.msg}} /> 
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
        messages.push(<div key={ index } className="block"  >{ messages_block }</div> )
      }

      prev_type = msg_data.user_type
    })


    return (
      <div className="App ">
        <div className="App-header">
          <div className="title">CarsQA</div>
        </div>
        <div className="separater"></div>

        <div className="chat_interface">
          <div className="chat_window" >
            <div className="messages">
              { messages }
            </div>

            { this.state.showSuggestions ?
              <div className="suggestion_ques_box">
                <div className="lt-arrow" onClick={this.move_left}>&#10094;</div>
                <div className="suggested_ques_list">
                  {
                    this.state.suggested.map(( question, index) => {
                        return <div key={index} className="suggested_que" onClick={e => { this.setState({showSuggestions: false}); this.handleQuery({...e, keyCode: 13}, question) } }>{question}</div>
                    })
                  }
                </div>
                <div className="rt-arrow" onClick={this.move_right} >&#10095;</div>
              </div>
            : null }

            { this.state.show_dots ?
              <div  className="dots">
                <div className="dot1"></div>
                <div className="dot2"></div>
                <div className="dot3"></div>
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