import { darken } from '@material-ui/core';
import React from 'react'
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';

import './FormFeilds.css'

function FormfromJSON(props){
    let { json, onSubmit, readOnly } = props

    const feilds = json.content === undefined ? [] 
                        : json.content.map( ( feild, idx) => {
                        let tag = null
                        switch( feild.type ){
                            case 'text': 
                                tag =   <div className="form_row" key={idx}>
                                            <label > { feild.key.replace(/_/g, ' ') } </label>
                                            {/* <br/> */}
                                            <input type="text" placeholder={ `${ feild.description }` } 
                                                name={ feild.label } readOnly={ readOnly }
                                                defaultValue={ feild.value }
                                                required={ feild.required } /> 
                                        </div> 
                                break;
                            case 'dropdown':
                                tag =   <div className="form_row" key={idx}>
                                            <label > { feild.key.replace(/_/g, ' ') } </label>
                                            {/* <br/> */}
                                            <select name={ feild.label } disabled={ readOnly } >
                                                <option> { feild.description }</option>
                                                {
                                                    feild.options.map( ( option, option_idx ) => {
                                                        return  <option key={option_idx} >
                                                                    { option }
                                                                </option>
                                                    })
                                                }
                                            </select>
                                        </div>
                                break
                            case 'radio':
                                tag =   <div className="form_row" key={idx}>
                                            <label > { feild.key.replace(/_/g, ' ') } </label>
                                            {/* <br/> */}
                                            <div className="radio_options">
                                                {
                                                    feild.options.map( ( option, option_idx ) => {
                                                        return  <div key={option_idx} > 
                                                                    <input type="radio" name={feild.label} defaultValue={option} readOnly={ readOnly } />
                                                                    <label className="field_labels">{ option }</label>
                                                                </div>
                                                    })
                                                }
                                            </div>
                                        </div>
                                break
                            case 'checkbox':
                                tag =   <div className="form_row" key={idx}>
                                            <label > { feild.key.replace(/_/g, ' ') } </label>
                                            {/* <br/> */}
                                            <div className="radio_options">
                                                {
                                                    feild.options.map( ( option, option_idx ) => {
                                                        return  <div key={option_idx} > 
                                                                    <input type="checkbox" name={feild.label} defaultValue={option} readOnly={ readOnly } />
                                                                    <label className="field_labels">{ option }</label>
                                                                </div>
                                                    })
                                                }
                                            </div>
                                        </div>
                                break
                            case 'date':
                                tag =   <div className="form_row" key={idx}>
                                            <label > { feild.key.replace(/_/g, ' ') } </label>
                                            {/* <br/> */}
                                            <input type="date" name={feild.label} defaultValue={feild.value} readOnly={ readOnly } />
                                        </div>
                                break
                            default: return null
                        }

                        return tag
                    })

    let { title, description } =  json 
    
    // json.forEach( formElement => {
    //     if( formElement.type === 'title' ){
    //         form_title = formElement.value
    //     }
    //     if( formElement.type === 'desc' ){
    //         form_desc = formElement.value
    //     }
    // })   

    return  <div className="FormfromJSON">
                <form onSubmit={e => {
                        e.preventDefault();
                        let keyValPair = {}
                        const elements = e.target.elements
                        Array.from(elements).forEach( elementValue => {
                            keyValPair[ elementValue.name ] =  elementValue.value
                        })

                        json.content.forEach( feild => {
                            feild.value = feild.description === keyValPair[ feild.label ] ? feild.value : keyValPair[ feild.label ]
                        } )
                        console.log( json.content )
                        onSubmit( json.content )
                    }
                    }>
                    <div className="form_title">{ title }</div>
                    <div className="form_desc" >{ description }</div>
                    { feilds }
                    <button disabled={ readOnly } type="submit">Submit</button>
                </form>
            </div>
}


const sampleFormObj = {
    "content": [
      {
        "description": "Which car version are you interested in ?",
        "key": "car_version",
        "label": "Car Version",
        "options": [
          "ertiga lxi",
          "ertiga vxi",
          "ertiga zxi"
        ],
        "required": true,
        "type": "dropdown",
        "value": null
      },
      {
        "description": "Which city are you looking at?",
        "key": "city",
        "label": "City",
        "required": true,
        "type": "text",
        "value": null
      }
    ],
    "description": "Please fill below for car price :",
    "title": "",
    "type": "FORM"
  }



class FormFeilds extends React.Component{
    constructor(props){
        super(props)
        this.state = { 
            sampleJson: {},
            formJson: {},
            jsonChanged: false,
            differentType: [],
            submittedContent: null,
            readOnly: false
        }

        this.onJsonChange = this.onJsonChange.bind( this )
    }

    componentDidMount(){
        this.setState({ sampleJson: sampleFormObj, formJson: sampleFormObj })
        setTimeout( () => { this.onJsonChange() }, 10)
    }

    onJsonChange(e){
        let { sampleJson, differentType } = this.state
        differentType = []
        sampleJson = e === undefined ? this.state.sampleJson : e.jsObject
        sampleJson.content.forEach( formElement => {
            if( !differentType.includes(formElement.type) )
                differentType.push( formElement.type )
        })
        
        this.setState({ differentType, sampleJson })
    }

    render(){
        return  <div className="formFeilds">
                    <div className="editor_container" >
                        <div className="editor_title" > 
                            HTML JSON Editor 
                            <button disabled={ !this.state.jsonChanged }
                                onClick={e => this.setState({ jsonChanged: false, formJson: this.state.sampleJson, readOnly: false })}
                            > Go </button>
                        </div>
                        <JSONInput 
                            id          = "editor"
                            placeholder = { this.state.sampleJson }
                            colors      = { darken }
                            locale      = { locale }
                            height      = '90vh'
                            onChange    = {e => this.setState({ jsonChanged: true })}
                            onBlur      = { this.onJsonChange }
                        />
                    </div>
                    <div className="editor_container">
                        <div className="editor_title" > Form Based on JSON </div>
                        <div style={{ color: 'white' }}>
                            <input type="checkbox" disabled checked={ this.state.differentType.includes( 'text' ) } />      Text
                            <input type="checkbox" disabled checked={ this.state.differentType.includes( 'dropdown' ) } />  dropdown
                            <input type="checkbox" disabled checked={ this.state.differentType.includes( 'radio' ) } />     radio
                            <input type="checkbox" disabled checked={ this.state.differentType.includes( 'checkbox' ) } />  checkbox
                            <input type="checkbox" disabled checked={ this.state.differentType.includes( 'date' ) } />  date
                        </div>
                        
                        { this.state.formJson.content !== undefined ?
                            <div className="form_div">
                                <FormfromJSON 
                                    json={ this.state.formJson } 
                                    readOnly = { this.state.readOnly }
                                    onSubmit={data => this.setState({ submittedContent: data, readOnly: true }) }
                                />
                            </div>
                        : null }


                        {   this.state.submittedContent !== null ?
                            <>
                                <div className="editor_title" style={{ marginTop: '15px' }}> Submitted Data </div>
                                <JSONInput 
                                    id          = "editor"
                                    placeholder = { this.state.submittedContent }
                                    colors      = { darken }
                                    locale      = { locale }
                                    width       = '33vw'
                                    viewOnly    = { true }
                                />
                            </>
                        : null}
                    </div>
                </div>
    }
}

export { FormFeilds, FormfromJSON}