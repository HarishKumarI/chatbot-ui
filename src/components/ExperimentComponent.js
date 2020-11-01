import React from 'react'
import { Minimize } from '@material-ui/icons'

import './chat.css'
import configJSON from '../config/UI_configuration.json'

function ExperimentComponent(props){
    return  < >

                <div className="Chat-header" > 
                    <img src={ configJSON.bot_image } alt="bot-persona" className="bot-image" />
                    <div className="bot-name" >{ configJSON.bot_name } </div>
                    <div className="chat-status online">  <div ></div> online </div>
                    {/* <div className="chat-status offline"> <div ></div> offline </div> */}
                    <div className="minimize-btn"><Minimize className="minimize-icon" /></div>
                </div>
                <div className="chat-body">
                    chat messages
                </div>
            </>
}

export default ExperimentComponent