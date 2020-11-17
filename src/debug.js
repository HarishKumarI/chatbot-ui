import React from 'react'
import $ from 'jquery'
import ReactJson from 'react-json-view'

import { ChevronRight, ChevronLeft, ThumbUpAltRounded, ThumbDownAltRounded, } from '@material-ui/icons'

import { BotPersona, Textmsg, Cards } from './components'
import { FormfromJSON } from './chat-experiments/FormFeilds'

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
            selectedMsg: null,
        }

        this.handleSession = this.handleSession.bind( this )
    }

    componentDidMount(){
        if( this.props.match.params.session_id ){
            this.handleSession({ session_id: this.props.match.params.session_id })
        }

        this.setState({ loading: true })
        $.get('http://95.217.239.6:7051/api/session_list', res=>{
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
        $.post('http://95.217.239.6:7051/api/session', JSON.stringify({ session_id: session.session_id }) , res=>{
            this.setState({ sessionjson: res, loading: false, selectedMsgJson: null })
        })
        .catch(err => {
            this.setState({loading: 'error'})
        })
    }


    getMessages( msgs ){
        let msgs_list = []
        msgs = msgs.history ? msgs.history : msgs

        msgs.forEach( ( msg, idx) => {

            const highlightmsg = this.state.selectedMsg === idx

            if( msg.sender === 'USER' ){
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
                                <div onClick={e => this.setState({ selectedMsg: idx })} key={ `${idx}_${index+1}_` }>
                                    <Textmsg user_type={'bot'} msg={ markdown2HTML( response.title ) }  highlightmsg={highlightmsg} />
                                </div>
                            )

                        msgs_list.push(
                            <div onClick={e => this.setState({ selectedMsg: idx })} key={ `${idx}_${index+1}` }>
                                <Cards Cards={ response.type === 'CARD' ? [ response ] : response.content } 
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
        
                    /* time */
                    if( msgs.length - 1 === idx || ( msgs[idx + 1] !== undefined && msg.sender !== msgs[idx + 1].sender ) )
                        msgs_list.push(
                            <div className={ `msg ${ msg.sender === 'user' ? 'user_text' : '' }` } key={idx+'_7'}>   
                                <div className="time">{ msg.time }</div> 
                            </div>
                        )
                })
            }

        }) 

        return msgs_list
    }

    render(){
        const { selected_session, sessionjson, selectedMsg } = this.state

        console.log( selected_session )

        this.state.sessions_list.sort((a, b) => (a.created_at < b.created_at) ? 1 : -1)
        
        const messages = sessionjson ? this.getMessages( sessionjson ) : []

        const sessions = this.state.sessions_list.map( ( sessionId, idx) => {
            return  <li key={idx} className={ this.state.selected_session === null ? '' : sessionId.session_id === this.state.selected_session.session_id ? 'select_session' : '' }
                        onClick={e => this.handleSession(sessionId) } >
                        User Id: { sessionId.user_id }<br />
                        <span style={{ fontSize: '12px', color: '#828080', width: '100%', textAlign: 'end' }}>Created at: {sessionId.created_at}</span>
                    </li>
        })

       
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
                                    <span> Show debug </span>
                                    <label className="switch" >
                                        <input type="checkbox" checked={ this.state.showdebug } onChange={e => this.setState({ showdebug: !this.state.showdebug })} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <br />
                                {   selected_session !== null ?
                                    <div className="session_info">
                                        User Id: { selected_session.user_id } Session Id: { selected_session.session_id } Created at: { selected_session.created_at }
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
                                    <div style={{ margin: '5px', lineHeight: '145%' }} >
                                        User Feedback: { sessionjson.history[ selectedMsg ].feedback !== null ?  
                                                            sessionjson.history[ selectedMsg ].feedback ? <ThumbUpAltRounded /> :  <ThumbDownAltRounded /> : '' } <br/>
                                        User Comment: { sessionjson.history[ selectedMsg ].feedback_text }
                                    </div>
                                : null }

                                <div className="debug-div">
                                    { selectedMsg  !== null ?
                                        <ReactJson  style={{ textAlign: 'initial' }} src={ sessionjson ? sessionjson.history[ selectedMsg ] : {}} theme="colors" 
                                            displayDataTypes={false} 
                                            displayObjectSize={ false } onEdit={ false } onAdd={ false }
                                            onDelete={ false } collapsed={false} sortKeys={ false } 
                                        />
                                    : null }
                                </div>
                            </div>
                        : null }
                    </div>
                </div>
    }
}


export default Debug 