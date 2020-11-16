import React from 'react'
import $ from 'jquery'

import ReactJson from 'react-json-view'

import './debug.css'

class Debug extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            session_ids: [],
            select_session: null,
            sessionjson: undefined,
            loading: false,
            loader: ''
        }

        this.handleSession = this.handleSession.bind(this)
    }

    componentDidMount(){
        this.setState({ loader: 'loading...' })
        $.get('http://95.217.239.6:7051/api/session_list', res=>{
            this.setState({ session_ids: res.session_list, loader: '' })
        })
        .catch(err => {
            this.setState({loader: 'error'})
        })
    }

    handleSession( session_id ){
        this.setState({ select_session: session_id, loading: true })
        $.post('http://95.217.239.6:7051/api/session', JSON.stringify({ session_id }) , res=>{
            this.setState({ sessionjson: res, loading: false })
        })
        .catch(err => {
            this.setState({loading: 'error'})
        })
    }

    render(){
        const sessions = this.state.session_ids.map( ( sessionId, idx) => {
            return  <li key={idx} className={ sessionId.session_id === this.state.select_session ? 'select_session' : '' }
                        onClick={e => this.handleSession(sessionId.session_id) } >
                        { sessionId.session_id }
                    </li>
        })

        return  <div style={{ margin: '0', padding: '0', display: 'flex' }}>
                    <div className="sessions">
                        <h3> Session Ids </h3>
                        { this.state.loader }
                        <ul className="sessionsList">{sessions}</ul>
                    </div>
                    <div style={{ height: '100vh', width: '100%', overflowY: 'hidden'}}>
                        <h3 style={{ textAlign: 'center' }}> Conversation Output 
                            {   this.state.sessionjson !== undefined ?
                                <span style={{ float: 'right' }} >User Id: { this.state.sessionjson.user_id }</span>
                            : null }
                        </h3>

                        <div style={{ overflowY: 'auto', height: 'inherit' }}>
                            {   this.state.sessionjson !== undefined ?
                                <ReactJson  style={{ textAlign: 'initial' }} 
                                src={ this.state.sessionjson.history } theme="colors" displayDataTypes={false} 
                                displayObjectSize={ false } onEdit={ false } onAdd={ false }
                                onDelete={ false } collapsed={ false } sortKeys={ false } />
                                : null
                            }
                        </div>

                        { this.state.loading ? 'loading...' : null }
                    </div>
                </div>
    }
}


export default Debug 