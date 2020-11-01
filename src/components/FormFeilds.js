import { darken } from '@material-ui/core';
import React from 'react'
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';

import './FormFeilds.css'

function FormfromJSON(props){
    const { json } = props

    const feilds = json.map( ( feild, idx) => {
        let tag = null

        switch( feild.type ){
            case 'text': 
                tag =   <div className="form_row" key={idx}>
                            <label > { feild.key } </label>
                            <br/>
                            <input type="text" placeholder={ `Enter ${ feild.key }` } 
                                name={ feild.key }
                                defaultValue={ feild.value }
                                required={ feild.required } /> 
                        </div> 
                break;
            case 'dropdown':
                tag =   <div className="form_row" key={idx}>
                            <label > { feild.key } </label>
                            <br/>
                            <select name={ feild.key } >
                                <option>select { feild.key }</option>
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
                            <label > { feild.key } </label>
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
                            <label > { feild.key } </label>
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
                            <label > { feild.key } </label>
                            <br/>
                            <input type="date" name={feild.name} defaultValue={feild.value}  />
                        </div>
                break
            default: return null
        }
        
        return tag
    })

    let form_title, form_desc = ''

    json.forEach( formElement => {
        if( formElement.type === 'title' ){
            form_title = formElement.value
        }
        if( formElement.type === 'desc' ){
            form_desc = formElement.value
        }
    })

    return  <div className="FormfromJSON">
                <form onSubmit={e => {
                        e.preventDefault(); 
                        // var form = e.target
                        // let kvpairs = []
                        // for ( var i = 0; i < form.elements.length; i++ ) {
                        // var e = form.elements[i];
                        // kvpairs.push(encodeURIComponent(e.name) + "=" + encodeURIComponent(e.value));
                        // }
                        console.log( e.target.elements )
                        }
                    }>
                    <div className="form_title">{ form_title }</div>
                    <div className="form_desc" >{ form_desc }</div>
                    { feilds }
                    <button type="submit">Submit</button>
                </form>
            </div>
}


const sampleFormObj = [
    {
      type: 'title',
      value: 'Form Title'
    },
    {
      type: 'desc',
      value: 'form description'
    },
    {
      key: 'Name',
      type: 'text',
      required: true,
      value: null
    },
    {
      key: 'budget',
      type: 'dropdown',
      options: [
        '2-3 Lakhs',
        '3-5 Lakhs'
      ],
      value: null
    },
    {
      key: 'body type',
      type: 'radio',
      options: [
        'SUV / MUV',
        'Hatchback',
        'Sedan',
        'Compact Sedan',
        'Truck',
        'Convertible',
        'Coupe',
        'Station Wagon',
        'Minivan'
      ],
      value: null
    },
    {
      key: 'Body Type',
      type: 'checkbox',
      options: [
        'SUV / MUV',
        'Hatchback',
        'Sedan',
        'Compact Sedan',
        'Truck',
        'Convertible',
        'Coupe',
        'Station Wagon',
        'Minivan'
      ],
      value: null
    },
    { key: 'date picker',
      type: 'date',
      value: '2020-10-31'
    }
  ]



class FormFeilds extends React.Component{
    constructor(props){
        super(props)
        this.state = { 
            sampleJson: [],
            formJson: [],
            jsonChanged: false,
            differentType: []
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
        let covered_list = sampleJson.map( formElement => {
            return differentType.includes(formElement.type) ? null : formElement.type
        })

        covered_list = Array.from( new Set( covered_list ) )
        this.setState({ differentType: covered_list, sampleJson })
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

                        <div className="form_div">
                            <FormfromJSON json={ this.state.formJson } />
                        </div>
                    </div>
                </div>
    }
}

export default FormFeilds