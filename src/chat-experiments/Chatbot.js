import React from 'react'
import './chatbot.css'

import $ from 'jquery'

import { 
    Send, 
    ThumbUpAltRounded,
    ThumbDownAltRounded,
    ChatOutlined,
    Close,
    ChevronRight,
    ChevronLeft
} from '@material-ui/icons'

import uiJSON from './ui-custom.json'

// import dataJSON from './sampleJsons/cars-search.json'
// import dataJSON from './sampleJsons/ertiga vs innova.json'
// import dataJSON from './sampleJsons/ertiga_lxi_contact_dealer.json'
// import dataJSON from './sampleJsons/ertiga_lxi_sample.json'
// import dataJSON from './sampleJsons/ertiga_sample.json'
// import dataJSON from './sampleJsons/ford_figo.json'
// import dataJSON from './sampleJsons/i20_data.json'
import dataJSON from './sampleJsons/cumilative.json'

import agent_image from './agent.png'

import * as showdown from 'showdown' 
import * as json2md from 'json2md'
import { FormfromJSON } from './FormFeilds'

var converter = new showdown.Converter({'noHeaderId':'true'})

var currentTime = () => {
    const date = new Date()
    const hours = date.getHours()
    const min = date.getMinutes()
    const time = `${ hours === 0 ? 12 : hours > 12 ? Math.floor( hours % 12 ) : hours }:${ min > 9 ? min : '0'+min }${hours > 12 ? ' PM' : ' AM' }`
    return { time, date }
}


function markdown2HTML( markdown ) {
    let answerElement = converter.makeHtml( json2md( markdown ) )
    answerElement = answerElement.replace(/<a href="/g,'<a target="_blank" href="')

    return answerElement
}


function Card(props){
    const card_data = props.data

    return  <div className="card" 
                style={{ cursor: card_data.url !== undefined? 'pointer' : 'default' }}
                onClick={e => { if( card_data.url !== undefined ) window.open( card_data.url, '_blank' ) } }
                >
                <img src={ card_data.image } alt="card_image" />
                <div >
                    <div className="card_title" >{ card_data.title }</div>
                    <div className="card-text" dangerouslySetInnerHTML={{__html: markdown2HTML( card_data.content ) }} />
                </div>
            </div>
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
                    { data.feedback_value === null || !data.feedback_value ? 
                        <div className="ThumbDown" onClick={e => handleClick('ThumbDown') } > <ThumbDownAltRounded /> </div> 
                    : null }

                    { data.feedback_value === null || data.feedback_value ?  
                        <div className="ThumbUp"   onClick={e => handleClick('ThumbUp') } > <ThumbUpAltRounded   /> </div> 
                    : null }

                    { data.feedback_value !== null ?  
                        <div className={ `chat_icon ${ data.feedback_String !== null ? data.feedback_value ? 'positive' : 'negative' : null }` } 
                            onClick={e => { if( data.feedback_String === null ) askFeedback( data ) } }> <ChatOutlined   /> 
                        </div> 
                    : null }
                </div>
            </>
}



class ChatBot extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            show_dots: false,
            msgs: [],
            feedback_data: null,
            show_feedback_form: false,
            session_id: null
        }

        this.handleClick = this.handleClick.bind( this )
        this.handleQuery = this.handleQuery.bind( this )
    }

    async componentDidMount(){

        // await fetch('/api/test-create-session',
        //   {
        //     method: 'POST',
        //     headers: {
        //       "content-type": "application/json"
        //     },
        //     body: JSON.stringify({ context : null, timestamp : new Date(), channel : "cognichat" })
        //   }
        // )
        // .then( res => res.json())
        // .then( responseJson => { 

        //     this.setState({ session_id: responseJson.session_id, msgs: this.getMsgs( responseJson ) })
        // })
        // .catch(err => { console.log(err); this.setState({ show_dots: false })})

        let msgs = []

        dataJSON.forEach( msg => { 
            msgs.push( ...this.getMsgs( msg ) ) 
        })

        this.setState({
            msgs
        })

    }

    getMsgs( serverResponse , show_feedback=false){
        let welcome_msgs = serverResponse.bot_response.map( msg_data => {
            const answerElement = msg_data.markdown && msg_data.markdown !== undefined ? markdown2HTML(msg_data.content) : msg_data
            return  {   user_type:  serverResponse.user_agent !== undefined ? 'agent' :  msg_data.user === undefined ? 'bot': msg_data.user, 
                        type: msg_data.type, 
                        msg: answerElement, ...currentTime(), 
                        show_feedback: msg_data.show_feedback !== undefined ? msg_data.show_feedback : false, 
                        feedback_value: null, feedback_String: null,
                        hyperlinks: msg_data.markdown && msg_data.markdown !== undefined ? this.getHyperlinksfromHTML( answerElement ): [] , 
                        suggested: msg_data.footer_options || [], question: '', answerJson: msg_data 
                    }
        })

        // welcome_msgs[ welcome_msgs.length -1 ].suggested = serverResponse.footer_options
        // welcome_msgs[ welcome_msgs.length -1 ].show_feedback = show_feedback
        welcome_msgs[ welcome_msgs.length -1 ].answerJson = serverResponse.bot_response

        return welcome_msgs
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

    async servercall( question, type, isnudge ){
        let body = { 'query': null, form: null,  timestamp : new Date(), channel : "cognichat" }

        if( isnudge )
            body.nudge = true
        else 
            body.nudge = false

        body[ type ] = question
    
        await fetch('/api/test-user-query',
          {
            method: 'POST',
            headers: {
              "content-type": "application/json",
              "session": this.state.session_id
            },
            body: JSON.stringify(body)
          }
        )
        .then( res => res.json())
        .then( responseJson => {
          this.setState({ show_dots: false, msgs: [ ...this.state.msgs, ...this.getMsgs( responseJson, true )] })
          document.getElementById('user_input').value = null
          this.scrollBottom()
        })
        .catch(err => {
          console.log( err )
          this.setState({ show_dots: false })
        })
    
    }


    scrollBottom(){
        try{
            setTimeout( () => {
                const { clientHeight, scrollHeight } = document.getElementsByClassName('messages-container')[0]
                if( clientHeight !== scrollHeight )
                document.getElementsByClassName('messages-container')[0].scrollTop = scrollHeight
            }, 50)
        }  catch(err){}
    }

    handleClick(e){
        e.preventDefault()
        let { feedback_data, msgs } = this.state 
        const cmt = $('#feedback_note').val()
        msgs[ feedback_data.index ].feedback_String = cmt.length ? cmt : null
        sendFeedback( { question: feedback_data.question, answerJson: feedback_data.answerJson, feedback: feedback_data.feedback_value, cmt } )

        this.setState({ show_feedback_form: false, feedback_data: null, msgs })

    }

   
   
    handleQuery(e, type){
        let { value } = e.target
        if( value.length > 0 && !$('.send_icon').hasClass('query_available') )
            $('.send_icon').addClass('query_available')
        else if( value.length === 0 ) 
                $('.send_icon').removeClass('query_available')

        if ( e.keyCode === 13 && value.length > 0 ){
            $('.send_icon').removeClass('query_available')
            e.target.value = ''
            document.getElementById('user_input').value = null
            
            let { msgs} = this.state
            
            var json2str = ( json ) => { return json.map( feild => { return feild.key + ": " + feild.value } ).join('<br/>') }

            msgs.push( { user_type:'user', msg: typeof( value ) === "object" ? markdown2HTML( json2str( value ) ) : value ,
                                 ...currentTime(), type: 'TEXT', suggested: [], show_feedback: false } )
            this.setState({show_dots: true, msgs})

            this.scrollBottom()
            this.servercall( value, type === 'nudge' ? 'query' : type, type === 'nudge' ? true : false ) 
            this.scrollBottom()
        } 
    }

    getMessages( msgs ){
        let msgs_list = []
        msgs.forEach( ( msg_data, index ) => {
            if( index === 0 || ( index > 0 && msgs[index-1].user_type !== 'bot'  ) )
                /* bot persona */
                msgs_list.push( 
                    <div className="chat-persona" key={index+'_0'}>
                        <img src={ msg_data.user_type === 'agent' ? agent_image : uiJSON.bot_image } alt="bot_image" className="bot_image" />  
                        <div className="bot_name">{  msg_data.user_type === 'agent' ? uiJSON.agent_name : uiJSON.bot_name }</div>
                    </div>
                )   

            if( msg_data.type === 'TEXT' )
                /* text message */
                msgs_list.push(
                    <div className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` } key={index+'_1'}>   
                        <div className={`${msg_data.user_type}`} suppressContentEditableWarning 
                                                dangerouslySetInnerHTML={{ __html: msg_data.msg}} /> 
                    </div>
                )

            if( msg_data.type === 'CARD' )
                msgs_list.push(
                    <div className="single-card" key={index+'_2'}>
                        <Card data={ msg_data.answerJson[0] } />
                    </div> 
                )

            if( msg_data.type === 'CAROUSEL' ){
                msgs_list.push(
                    <div className={ `msg` } key={index+'_1'}>   
                        <div className={`${msg_data.user_type}`} suppressContentEditableWarning 
                                                dangerouslySetInnerHTML={{ __html: markdown2HTML( msg_data.msg.title ) }} /> 
                    </div>
                )

                let link = null
                let cards = []

                cards = msg_data.msg.content.filter( x => x.type === 'CARD' )
                link = msg_data.msg.content.filter( x => x.type !== 'CARD' )
                    
                msgs_list.push(
                    <div className="card-carousel" key={index+'_3'}>
                        <div className="navigation-btns">
                            {/* <ChevronLeft className="previous" />
                            <ChevronRight className="next" /> */}

                            {/* const ScrollElement = document.getElementsByClassName('suggested_ques_list')[0]
                                const { scrollWidth, scrollLeft } = ScrollElement
                                ScrollElement.scrollLeft = scrollWidth <= scrollLeft + 20 ? scrollWidth : scrollLeft + 20
                             */}
                        </div>
                        <div className={ `card-carousel-container ${ 'cards_list_'+index }` }>
                            {   cards.map( ( card_info, idx ) => {
                                    if( idx > 9 ) 
                                        return  <div className="link card" key={ idx }>
                                                    <a href={ markdown2HTML( link[0].content ).anchor.href } >see more</a> 
                                                </div> 

                                    if( idx > 10 ) return null
                                    return  <Card data={ card_info } key={idx} />
                                })
                            } 
                        </div>
                        
                        {/* { link.length > 0 ?
                            <div className="link" suppressContentEditableWarning 
                                                    dangerouslySetInnerHTML={{ __html: markdown2HTML( link[0].content ) }} /> 
                        : null } */}
                    </div> 
                )   
                
                msgs_list.push(
                    link.length > 0 ?
                        <div className={ `msg` } key={index+'_8'}> 
                            <div className="bot" suppressContentEditableWarning 
                                                    dangerouslySetInnerHTML={{ __html: markdown2HTML( link[0].content ) }} />
                        </div> 
                    : null
                )
            }


                // {/* {  msg_data.nudges.length > 0 ?
                //     <ul className="nudges">
                //         { msg_data.nudges.map( ( nudge, index) => {
                //             return  <li key={ index } onClick={e => this.handleQuery({...e, keyCode: 13, target: { value: nudge} }, "nudge") } >
                //                     {nudge}
                //                     </li>
                //         }) 
                //         }
                //     </ul>
                // : null } */}
                
            if( msg_data.suggested.length > 0 )
                msgs_list.push(
                    <div className="suggested_container" key={index+'_4'}>
                        { 
                            msg_data.suggested.map( ( suggested, idx ) => {
                                return  <div key={ idx } className="suggested_que" 
                                            onClick={e => this.handleQuery( { ...e, keyCode: 13, target: {value: suggested }}, "nudge")} > 
                                            { suggested } 
                                        </div>
                            })
                        }
                    </div>
                )

            if(msg_data.type === 'FORM')
                msgs_list.push( 
                    <div className="msg_form" key={index+'_5'}>
                        <FormfromJSON 
                            json={ msg_data.msg } 
                            readOnly = { msg_data.readOnly }
                            onSubmit={data =>  {
                                this.handleQuery({ target: { value: data}, keyCode: 13 }, "form");
                                msgs[ index ].readOnly = true
                                this.setState({msgs})
                            }}
                        />
                    </div>
                )

            if( msg_data.show_feedback )
                msgs_list.push(
                    <MsgFeedback  
                        key={index+'_6'}
                        data={ msg_data }   
                        updateData={ newData  => {
                            msgs[ index ] = newData
                            this.setState({ msgs })
                        }}
                        askFeedback={data => this.setState({ feedback_data: {...data, index }, show_feedback_form: true })}
                    />
                )

            /* time */
            if( msgs.length - 1 === index || ( msgs[index + 1] !== undefined && msg_data.user_type !== msgs[index + 1].user_type ) )
                msgs_list.push(
                    <div className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` } key={index+'_7'}>   
                        <div className="time">{ msg_data.time }</div> 
                    </div>
                )

        })


        return msgs_list        
    }



    render(){
        const messages = this.getMessages( this.state.msgs ) 

        // console.log( this.state.msgs )

        return  <>
                    <div className="messages-container">
                        { messages }

                        { this.state.show_dots ?
                            <div  className="dots">
                                <div className="dot1"></div>
                                <div className="dot2"></div>
                                <div className="dot3"></div>
                            </div>
                        : null }
                    </div>

                    <div className="chat_text_handler" >
                        <input type="text" id="user_input"  className="msg_input" placeholder={ uiJSON.input_placeholder }
                            onKeyUp={e => this.handleQuery(e, "query") }
                        />
                        <Send className={ `send_icon` } 
                            onClick={e => this.handleQuery({...e, keyCode: 13, target: { value: $('#user_input').val()} }, "query")} 
                        />
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
                                    { this.state.feedback_data.feedback_value ? uiJSON.positive_feedback : uiJSON.negative_feedback }
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
                </>
    }
}

export default ChatBot