import React from 'react'
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import { darken } from '@material-ui/core';
import { isEqual } from 'lodash'


import { 
    ExpandMore,
    ExpandLess
} from '@material-ui/icons'


import './textmode.css'

import * as showdown from 'showdown' 
import * as json2md from 'json2md'

var converter = new showdown.Converter({'noHeaderId':'true'})



function markdown2HTML( markdown ) {
    let answerElement = converter.makeHtml( json2md( markdown ) )
    answerElement = answerElement.replace(/<a href="/g,'<a target="_blank" href="')

    return answerElement
}


const sampleJson = {
  "content": [
      [
      [
          {
          "p": "Tyres details of Mahindra XUV500 W9 AT :"
          }, 
          {
          "ul": [
              {
              "p": "Spare Wheel \\- Steel"
              }, 
              {
              "p": "Wheels \\- Alloy Wheels"
              }, 
              {
              "p": "Front Tyres \\- 235 / 65 R17"
              }, 
              {
              "p": "Rear Tyres \\- 235 / 65 R17"
              }
          ]
          }, 
          {
          "p": "It has steering features like :"
          }, 
          {
          "ul": [
              {
              "p": "Minimum Turning Radius \\- 5. 6 metres"
              }, 
              {
              "p": "Steering Type \\- Power assisted (Hydraulic)"
              }
          ]
          }, 
          {
          "p": "Suspension type of It :"
          }, 
          {
          "ul": [
              {
              "p": "Front Suspension \\- McPherson type with anti-roll bar"
              }, 
              {
              "p": "Rear Suspension \\- Multi-link type with anti-roll bar"
              }
          ]
          }, 
          {
          "p": "Type of brakes in It :"
          }, 
          {
          "ul": [
              {
              "p": "Rear Brake Type \\- Disc"
              }, 
              {
              "p": "Front Brake Type \\- Ventilated Disc"
              }
          ]
          }
      ]
      ]
  ], 
  "footer_options": [], 
  "markdown": true, 
  "type": "TEXT"
  }


class TextMore extends React.Component{
  lines = 1
  lines_limit = 11
  indices_limit = 0
  heights = null

  constructor(props){
      super(props)

      this.state = {
          HTML: '',
          lesstext: '',
          lesstext_div: '',
          moretext_div: '',
          viewmore: true,
          showMore: true,
      }

      this.divRef = React.createRef()
  }

  computeLines( HTML ){
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString( HTML, 'text/html');
    var newDiv = document.createElement('div')
    newDiv.ref = this.divRef
    newDiv.style.fontSize = '14px'
    newDiv.style.lineHeight = 1.7
    newDiv.style.width = '480px'
    newDiv.style.display = 'none'
    newDiv.className = 'removable_div'
    newDiv.innerHTML = htmlDoc.body.innerHTML
    document.body.appendChild( newDiv )

    setTimeout( () => {

      const { lineHeight } = window.getComputedStyle( this.divRef.current )
      let linesHeight = parseInt( lineHeight.split('px')[0] )

      this.lines = this.divRef.current.offsetHeight / linesHeight

      this.heights = this.heights !== null ? this.heights : Array.from( this.divRef.current.children ).map( el => { return el.offsetHeight / linesHeight })
      
      let temp = 0
      this.heights.forEach( ( tag_lines, idx) => {
          if( temp + tag_lines <= this.lines_limit ){
            this.indices_limit = idx
            temp += tag_lines
          }
      })  

      // console.log( this.heights, temp, this.indices_limit)

      let lesstext_div = document.createElement('div')
      let moretext_div = document.createElement('div')

      Array.from( newDiv.children ).slice(0, this.indices_limit + 1 ).forEach( ( el, idx) => {
        lesstext_div.appendChild( el )
      })

      // console.log( lesstext_div.children.length, moretext_div.children.length, htmlDoc.body.children.length , this.divRef.current.children.length )

      Array.from( newDiv.children ).slice( 0, this.heights.length  ).forEach( el => {
        moretext_div.appendChild( el )
      })

      // console.log( lesstext_div.children.length, moretext_div.children.length,newDiv.children.length , this.divRef.current.children.length )

      console.log( this.indices_limit, this.heights.length, this.divRef.current.children.length)
      this.setState({ showMore:  this.heights.length < 2 ? false : this.indices_limit < this.heights.length })

      // if( !isEqual( lesstext_div.innerHTML, this.state.lesstext_div ) ){
      this.setState({ lesstext_div: lesstext_div.innerHTML, moretext_div: lesstext_div.innerHTML+moretext_div.innerHTML })
      // }

      document.body.removeChild( newDiv )
    }, 50)
  }

  componentDidMount(){
    this.setState({ HTML: this.props.HTML, lesstext_div: this.props.HTML, viewmore: true })
    this.computeLines( this.props.HTML )
  }

  componentDidUpdate(){
    if( !isEqual( this.props.HTML, this.state.HTML ) ){
      this.setState({ HTML: this.props.HTML, lesstext_div: this.props.HTML, viewmore: true })
      this.computeLines( this.props.HTML )
    }
  }

  render(){
    // number - 1

    // this.lines = this.divRef.current.offsetHeight / parseInt( lineHeight.split('px')[0] )
    // const { lineHeight } = window.getComputedStyle( this.divRef.current )
    // console.log( offsetHeight, style.lineHeight, htmlDoc.body.childNodes )


    return (
        <>
            <div ref={ this.divRef } dangerouslySetInnerHTML={{ __html: this.state.viewmore ? this.state.lesstext_div : this.state.moretext_div }} className="text_msg" />
            { this.state.showMore ?
              <div className="view_div" onClick={() => {this.setState({ viewmore: !this.state.viewmore }) }}>
                  <div > View { this.state.viewmore ? 'More' : 'Hide' } 
                      <div className="view_arrow">{ this.state.viewmore ? <ExpandMore /> : <ExpandLess /> }</div> 
                  </div>
              </div>
            : null }
        </>
    )
  }
}


class TextMoreTesting extends React.Component{
    constructor(props){
        super(props)
        this.state = { 
            sampleJson: {},
            Json: {content:''},
            jsonChanged: false,
            submittedContent: null,
            readOnly: false
        }

        this.onJsonChange = this.onJsonChange.bind( this )
    }


    componentDidMount(){
        this.setState({ sampleJson: sampleJson, Json: sampleJson })
        setTimeout( () => { this.onJsonChange() }, 10)
    }

    onJsonChange(e){
        let { sampleJson, differentType } = this.state
        sampleJson = e === undefined ? this.state.sampleJson : e.jsObject   
        this.setState({ differentType, sampleJson })
    }

    render(){


        return  <div className="formFeilds">
                    <div className="editor_container" >
                        <div className="editor_title" > 
                            HTML JSON Editor 
                            <button disabled={ !this.state.jsonChanged }
                                onClick={e => this.setState({ jsonChanged: false, Json: this.state.sampleJson, readOnly: false })}
                            > Go </button>
                        </div>
                        <JSONInput 
                            id          = "editor"
                            placeholder = { this.state.sampleJson }
                            colors      = { darken }
                            locale      = { locale }
                            height      = '90vh'
                            width       = 'inherit'
                            onChange    = {e => this.setState({ jsonChanged: true })}
                            onBlur      = { this.onJsonChange }
                        />
                    </div>
                    <div className="editor_container">
                        <div className="editor_title" > Output Based on JSON </div>
                        { this.state.Json !== undefined ?
                            <div className="output_div">
                                <TextMore HTML={ markdown2HTML( this.state.Json.content ) }/>
                            </div>
                        : null }

                    </div>
                </div>
    }
}


export {TextMore, TextMoreTesting}