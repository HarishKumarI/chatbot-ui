import { darken } from '@material-ui/core';
import React from 'react'
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';

import './FormFeilds.css'

function FormfromJSON(props){
    let { json, onSubmit } = props
    const feilds = json.content === undefined ? [] 
                        : json.content.map( ( feild, idx) => {
                        let tag = null
                        switch( feild.type ){
                            case 'text': 
                                tag =   <div className="form_row" key={idx}>
                                            <label > { feild.key.replace(/_/g, ' ') } </label>
                                            <br/>
                                            <input type="text" placeholder={ `${ feild.title }` } 
                                                name={ feild.key }
                                                defaultValue={ feild.value }
                                                required={ feild.required } /> 
                                        </div> 
                                break;
                            case 'dropdown':
                                tag =   <div className="form_row" key={idx}>
                                            <label > { feild.key.replace(/_/g, ' ') } </label>
                                            <br/>
                                            <select name={ feild.key }  >
                                                <option> { feild.title }</option>
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
                                            <br/>
                                            <div className="radio_options">
                                                {
                                                    feild.options.map( ( option, option_idx ) => {
                                                        return  <div key={option_idx} > 
                                                                    <input type="radio" name={feild.key} defaultValue={option} />
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
                                            <br/>
                                            <div className="radio_options">
                                                {
                                                    feild.options.map( ( option, option_idx ) => {
                                                        return  <div key={option_idx} > 
                                                                    <input type="checkbox" name={feild.key} defaultValue={option} />
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
                                            <br/>
                                            <input type="date" name={feild.name} defaultValue={feild.value}  />
                                        </div>
                                break
                            default: return null
                        }

                        return tag
                    })

    let { title, desc } =  json 
    
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
                            keyValPair[ elementValue.name ] = elementValue.value
                        })

                        json.content.forEach( feild => {
                            feild.value = keyValPair[ feild.key ]
                        } )
                        onSubmit( json.content )
                    }
                    }>
                    <div className="form_title">{ title }</div>
                    <div className="form_desc" >{ desc }</div>
                    { feilds }
                    <button type="submit">Submit</button>
                </form>
            </div>
}


const sampleFormObj = {
        "content": [
          {
            "key": "car_version",
            "options": [
              "ertiga lxi",
              "ertiga vxi",
              "ertiga zxi"
            ],
            "required": true,
            "title": "Which car version are you interested in ?",
            "type": "dropdown",
            "value": null
          },
          {
            "key": "city",
            "required": true,
            "title": "Which city are you looking at?",
            "type": "text",
            "value": null
          }
        ],
        "title": "Please fill below for car price :",
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
            submittedContent: null
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
                                onClick={e => this.setState({ jsonChanged: false, formJson: this.state.sampleJson })}
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
                                    onSubmit={data => this.setState({ submittedContent: data }) }
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