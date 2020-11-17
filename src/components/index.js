import React from 'react'

import agent_image from './agent.png'
import uiJSON from './ui-custom.json'

import './index.css'

function BotPersona( props ){
    const { user_type, highlightmsg } = props

    return  <div className={ `debug_chat-persona ${ highlightmsg ? 'highlightmsg' : '' }`}  >
                <img src={ user_type === 'agent' ? agent_image : uiJSON.bot_image } alt="bot_image" className="bot_image" />  
                <div className="bot_name">{  user_type === 'agent' ? uiJSON.agent_name : uiJSON.bot_name }</div>
            </div>
}

function Textmsg( props ){
    const { user_type, msg, highlightmsg } = props

    return <div className={ `${ highlightmsg ? 'highlightmsg' : '' } debug_msg ${ user_type === 'user' ? 'user_text' : '' }` } >   
                <div className={`${ user_type}`} suppressContentEditableWarning 
                                        dangerouslySetInnerHTML={{ __html: msg}} /> 
            </div>
}



function Card(props){
    const { card_data, markdown2HTML, highlightmsg, compare} = props

    function handleImageError(e){
        e.src = uiJSON.errorImage
    }

    return  <div className={ `${ highlightmsg ? 'highlightmsg' : '' } ${ compare === undefined ? 'card' : '' }` } 
                style={{ cursor: card_data.url !== undefined? 'pointer' : 'default' }}
                onClick={e => { if( card_data.url !== undefined ) window.open( card_data.url, '_blank' ) } }
                >
                <img src={ card_data.image } onError={ handleImageError } alt="card_image" />
                <div style={{ display: 'block !important' }}>
                    <div className="card_title"  dangerouslySetInnerHTML={{ __html: markdown2HTML( card_data.title ) }} />
                    <div className="card-text" dangerouslySetInnerHTML={{__html: markdown2HTML( card_data.content ) }} />
                </div>
            </div>
}

function Cards( props ){
    const { Cards, highlightmsg, markdown2HTML } = props
    // console.log( Cards, Cards.length )

    if ( Cards.length === 1 )
        return  <div className="debug_single-card" >
                    <Card card_data={ Cards[0] } 
                        markdown2HTML={ markdown2HTML } 
                        highlightmsg={ highlightmsg }
                    />
                </div>
    else{
        const compare = Cards.length === 2
        return  <div className="debug_card-carousel" >
                        <div className="navigation-btns">
                            {/* <ChevronLeft className="previous" />
                            <ChevronRight className="next" /> */}

                            {/* const ScrollElement = document.getElementsByClassName('suggested_ques_list')[0]
                                const { scrollWidth, scrollLeft } = ScrollElement
                                ScrollElement.scrollLeft = scrollWidth <= scrollLeft + 20 ? scrollWidth : scrollLeft + 20
                             */}
                        </div>
                        <div className={ `debug_card-carousel-container`} >
                            {   Cards.map( ( card_info, idx ) => {
                                    // if( idx > 9 ) 
                                    //     return  <div className="link" key={ idx } dangerouslySetInnerHTML={{ __html: markdown2HTML( link[0].content ) }} /> 

                                    if( idx > 10 ) return null

                                    if( compare )
                                        return  <div className="single-card" key={idx}>
                                                    <Card card_data={ card_info } markdown2HTML={ markdown2HTML } highlightmsg={ highlightmsg } />
                                                </div> 
                                    
                                    return  <Card card_data={ card_info } markdown2HTML={ markdown2HTML } highlightmsg={ highlightmsg } key={idx} />
                                   
                                })
                            } 
                        </div>
                        
                    </div>
    }

}


export { BotPersona, Textmsg, Cards }