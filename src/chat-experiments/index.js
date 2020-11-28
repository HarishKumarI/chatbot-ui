import React from 'react'
import './index.css'
import * as $ from 'jquery'
import ChatBot from './Chatbot'
import { Title } from '../App'


class Experiment extends React.Component{
    constructor(props){
        super(props)

        this.state = { isvalid: null }
    }

    componentDidMount(){
        $.post('/api/verify', JSON.stringify({"user_id":  parseInt( this.props.match.params['user_id'] )} ),
            res => {

                if( res.isvalid === 'VALID' ){
                    this.setState({ isvalid: res })
                }
            }
        )
    }

    render(){
        const { isvalid } = this.state
        // console.log( this.props.match.params['user_id'], isvalid )

        return  <div className="App-container">
                    <Title  userName={ isvalid !== null ? isvalid.username : '' } />
                    <div className="separater"></div>

                    {  isvalid !== null && isvalid.isvalid === 'VALID' ?
                        <ChatBot user_id_props={this.props}  />
                    :   <div style={{ textAlign: 'center', height: '300px',
                                 justifyContent: 'center', alignItems: 'center', margin: 'auto', fontSize: 'x-large' }}>
                            <div>User Not Found</div>
                            <a href="/"> Login </a>
                        </div>
                    }
                </div>
    }
}


export default Experiment