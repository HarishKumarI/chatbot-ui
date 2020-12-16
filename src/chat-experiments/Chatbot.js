import React from 'react'
import './chatbot.css'

import $ from 'jquery'

import { 
    Send, 
    ThumbUpAltRounded,
    ThumbDownAltRounded,
    ChatOutlined,
    Close,
    // ChevronRight,
    // ChevronLeft
} from '@material-ui/icons'

import uiJSON from './ui-custom.json'

// import dataJSON from './sampleJsons/cars-search.json'
// import dataJSON from './sampleJsons/ertiga vs innova.json'
// import dataJSON from './sampleJsons/ertiga_lxi_contact_dealer.json'
// import dataJSON from './sampleJsons/ertiga_lxi_sample.json'
// import dataJSON from './sampleJsons/ertiga_sample.json'
// import dataJSON from './sampleJsons/ford_figo.json'
// import dataJSON from './sampleJsons/i20_data.json'
// import dataJSON from './sampleJsons/cumilative.json'

import agent_image from './agent.png'

import * as showdown from 'showdown' 
import * as json2md from 'json2md'
import { FormfromJSON } from './FormFeilds'
import { TextMore } from '../components/TextMore' 

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
    // console.log( card_data )
    return  <div className={ props.compare === undefined ? 'card' : '' } 
                style={{ cursor: card_data.url !== undefined? 'pointer' : 'default' }}
                onClick={e => { 
                    console.log( e.target )
                    // if( card_data.url !== undefined && !e.target.class_list.includes( 'card_btn') ) window.open( card_data.url, '_blank' ) 
                }}
                title={ card_data.url !== undefined ? `Open ${ card_data.title } page` : '' }
                >
                <img src={ card_data.image.length > 0 ? card_data.image : uiJSON.alt_img_link } alt="card_image" 
                    title={ card_data.url !== undefined ? `Open ${ card_data.title } page`: '' } />
                <div className="card_body">
                    <div className="card_title"  dangerouslySetInnerHTML={{ __html: markdown2HTML( card_data.title ) }} />
                    <div className="card-text" dangerouslySetInnerHTML={{__html: markdown2HTML( card_data.content ) }} />
                </div>
                {  card_data.query !== undefined ?
                    <div className="card_btn" title={ props.submitQuery !== undefined ? `Show ${ card_data.title } Summary` : '' }
                        onClick={e => props.submitQuery( e, card_data.query )}
                    > View Summary</div>
                : null }
                {  card_data.link !== undefined ?
                    <div className="card_link">
                        <a href={ card_data.link }  target="_blank" rel="noopener noreferrer" >
                            <div dangerouslySetInnerHTML={{ __html: card_data.link_text === undefined ? 'View Details' : card_data.link_text }} />
                        </a>
                    </div>
                : null }
            </div>
}


function sendFeedback( payload, cmt){
    // console.log( payload )
    fetch( `/api/${ cmt ? 'feedback-long' : 'feedback-short' }`, 
        {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                "content-encoding": "gzip"
            },
            body: JSON.stringify({ feedback : payload.feedback, feedback_text: payload.cmt})
        }
    )
    .then( res => res.json() )
    .then( responseJson => {
        console.log( responseJson )
    }) 
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
            askFeedback( data )
        }

        sendFeedback( { question: data.question, answerJson: data.answerJson, feedback: data.feedback_value, cmt: '' }, false )
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
                            onClick={e => {askFeedback( data ) } }> <ChatOutlined   /> 
                        </div> 
                    : null }
                </div>
            </>
}



class ChatBot extends React.Component{
    carousel_heights = {}
    constructor(props){
        super(props)

        this.state = {
            show_dots: false,
            msgs: [],
            feedback_data: null,
            show_feedback_form: false,
            session_id: null,
            user_id: null
        }

        this.handleClick = this.handleClick.bind( this )
        this.handleQuery = this.handleQuery.bind( this )
    }

    async createSession( user_id, reset_session ){
        if( reset_session ){
				document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
				// console.log( document.cookie )
//             await await fetch('/api/drop-cookie',
//             {
//               method: 'POST',
//               headers: {
//                 "content-type": "application/json",
//                 "content-encoding": "gzip"
//               },
//               body: JSON.stringify( {} )
//             }
//           )
//           .then( res => res.json())
//           .then( responseJson => { 
//               console.log( responseJson )
//           })
//           .catch(err => { 
//               console.log(err); 
//               // $('#root').append(`<div class="errormsg" style="background-color: rgb(221, 103, 103)"> Sorry, there was an unexpected error in this service. </div>`)
//           })
        }

        let body = { context : null, timestamp : new Date(), channel : "cognichat", user_id, reset_session, env: process.env.REACT_APP_STAGE }

        await fetch('/api/test-create-session',
          {
            method: 'POST',
            headers: {
              "content-type": "application/json",
              "content-encoding": "gzip"
            },
            body: JSON.stringify( body )
          }
        )
        .then( res => res.json())
        .then( responseJson => { 

            this.setState({ session_id: responseJson.session_id, msgs: this.getMsgs( responseJson ) })
        })
        .catch(err => { 
            console.log(err); 
            this.setState({ show_dots: false })
            // $('#root').append(`<div class="errormsg" style="background-color: rgb(221, 103, 103)"> Sorry, there was an unexpected error in this service. </div>`)
        })
    }


    async componentDidMount(){
        // console.log( this.props.user_id_props.match.params['user_id'] )
        // console.log( this.props )

        this.setState({ user_id: this.props.user_id })

        if( this.props.data !== undefined ){
            await this.createSession( this.props.user_id, true )   

            for( const msg_id in this.props.data ){
                const msg = this.props.data[msg_id]

                await this.handleQuery({ target: { value: msg.type === 'form' ? msg.form : msg.query }, keyCode: 13 }, msg.type )
            }

        }
        else
            this.createSession( this.props.user_id, false )

        // let msgs = []

        // dataJSON.forEach( msg => { 
        //     msgs.push( ...this.getMsgs( msg ) ) 
        // })

        // this.setState({
        //     msgs
        // })
    }

    getMsgs( serverResponse , show_feedback=false){
        let welcome_msgs = serverResponse.bot_response.map( ( msg_data, index, arr ) => {
            const answerElement = msg_data.markdown && msg_data.markdown !== undefined ? markdown2HTML(msg_data.content) : msg_data
            return  {   user_type:  serverResponse.user_agent !== undefined ? 'agent' :  msg_data.user === undefined ? 'bot': msg_data.user, 
                        type: msg_data.type, 
                        msg: answerElement, ...currentTime(), 
                        show_feedback: msg_data.show_feedback !== undefined ? msg_data.show_feedback : show_feedback && arr.length - 1 === index ? show_feedback : false, 
                        feedback_value: null, feedback_String: null,
                        hyperlinks: msg_data.markdown && msg_data.markdown !== undefined ? this.getHyperlinksfromHTML( answerElement ): [] , 
                        suggested: msg_data.footer_options || [], question: '', answerJson: serverResponse.bot_response,
                        index: index,
                        card_limit: 9,
                        carousel_limit: 0
                    }
        })

        // welcome_msgs[ welcome_msgs.length -1 ].suggested = serverResponse.footer_options
        // welcome_msgs[ welcome_msgs.length -1 ].show_feedback = show_feedback
        // welcome_msgs[ welcome_msgs.length -1 ].answerJson = serverResponse.bot_response

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
        let body = { 'query': null, form: null,  timestamp : new Date(), channel : "cognichat", session_id: this.state.session_id, user_id: this.state.user_id, env: process.env.REACT_APP_STAGE }

        if( isnudge )
            body.nudge = true
        else 
            body.nudge = false

        body[ type ] = question
    
        // console.log( body, new Date() )
        await fetch('/api/test-user-query',
          {
            method: 'POST',
            headers: {
              "content-type": "application/json",
              "session": this.state.session_id,
              "content-encoding": "gzip"
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
            let { msgs } = this.state
            msgs.push( { user_type:'bot', msg: 'Sorry, there was an unexpected error in this service. We are fixing it.',
                                   ...currentTime(), type: 'TEXT', suggested: [], show_feedback: false } )

            this.setState({ show_dots: false, msgs })
            
            // $('#root').append(`<div class="errormsg" style="background-color: rgb(221, 103, 103)"> Sorry, there was an unexpected error in this service. We are fixing it.  </div>`)
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
        window.scrollTo(0,document.body.scrollHeight);
    }

    handleClick(e){
        e.preventDefault()
        let { feedback_data, msgs } = this.state 
        const cmt = document.getElementById('feedback_note').innerText
        msgs[ feedback_data.index ].feedback_String = cmt.length ? cmt : null
        sendFeedback( { question: feedback_data.question, answerJson: feedback_data.answerJson, feedback: feedback_data.feedback_value, cmt }, true )
        // console.log( msgs[ feedback_data.index ], cmt )
        this.setState({ show_feedback_form: false, feedback_data: null, msgs })

    }

   
   
    async handleQuery(e, type){
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
            var json2str = ( json ) => { return json.map( feild => { return feild.key + ": " + feild.value.display_value } ).join('<br/>') }

            msgs.push( { user_type:'user', msg: typeof( value ) === "object" ? markdown2HTML( json2str( value ) ) : value ,
                                 ...currentTime(), type: 'TEXT', suggested: [], show_feedback: false } )
            this.setState({show_dots: true, msgs})

            this.scrollBottom()
            await this.servercall( value, type === 'nudge' ? 'query' : type, type === 'nudge' ? true : false ) 
            this.scrollBottom()
        } 
    }

    getMessages( msgs ){
        let msgs_list = []
        

        msgs.forEach( ( msg_data, index ) => {
            if( index === 0 || ( index > 0 && msgs[index-1].user_type !== 'bot' && msgs[index-1].user_type !== msg_data.user_type ) )
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
                    msg_data.user_type === 'user' ? 
                    <div className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` } key={index+'_1'}>   
                        <div className={`${msg_data.user_type}`} suppressContentEditableWarning 
                                                dangerouslySetInnerHTML={{ __html: msg_data.msg}} /> 
                    </div>
                    : 
                    <div className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` } key={index+'_1'}>  
                        <div className={`${msg_data.user_type}`}>
                            <TextMore HTML={ msg_data.msg } />
                        </div> 
                    </div>
                )

            if( msg_data.type === 'CARD' ){
                msgs_list.push(
                    <div className="single-card" key={index+'_2'}>
                        <Card data={ msg_data.answerJson[ msg_data.index ] } 
                            submitQuery={ ( e,query) => this.handleQuery({...e, keyCode: 13, target: { value: query} }, "query")} 
                        />
                    </div> 
                )
            }
            
            if( msg_data.type === 'CAROUSEL' ){
                if( msg_data.msg.title.length > 0 )
                    msgs_list.push(
                        <div className={ `msg` } key={index+'_1'}>   
                            <div className={`${msg_data.user_type}`} suppressContentEditableWarning 
                                                    dangerouslySetInnerHTML={{ __html: markdown2HTML( msg_data.msg.title ) }} /> 
                        </div>
                    )

                let link = null
                let cards = []

                cards = msg_data.msg.content.filter( x => x.type === 'CARD' )
                link = msg_data.msg.content.filter( x => x.type === 'LINK' )
                const carousel_cards = cards
                const carousel_idx = index
                
                // let no_carousels = Array.apply( null, new Array( Math.ceil( cards.length / msg_data.card_limit ) ) )

                // console.log( cards.slice( 0, msg_data.card_limit), msg_data.carousel_limit, no_carousels )

                // no_carousels.forEach( ( _, carousel_idx) => {
                //     if ( carousel_idx <= msg_data.carousel_limit ){
                //         const carousel_cards = cards.slice( carousel_idx*msg_data.card_limit,  ( carousel_idx + 1 )*msg_data.card_limit )
                        
                        // console.log( carousel_idx*msg_data.card_limit,  ( carousel_idx + 1 )*msg_data.card_limit )

                        msgs_list.push(
                            <div className="card-carousel" key={index+'_3_'+carousel_idx}>
                                <div className="navigation-btns">
                                    {/* <ChevronLeft className="previous" /> */}
                                    {/* <ChevronRight className="next" /> */}
                                    
                                    {/* {   carousel_idx === msg_data.carousel_limit && carousel_cards.length >= msg_data.card_limit ?
                                            <div className="link next"
                                                onClick={e => {
                                                        // console.log( msg_data.card_limit )
                                                        msg_data.carousel_limit += 1
                                                        // console.log( msg_data.card_limit ) 
                                                        this.setState({ msgs })
                                                    }}
                                            > More </div>
                                        : null
                                    } */}
        
                                    {/* const ScrollElement = document.getElementsByClassName('suggested_ques_list')[0]
                                        const { scrollWidth, scrollLeft } = ScrollElement
                                        ScrollElement.scrollLeft = scrollWidth <= scrollLeft + 20 ? scrollWidth : scrollLeft + 20
                                     */}
                                </div>
                                <div className={ `card-carousel-container ${ 'cards_list_'+index+'_'+carousel_idx }` }>
                                    {   
                                        carousel_cards.map( ( card_info, idx ) => {
                                            if( idx > msg_data.card_limit +1 ) return null
                                            if( idx > msg_data.card_limit ) 
                                                return  <div className="link" key={idx} 
                                                            onClick={e => {
                                                                    // console.log( msg_data.card_limit )
                                                                    msg_data.card_limit += 10
                                                                    // console.log( msg_data.card_limit ) 
                                                                    this.setState({ msgs })
                                                                }}
                                                        > More </div>
                                                            
                                            if( msg_data.msg.compare || cards.length === 2 )
                                                return  <div className="single-card" key={idx}>
                                                            <Card data={ card_info } compare={ msg_data.msg.compare || cards.length === 2 } 
                                                                submitQuery={ (e, query) => this.handleQuery({...e, keyCode: 13, target: { value: query} }, "query")}
                                                            />
                                                        </div> 
                                            
                                            return  <Card data={ card_info } key={idx} 
                                                        submitQuery={ (e,query) => this.handleQuery({...e, keyCode: 13, target: { value: query} }, "query")}
                                                    />
                                        })
                                    } 
                                </div>
                                
                                {/* { link.length > 0 ?
                                    <div className="link" suppressContentEditableWarning 
                                                            dangerouslySetInnerHTML={{ __html: markdown2HTML( link[0].content ) }} /> 
                                : null } */}
                            </div> 
                        )         
                    // }
                // })
 
                
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
                                            onClick={e => this.handleQuery( { ...e, keyCode: 13, target: {value: suggested.query }}, "nudge")} > 
                                            { suggested.display_text } 
                                        </div>
                            })
                        }
                    </div>
                )

            if(msg_data.type === 'FORM'){
                // console.log( msg_data )
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
            }


            /* time */
            if( msgs.length - 1 === index || ( msgs[index + 1] !== undefined && msg_data.user_type !== msgs[index + 1].user_type ) )
                msgs_list.push(
                    <div className={ `msg ${ msg_data.user_type === 'user' ? 'user_text' : '' }` } key={index+'_7'}>   
                        <div className="time">{ msg_data.time }</div> 
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
                        askFeedback={data => { 
                            setTimeout( () => { $('#feedback_note').text(data.feedback_String) }, 15) 
                            // console.log(data.feedback_String, $('#feedback_note').text() );
                            this.setState({ feedback_data: {...data, index }, show_feedback_form: true }) 
                        }  }
                    />
                )


        })


        return msgs_list        
    }


    evenCardsHeight(e){
        var class_list =  Array.from( document.getElementsByClassName('card-carousel-container') ).map( carousel => { return ( carousel.className.split(' ')[1] ) })
        // console.log( class_list, new Date(), document.getElementsByClassName('card-carousel-container') )
        class_list.forEach( carousel => {
            // console.log( carousel )
            let cards = Array.from( document.getElementsByClassName( carousel )[0].children ).filter( x => x.className.includes( 'card' ) )
            let max_height = 0
            // console.log( cards.length )
            cards.forEach( card => {
                max_height = max_height < card.getElementsByClassName('card_body')[0].offsetHeight ? card.getElementsByClassName('card_body')[0].offsetHeight : max_height
            })
            if( !Object.keys( this.carousel_heights ).includes( carousel ) )
                this.carousel_heights[ carousel ] = max_height
            // console.log( max_height, this.carousel_heights )
            cards.forEach( card => {
                card.getElementsByClassName('card_body')[0].style.height = `${this.carousel_heights[ carousel ]}px`
            })
        })
    }

    render(){
        const messages = this.getMessages( this.state.msgs ) 

        setTimeout( () => { this.evenCardsHeight() }, 100 )

        return  <>
                    <div className="chat_interface">
                        <div className="chat_window" >
                            <div className="clear_session" >
                                <div className="clear_session_btn"
                                    onClick={e => this.createSession( this.props.user_id, true )}> 
                                    Clear Session 
                                </div>
                            </div>
                            <div className="messages-container">
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

                                    <div contentEditable={true} suppressContentEditableWarning
                                        id="feedback_note" data-placeholder="Add a note." 
                                        onBlur={e => {
                                            let { feedback_data, msgs } = this.state 
                                            const cmt = e.target.innerText
                                            msgs[ feedback_data.index ].feedback_String = cmt.length ? cmt : null
                                            // console.log( cmt )
                                            this.setState({ feedback_data, msgs })
                                        }}  
                                        >
                                    </div>
                                    <div className="feedback_btns">
                                        <button onClick={ this.handleClick } >Submit</button>
                                    </div>
                                </div>
                            : null }
                        </div>
                    </div>
                </>
    }
}

export default ChatBot