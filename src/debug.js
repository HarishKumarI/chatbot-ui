import React from 'react'
import $ from 'jquery'
import ReactJson from 'react-json-view'

import { ChevronRight, ChevronLeft, ThumbUpAltRounded, ThumbDownAltRounded, } from '@material-ui/icons'

import { BotPersona, Textmsg, Cards } from './components'
import { FormfromJSON } from './chat-experiments/FormFeilds'
import ChatBot from './chat-experiments/Chatbot'

import './debug.css'


import * as showdown from 'showdown' 
import * as json2md from 'json2md'

var converter = new showdown.Converter({'noHeaderId':'true'})


function markdown2HTML( markdown ) {
    let answerElement = converter.makeHtml( json2md( markdown ) )
    answerElement = answerElement.replace(/<a href="/g,'<a target="_blank" href="')

    return answerElement
}


class Debug extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            showsidebar: true,
            togglesidebar: true,
            showdebug: true,
            selected_session: null,
            sessions_list: [],
            loading: false,
            sessionjson: null,
            exchanges: [],
            selectedMsg: null,
            show_model: false,
            model_content: null
        }

        this.handleSession = this.handleSession.bind( this )
        this.developer_feedback = this.developer_feedback.bind(this)
        this.openModelBox = this.openModelBox.bind(this)
    }

    componentDidMount(){
        if( this.props.match.params.session_id ){
            this.handleSession({ session_id: this.props.match.params.session_id })
        }

        this.setState({ loading: true })

        fetch('http://95.217.239.6:7051/api/session_list', 
            {
                method: 'GET',
                headers: {
                    "content-type": "application/json",
                    "content-encoding": "gzip"
                }
            }
        )
        .then( response => response.json() )
        .then( res=>{
            const sessions_list = res.session_list.map( session => { if( session.created_at === null ) return {created_at: '', session_id: session.session_id, user_id: session.user_id} ; else return session })
            let selected_session = null

            sessions_list.forEach( session => {
                if( this.props.match.params.session_id ){
                    if( session.session_id === this.props.match.params.session_id )
                        selected_session = session
                }
            })

            this.setState({ 
                sessions_list, 
                loading: false,
                selected_session
            })
        })
        .catch(err => {
            this.setState({loading: false})
        })
    }

    handleSession( session ){
        this.setState({ selected_session: session, loading: true, sessionjson: undefined, selectedMsg: null })
        
        fetch('http://95.217.239.6:7051/api/session', 
            {
                method: 'POST',
                headers: {
                    "content-type": "application/json",
                    "content-encoding": "gzip"
                },
                body: JSON.stringify({ session_id: session.session_id })
            }
        )
        .then( response => response.json() )
        .then( res=>{
            let exchanges = []
            res.history.forEach( ( msg, i) =>{
                if( msg.sender === 'USER' ){
                    msg.exchange_idx = exchanges.length
                    msg.response = null
                    msg.feedback = null
                    msg.feedback_text = null
                    msg.developer_feedback = msg.developer_feedback === undefined ? { issue_type: '', notes:'', state:'' } : msg.developer_feedback
                    msg.developer_feedback.index = i
                    exchanges.push(msg)
                }
                else{
                    msg.exchange_idx = exchanges.length - 1
                    exchanges[ exchanges.length -1 ].feedback = msg.feedback
                    exchanges[ exchanges.length -1 ].feedback_text = msg.feedback_text
                    exchanges[ exchanges.length -1 ].response = msg
                    exchanges[ exchanges.length -1 ].bot_developer_feedback = msg.developer_feedback === undefined ? { issue_type: '', notes:'', state:'' } : msg.developer_feedback
                    exchanges[ exchanges.length -1 ].bot_developer_feedback.index = i
                }
            })

            // res.history.forEach( msg=> {
            //     console.log( msg.feedback_text, msg.exchange_idx )
            // } )

            this.setState({ sessionjson: res, loading: false, selectedMsgJson: null, exchanges })
            
        })
        .catch(err => {
            this.setState({loading: 'error'})
        })
    }

    developer_feedback(e, idx, change){
        e.preventDefault()
        const { name, value } = e.target
        let { sessionjson, exchanges, selectedMsg } = this.state

        try{
            exchanges[ sessionjson.history[ selectedMsg ].exchange_idx ].bot_developer_feedback[name] = value
            sessionjson.history[ idx ].developer_feedback[ name ] = value
        }
        catch(err){
            sessionjson.history[idx].developer_feedback = {}
            sessionjson.history[ idx ].developer_feedback[ name ] = value
        }

        // sessionjson.history[ selectedMsg ].developer_feedback === undefined

        this.setState({ sessionjson, exchanges })

        if( change === null | change === undefined )
            $.post('http://95.217.239.6:7051/api/dev_feedback', JSON.stringify({ session_id: this.state.selected_session.session_id, history: sessionjson.history }) , res => {
                console.log( res )
            })
        
        // console.log( this.state.selected_session.created_at, diff/(1000*60), d )
    }


    getMessages( msgs ){
        let msgs_list = []
        msgs = msgs.history ? msgs.history : msgs

        msgs.forEach( ( msg, idx) => {

            const highlightmsg = this.state.selectedMsg === idx

            if( msg.sender === 'USER' ){
                if ( msg.payload.form !== null ){
                    msg.message = msg.payload.form.map( field => { return `${field.key}: ${field.value.display_value}` }).join('<br/>')
                }


                msgs_list.push(
                    <div onClick={e => this.setState({ selectedMsg: idx })} key={ idx }>
                        <Textmsg user_type={'user'} msg={ msg.message }  highlightmsg={ highlightmsg }  />
                    </div>
                )
            }
            else{
                if( idx === 0 || ( idx > 0 && msgs[idx-1].sender !== 'bot' && msgs[idx-1].sender !== msg.sender ) )
                    msgs_list.push( <div key={ `${idx}_0` } > <BotPersona user_type={'bot'}  /></div> )

                msg.payload.bot_response.forEach( ( response, index) => {
                    if( response.type === 'TEXT' )
                        msgs_list.push(
                            <div onClick={e => this.setState({ selectedMsg: idx })} key={ `${idx}_${index+1}` }>
                                <Textmsg user_type={'bot'} msg={ markdown2HTML( response.content ) }  highlightmsg={highlightmsg} />
                            </div>
                        )

                    if( response.type === 'CARD' || response.type === 'CAROUSEL' ){
                        if( response.title.length > 0 )
                            msgs_list.push( 
                                <div onClick={e => this.setState({ selectedMsg: idx })} key={ `${idx}_${index+1}_` }  >
                                    <Textmsg user_type={'bot'} msg={ markdown2HTML( response.title ) }  highlightmsg={highlightmsg} />
                                </div>
                            )

                        msgs_list.push(
                            <div onClick={e => this.setState({ selectedMsg: idx })} key={ `${idx}_${index+1}` }>
                                <Cards Cards={ response.type === 'CARD' ? [ response ] : response.content } index={idx}
                                    highlightmsg={ highlightmsg } key={ `${idx}_${index+1}` }
                                    markdown2HTML={mdJson => markdown2HTML( mdJson ? mdJson : '' )} 
                                />
                            </div>
                        )
                    }

                    if(response.type === 'FORM')
                        msgs_list.push( 
                            <div className="msg_form" onClick={e => this.setState({ selectedMsg: idx })} key={ `${idx}_${index+1}` }>
                                <FormfromJSON 
                                    json={ response } 
                                    readOnly = { true }
                                    onSubmit={data =>  {
                                        
                                    }}
                                />
                            </div>
                        )
        
                    // if( msg_data.show_feedback )
                    //     msgs_list.push(
                    //         <MsgFeedback  
                    //             key={index+'_6'}
                    //             data={ msg_data }   
                    //             updateData={ newData  => {
                    //                 msgs[ index ] = newData
                    //                 this.setState({ msgs })
                    //             }}
                    //             askFeedback={data => this.setState({ feedback_data: {...data, index }, show_feedback_form: true })}
                    //         />
                    //     )
                                    
                    // console.log( response.footer_options )
                    if( response.footer_options !== undefined )
                        msgs_list.push(
                            <div className="debug_suggested_container" key={`${idx}_${index+1}_`}>
                                { 
                                    response.footer_options.map( ( suggested, idx ) => {
                                        return  <div key={ idx } className="suggested_que" > 
                                                    { suggested.display_text || suggested} 
                                                </div>
                                    })
                                }
                            </div>
                        )

                    /* time */
                    if( msgs.length - 1 === idx || ( msgs[idx + 1] !== undefined && msg.sender !== msgs[idx + 1].sender ) )
                        msgs_list.push(
                            <div className={ `msg ${ msg.sender === 'user' ? 'user_text' : '' }` } key={idx+'_'+index+'_7'}>   
                                <div className="time">{ msg.time }</div> 
                            </div>
                        )
                })
            }

        }) 

        return msgs_list
    }

    evenCardsHeight(e){
        var class_list =  Array.from( document.getElementsByClassName('debug_card-carousel-container') ).map( carousel => { return ( carousel.className.split(' ')[1] ) })
        // console.log( class_list, new Date() )
        class_list.forEach( carousel => {
            // console.log( carousel )
            let cards = Array.from( document.getElementsByClassName( carousel )[0].children ).filter( x => x.className.includes( 'card' ) )
            let max_height = 0
            cards.forEach( card => {
                // console.log( card.className )
                max_height = max_height < card.offsetHeight ? card.offsetHeight : max_height
            })

            cards.forEach( card => {
                card.style.height = `${max_height}px`
            })
        })


    }

    openModelBox(e){
        let messages = this.state.sessionjson.history
        let query_list = []

        messages.forEach( msg=> {
            if ( msg.sender !== 'BOT' ){
                query_list.push({ query: msg.message, isnudge: msg.payload.nudge, form: msg.payload.form, type: msg.payload.nudge ? 'nudge' : msg.payload.form !== null ? 'form': 'query' })
                // console.log( "msg", msg.message, '\n', "question", msg.payload.query, '\n', "isnudge", msg.payload.nudge, '\n form', msg.payload.form,'\n payload', msg.payload )
            }
        })

        // console.log( query_list )

        this.setState({ show_model: true, model_content: query_list })
    }
    

    render(){
        const { selected_session, sessionjson, selectedMsg, exchanges } = this.state

        // console.log( selected_session, sessionjson )

        this.state.sessions_list.sort((a, b) => (a.created_at < b.created_at) ? 1 : -1)
        
        const messages = sessionjson ? this.getMessages( sessionjson ) : []

        const sessions = this.state.sessions_list.map( ( sessionId, idx) => {
            return  <li key={idx} className={ this.state.selected_session === null ? '' : sessionId.session_id === this.state.selected_session.session_id ? 'select_session' : '' }
                        onClick={e => this.handleSession(sessionId) } >
                        User Id: { sessionId.user_id }<br />
                        <span style={{ fontSize: '12px', color: '#828080', width: '100%', textAlign: 'end' }}>Created at: { ( new Date(sessionId.created_at) ).toLocaleString() }</span>
                    </li>
        })

        // if( selectedMsg !== null ){
        //     console.log( sessionjson.history[ selectedMsg ].developer_feedback )
        // }

        setTimeout(() => { this.evenCardsHeight() }, 5000)
       
        const d = new Date()
        const diff = ( d - new Date( selected_session === null ? '' : selected_session.created_at ) ) / ( 1000*60 )

        return  <div className="App">
                    <div className="debug-title"> 
                        Chatbot Debug Tool 
                    </div>
                    <div style={{ display: 'flex', height: '93.5vh', overflowY: 'hidden' }}>
                        {   this.state.showsidebar ? 
                                this.state.togglesidebar ?
                                    <div className="sessions-list">
                                        <ChevronLeft className="chevron_icons"  onClick={e => this.setState({ togglesidebar: false }) }/>
                                        <div className="session_title"> Sessions List  </div>
                                        { sessions.length > 0 ? 
                                            <div style={{ overflowY: 'auto', height: '91vh', padding: '2px' }} >
                                                <ul className="sessions-list-ul">{sessions}</ul>
                                            </div>
                                        : null }
                                    </div>
                                : 
                                    <div className="sessions-list-vertical_c" onClick={e => this.setState({ togglesidebar: true }) } > 
                                        <ChevronRight className="chevron_icons_right"  />
                                        <div className="sessions-list-vertical">Sessions List </div>
                                    </div>
                        : null }

                        <div className="chat-interface">
                            <div className="chat-interface-title" >
                                <span style={{ fontSize: '20px' }}> Chat Conversation </span>
                                <div className="debug-swtich-container">
                                    { sessionjson === null || sessionjson === undefined ? null :<button className="re-run-btn" onClick={ this.openModelBox } >Re-Run</button>}
                                    <span> Show debug </span>
                                    <label className="switch" >
                                        <input type="checkbox" checked={ this.state.showdebug } onChange={e => this.setState({ showdebug: !this.state.showdebug })} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <br />
                                {   selected_session !== null ?
                                    <div className="session_info">
                                        User Id: { selected_session.user_id } Session Id: { selected_session.session_id } Created at: { ( new Date(selected_session.created_at)).toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}) }
                                    </div>
                                : null }
                            </div>

                            <div className="chat-window">
                                {
                                    this.state.loading ? 
                                        <div className="loader"> 
                                            <img src="https://miro.medium.com/max/882/1*9EBHIOzhE1XfMYoKz1JcsQ.gif" alt="loadingicon" /> 
                                            <div> Loading... </div>
                                        </div>
                                    :   <div className="debug_messages-container">
                                            { messages }
                                        </div>
                                }
                                
                            </div>
                        </div>
                        
                        { this.state.showdebug ?
                            <div className="debug-div-container">
                                <div className="chat-interface-title" >
                                    <span style={{ fontSize: '20px' }}> Debug Output </span>
                                </div>
                                { selectedMsg  !== null ?
                                    <>
                                        <div style={{ margin: '5px', lineHeight: '145%' }} >
                                            <span style={{ fontWeight: 'bolder' }} >User Feedback:</span> { exchanges[ sessionjson.history[ selectedMsg ].exchange_idx ].feedback !== null ?  
                                                                sessionjson.history[ selectedMsg ].feedback ? <ThumbUpAltRounded /> :  <ThumbDownAltRounded /> : '' } <br/>
                                            <span style={{ fontWeight: 'bolder' }} >User Comment:</span> { exchanges[ sessionjson.history[ selectedMsg ].exchange_idx ].feedback_text }
                                        </div>
                                        <div>
                                            {  diff > 30  ?
                                                <>
                                                    <div style={{ marginTop: '8px', fontWeight: 'bold' }} >Developer Feedback:</div>
                                                    <div className="dev_feedback">
                                                        <div>
                                                            State: 
                                                            <select name="state" 
                                                                value={ exchanges[ sessionjson.history[ selectedMsg ].exchange_idx ].bot_developer_feedback === undefined ? '' : exchanges[ sessionjson.history[ selectedMsg ].exchange_idx ].bot_developer_feedback.state } 
                                                                onChange={e => this.developer_feedback( e, selectedMsg )} >
                                                                <option value="--select--" > --select-- </option>
                                                                <option value="Open" > Open </option>
                                                                <option value="In Analysis" > In Analysis </option>
                                                                <option value="Fix Planned" > Fix Planned </option>
                                                                <option value="Fixed" > Fixed </option>
                                                                <option value="Closed" > Closed </option>
                                                                <option value="Deferred" > Deferred </option>
                                                                <option value="Won't Fix" > Won't Fix </option>
                                                            </select>
                                                            Issue Type: 
                                                            <input type="text" name="issue_type" placeholder="issue type" 
                                                                value={exchanges[ sessionjson.history[ selectedMsg ].exchange_idx ].bot_developer_feedback === undefined ? '' : exchanges[ sessionjson.history[ selectedMsg ].exchange_idx ].bot_developer_feedback.issue_type } 
                                                                onBlur={e => this.developer_feedback( e, selectedMsg )}
                                                                onChange={e => this.developer_feedback( e, selectedMsg, 'change' )}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div>Notes:</div>
                                                            <div contentEditable={true} suppressContentEditableWarning name="notes" data-placeholder="developer notes" 
                                                                onBlur={e => {
                                                                    this.developer_feedback( { ...e, target:{ ...e.target, name: 'notes',value: e.target.innerText} }, selectedMsg )
                                                                }}  
                                                                >{exchanges[ sessionjson.history[ selectedMsg ].exchange_idx ].bot_developer_feedback === undefined ? '' : exchanges[ sessionjson.history[ selectedMsg ].exchange_idx ].bot_developer_feedback.notes }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            : null }
                                        </div>
                                    </>
                                : null }

                                <div className="debug-div">
                                    { selectedMsg  !== null ?
                                        <ReactJson  style={{ textAlign: 'initial', padding: '15px' }} src={ sessionjson ? sessionjson.history[ selectedMsg ] : {}} theme="colors" 
                                            displayDataTypes={false} 
                                            displayObjectSize={ false } onEdit={ false } onAdd={ false }
                                            onDelete={ false } collapsed={false} sortKeys={ false } 
                                        />
                                    : null }
                                </div>
                            </div>
                        : null }

                        {   this.state.show_model ?
                            <div id="model_box">
                                <div className="chat-holder">
                                    <div className="close_icon" title="close" onClick={e => this.setState({ show_model: false, model_content: null }) } >&times;</div>
                                    <div className="chat-messages">
                                        <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bolder', margin: '10px 0' }}>Chat Conversation</div>
                                        <ChatBot user_id={ selected_session.user_id } data={ this.state.model_content } />
                                    </div>
                                </div>
                            </div>
                        : null }

                    </div>
                </div>
    }
}


export default Debug 