import React from 'react'
import $ from 'jquery'

import { 
    Send, 
    ThumbUpAltRounded,
    ThumbDownAltRounded,
    ChatOutlined,
    Close
} from '@material-ui/icons'

import * as showdown from 'showdown' 
import * as json2md from 'json2md'

import './chat_interface.css'
import configJson from '../config/UI_configuration.json'
import { FormfromJSON } from './FormFeilds'


var converter = new showdown.Converter({'noHeaderId':'true'})


var currentTime = () => {
    const date = new Date()
    const hours = date.getHours()
    const min = date.getMinutes()
    const time = `${ hours === 0 ? 12 : hours > 12 ? Math.floor( hours % 12 ) : hours }:${ min > 9 ? min : '0'+min }${hours > 12 ? ' PM' : ' AM' }`
    return { time, date }
}

function sendFeedback( payload ){
    console.log( payload)
}


function MsgFeedback(props){
    const { data, updateData, askFeedback } = props

    function handleClick( className ){
        if( className === 'ThumbUp' ){
            document.getElementsByClassName('ThumbUp')[0].className = "ThumbUp_review"
            data.feedback_value = true
        }
        else{
            document.getElementsByClassName('ThumbDown')[0].className = "ThumbDown_review"
            data.feedback_value = false
        }

        sendFeedback( { question: data.question, answerJson: data.answerJson, feedback: data.feedback_value, cmt: '' } )
        updateData(data)
    }

    return  <>
                <div className="feedback">
                    { data.feedback_value !== null ?  
                        <div className={ `chat_icon ${ data.feedback_String !== null ? data.feedback_value ? 'positive' : 'negative' : null }` } 
                            onClick={e => { if( data.feedback_String === null ) askFeedback( data ) } }> <ChatOutlined   /> 
                        </div> 
                    : null }

                    { data.feedback_value === null || data.feedback_value ?  
                        <div className="ThumbUp"   onClick={e => handleClick('ThumbUp') } > <ThumbUpAltRounded   /> </div> 
                    : null }

                    { data.feedback_value === null || !data.feedback_value ? 
                        <div className="ThumbDown" onClick={e => handleClick('ThumbDown') } > <ThumbDownAltRounded /> </div> 
                    : null }

                </div>
            </>
}


class ChatInterface extends React.Component{
    constructor(props){
        super(props)

        this.state = { 
            show_dots: false,
            msgs: [],
            feedback_data: null,
            show_feedback_form: false,
            session_id: null
        }

        this.handleQuery = this.handleQuery.bind(this)
        this.servercall = this.servercall.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    getMsgStructure( user_type, msg, nudges = [], suggested = [], 
                        show_feedback = false, feedback_value = null, feedback_String = null, formJson= null,
                        hyperlinks= [], Images= [], Image_carousel= [], confirm_msgs=[], card_info= null
                    ){

        /*
            nudges => for clickable options below message
            suggested => clickable buttons for each reply
            show_feedback, feedback_value, feedback_String => boolean to show thumb UP/DOWN, thumb UP/DOWN, feedback message  
            hyperlinks => list of hyperlinks from the text message to be shown as clickable buttons below message
            form_feilds =>  embedding form inside message
            Images => images to shown along with messages
            Image_carousel => list of thumbnails and text along with link
            confirm_msgs => clickable buttons for confirmation
        */

        return  {   
                    user_type, msg, ...currentTime(), 
                    nudges, suggested, show_suggested: true, 
                    show_feedback, feedback_value, feedback_String, formJson,
                    hyperlinks, Images, Image_carousel, confirm_msgs, card_info
                }
    }

    getMsgs( serverResponse , show_feedback=false){

        let welcome_msgs = serverResponse.bot_response.map( msg_data => {
            const answerElement = msg_data.markdown && msg_data.markdown !== undefined ? this.markdown2HTML(msg_data.content) : msg_data

            return { user_type: 'bot', type: msg_data.type, msg: answerElement, ...currentTime(), show_feedback, feedback_value: null, feedback_String: null,
                    hyperlinks: msg_data.markdown && msg_data.markdown !== undefined ? 
                        this.getHyperlinksfromHTML( answerElement ): [] , question: '', answerJson: msg_data }
        })

        welcome_msgs[ welcome_msgs.length -1 ].suggested = serverResponse.footer_options

        return welcome_msgs
    }


    markdown2HTML( markdown ) {
        let answerElement = converter.makeHtml( json2md( markdown ) )
        answerElement = answerElement.replace(/<a href="/g,'<a target="_blank" href="')
        return answerElement
    }

    async componentDidMount(){
        // const welcome_msgs = configJson.welcome_msgs.map( msg_data => {
        //                         return {...this.getMsgStructure( msg_data.user_type, this.markdown2HTML(msg_data.msg), msg_data.nudges, msg_data.suggestions, 
        //                                                             msg_data.show_feedback, null, null, msg_data.formJson, [], [], [], [], msg_data.card_info)
        //                                              , question: '', answerJson: {} }
        //                     })

        // this.setState({ msgs : welcome_msgs })

        await fetch('/api/test-create-session',
          {
            method: 'POST',
            headers: {
              "content-type": "application/json"
            },
            body: {}
          }
        )
        .then( res => res.json())
        .then( responseJson => { 
            // console.log( responseJson ) 

            // let welcome_msgs = responseJson.bot_response.map( msg_data => {
            //     return {...this.getMsgStructure( 'bot', this.markdown2HTML(msg_data.content)), type: msg_data.type
            //                                                                 , question: '', answerJson: {} }
            // })

            // welcome_msgs[ welcome_msgs.length -1 ].suggested = responseJson.footer_options

            this.setState({ session_id: responseJson.session_id, msgs: this.getMsgs( responseJson ) })
        })

    }

    getHyperlinksfromHTML( html ){
        const regex = /<a(?<link>[^>]+)>(?<text>(?:.(?!<\/a>))*.)<\/a>/g
        const match = html.match( regex )

        if( match === null ) return []

        return match.map((anchor_tag) => {
            const text = anchor_tag.substring(
              anchor_tag.indexOf(">") + 1,
              anchor_tag.substr(1).indexOf("<") + 1
            );
        
            const href_index = anchor_tag.indexOf('href="');
            const href_text = anchor_tag.substr(href_index + 6);
            return { link: href_text.substring(0, href_text.indexOf('"')), text };
        })
    }

    async servercall( question ){
        await fetch('/api/test-user-query',
          {
            method: 'POST',
            headers: {
              "content-type": "application/json",
              "session": this.state.session_id
            },
            body: JSON.stringify({ query: question })
          }
        )
        .then( res => res.json())
        .then( responseJson => {
          this.setState({ show_dots: false })
          // console.log( responseJson )
            
          this.setState({ msgs: [ ...this.state.msgs, ...this.getMsgs( responseJson, true )] })
        //   responseJson.forEach( answer_element => {
        //     if( answer_element.type === 'TEXT' ){
    
        //         let { msgs } = this.state
        //         const answerElement = this.markdown2HTML( answer_element.answer_json.answer )

        //         msgs.push( {...this.getMsgStructure( 'bot', answerElement, 
        //                                                 answer_element.answer_json.nudges === undefined ? [] : answer_element.answer_json.nudges, [], 
        //                                                 true, null, null, this.getHyperlinksfromHTML( answerElement ) ) , question, answerJson: answer_element.answer_json } )
                
        //         this.setState({ msgs })
        //     }
        //   })
    
          document.getElementById('user_input').innerText = null
    
          this.scrollBottom()
    
        })
        .catch(err => {
          console.log( err )
        })
    
    }
    

    scrollBottom(){
        try{
            setTimeout( () => {
                const { clientHeight, scrollHeight } = document.getElementsByClassName('messages')[0]
                if( clientHeight !== scrollHeight )
                document.getElementsByClassName('messages')[0].scrollTop = scrollHeight
            }, 50)
        }  catch(err){}
    }


    handleQuery(e){
        const { value } = e.target

        if( value.length > 0 && !$('.send_icon').hasClass('query_available') )
            $('.send_icon').addClass('query_available')
        else if( value.length === 0 ) 
                $('.send_icon').removeClass('query_available')

        if ( e.keyCode === 13 && value.length > 0 ){
            e.target.value = ''
            let { msgs} = this.state
            msgs.push( { user_type:'user', msg: value, ...currentTime(), type: 'TEXT', suggested: [], show_feedback: false } )
            this.setState({show_dots: true, msgs})

            this.scrollBottom()
            this.servercall( value ) 
            this.scrollBottom()
        } 
    }

    handleClick(e){
        e.preventDefault()
        let { feedback_data, msgs } = this.state 
        const cmt = $('#feedback_note').val()
        msgs[ feedback_data.index ].feedback_String = cmt.length ? cmt : null
        sendFeedback( { question: feedback_data.question, answerJson: feedback_data.answerJson, feedback: feedback_data.feedback_value, cmt } )

        this.setState({ show_feedback_form: false, feedback_data: null, msgs })

    }

    getMessages( msgs ){
        return msgs.map( ( msg_data, index ) => {            

                return  <div key={ index } style={{ display: 'flex', marginLeft: msg_data.user_type === 'bot' ? '20px' : 'auto' }}>
                        <div style={{ width: '30px', height: '30px' }}>
                            { index === 0 || ( index > 0 && msgs[index-1].user_type !== 'bot'  ) ?  
                                <img src={ configJson.bot_image } alt="bot_image" className="bot_image" />  
                            : null }
                        </div>
                        <div style={{ width: '100%' }}>
                            { index === 0 || ( index > 0 && msgs[index-1].user_type !== 'bot'  ) ?  
                                <div className="bot_name">{ configJson.bot_name }</div>
                            : null }

                            <div className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` }> 
                                { msg_data.type === 'TEXT' ?
                                    <div className={`${msg_data.user_type}`} suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: msg_data.msg}} /> 
                                : null }

                                {/* {  msg_data.nudges.length > 0 ?
                                    <ul className="nudges">
                                        { msg_data.nudges.map( ( nudge, index) => {
                                            return  <li key={ index } onClick={e => this.handleQuery({...e, keyCode: 13, target: { value: nudge} }) } >
                                                    {nudge}
                                                    </li>
                                        }) 
                                        }
                                    </ul>
                                : null } */}

                                {   msg_data.type === 'FORM' ?
                                    <div className="msg_form" ><FormfromJSON json={ msg_data.msg } /></div>
                                : null}


                                {/* {   msg_data.card_info !== undefined && msg_data.card_info !== null ? 
                                    <div className="chat_card">
                                        <div><img src={ msg_data.card_info.img_url } alt="card_image" /></div>
                                        <div className="chat-text" dangerouslySetInnerHTML={{__html: this.markdown2HTML( msg_data.card_info.text ) }} />
                                    </div>
                                : null } */}
                            </div>


                            {  msgs.length - 1 === index || ( msgs[index + 1] !== undefined && msg_data.user_type !== msgs[index + 1].user_type ) ?
                                <div className="time">{ msg_data.time }</div> 
                            : null }

                            {   msg_data.suggested.length > 0 ?
                                    <div className="suggested_container">
                                        { 
                                            msg_data.suggested.map( ( suggested, idx ) => {
                                                return  <div key={ idx } className="suggested_que" 
                                                            onClick={e => this.handleQuery( { ...e, keyCode: 13, target: {value: suggested }})} > 
                                                            { suggested } 
                                                        </div>
                                            })
                                        }
                                    </div>
                                : null }

                            { msg_data.show_feedback ?
                                <MsgFeedback  
                                    data={ msg_data }   
                                    updateData={ newData  => {
                                        msgs[ index ] = newData
                                        this.setState({ msgs })
                                    }}
                                    askFeedback={data => this.setState({ feedback_data: {...data, index }, show_feedback_form: true })}
                                />
                            : null }
                        </div>
                    </div>
        })
    }


    render(){
        const messages = this.getMessages( this.state.msgs )

        return  <>
                    <div className="messages">
                        { messages }

                        { this.state.show_dots ?
                            <div  className="dots">
                                <div className="dot1"></div>
                                <div className="dot2"></div>
                                <div className="dot3"></div>
                            </div>
                        : null }
                    </div>
                    
                    { this.state.show_feedback_form ?   
                        <div className="feedback_form"> 
                            <div style={{ display: 'flow-root' }}> <Close className="close_icon" onClick={ e => this.setState({ show_feedback_form: false })} /> </div>
                            <div className="feedback_title"> 
                                <div id="feedback_thumbs">
                                    { this.state.feedback_data.feedback_value ? <div className="ThumbUp"   > <ThumbUpAltRounded   /> </div> : null }
                                    { !this.state.feedback_data.feedback_value ? <div className="ThumbDown" > <ThumbDownAltRounded /> </div> : null }
                                </div>

                                <div className={ `feedback_title_text ${ this.state.feedback_data.feedback_value ? 'positive' : 'negative' }`} > 
                                    { this.state.feedback_data.feedback_value ? configJson.positive_feedback : configJson.negative_feedback }
                                </div>
                            </div>

                            <textarea id="feedback_note" placeholder="Add a note." 
                                // onKeyUp={e => console.log(e.target.value)} 
                                // onChange={e => console.log( e.target.value )}  
                            >    
                            </textarea>
                            <div className="feedback_btns">
                                <button onClick={ this.handleClick } >Submit</button>
                            </div>
                        </div>
                    : null }



                    <div className="chat_text_handler" >
                        <input type="text" id="user_input"  className="msg_input" placeholder="Ask Something..." 
                            onKeyUp={ this.handleQuery }
                        />
                        <Send className={ `send_icon` }  />
                    </div>

                </>
    }
}

export default ChatInterface