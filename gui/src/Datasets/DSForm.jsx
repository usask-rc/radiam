//DSForm.jsx
import React, { Component } from 'react';
import {
  ReferenceArrayInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import { ConfigMetadata, EditMetadata } from "../_components/Metadata.jsx";
import * as Constants from '../_constants/index';
import MapForm from '../_components/_forms/MapForm';
import ProjectName from "../_components/_fields/ProjectName";
import { Prompt } from "react-router"
import { submitObjectWithGeo } from '../_tools/funcs';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import TranslationSelectArray from "../_components/_fields/TranslationSelectArray";


const validateDistributionRestriction = required('en.validate.dataset.distribution_restriction');
const validateDataCollectionMethod = required('en.validate.dataset.data_collection_method');
const validateDataCollectionStatus = required('en.validate.dataset.data_collection_status');
const validateProject = required('A project is required for a dataset');
const validateSensitivityLevel = required('en.validate.dataset.sensitivity_level');
const validateTitle = required('en.validate.dataset.title');

class DSForm extends Component {

    constructor(props){
        super(props)
        this.state = {geo: props.record.geo, data: {}, isDirty: false}
        this.geoDataCallback = this.geoDataCallback.bind(this)
    }

    geoDataCallback(geo){
      console.log("in datasetform, geodatacallback triggered with geo: ", geo)
      if (this.props.record.geo !== geo){
        this.setState({geo: geo, isDirty: true})
      }
    } 
  
    handleSubmit = (data) => {
      console.log("handleSubmit called in dsform")
      //this is necessary instead of using the default react-admin save because there is no RA form that supports geoJSON
      //data_collection_method and sensitivity_level require some preprocessing due to how react-admin and the api treat multi entry fields.
  
      let dcmList = []
      let slList = []
      let newData = {...data}
      data.data_collection_method.map(item => {dcmList.push({id: item}); return item})
      data.sensitivity_level.map(item => {slList.push({id: item}); return item;})
      newData.data_collection_method = dcmList
      newData.sensitivity_level = slList
      
      this.setState({dirty: false, data: newData},

        () =>
      submitObjectWithGeo(newData, this.state.geo, this.props)
      )
      console.log("handleSubmit complete, newData: ", newData)
  
    };

    handleChange = (data) =>{
      this.setState({isDirty: true})
    }

    render() { 

      const {geo, data} = this.state
      const { staticContext, basePath, ...rest } = this.props

      console.log("state, props: ", this.state, this.props)

        return (
            <SimpleForm save={this.handleSubmit} name={"datasetForm"} onChange={this.handleChange} {...rest}>
                <TextInput      
                label="Title"
                source={Constants.model_fields.TITLE}
                validate={validateTitle}
                
                />
                <TextInput
                className="input-large"
                label={"en.models.datasets.data_abstract"}
                options={{ multiline: true }}
                source={Constants.model_fields.ABSTRACT}
                />
                <TextInput
                className="input-small"
                label={"en.models.datasets.study_site"}
                source={Constants.model_fields.STUDY_SITE}
                />
            
                <ReferenceInput
                label={'en.models.datasets.project'}
                source={Constants.model_fk_fields.PROJECT}
                reference={Constants.models.PROJECTS}
                validate={validateProject}
                defaultValue={this.props.location.project ? this.props.location.project : null}
                >
                <SelectInput source={Constants.model_fields.NAME} optionText={<ProjectName basePath={basePath} label={"en.models.projects.name"}/>}/>
                </ReferenceInput>
            
                <ReferenceInput
                resource={Constants.models.DATA_COLLECTION_STATUS}
                className="input-small"
                label={"en.models.datasets.data_collection_status"}
                source={Constants.model_fields.DATA_COLLECTION_STATUS}
                reference={Constants.models.DATA_COLLECTION_STATUS}
                validate={validateDataCollectionStatus}>
                <TranslationSelect optionText={Constants.model_fields.LABEL} />
                </ReferenceInput>
            
                <ReferenceInput
                resource={Constants.models.DISTRIBUTION_RESTRICTION}
                className="input-small"
                label={"en.models.datasets.distribution_restriction"}
                source={Constants.model_fields.DISTRIBUTION_RESTRICTION}
                reference={Constants.models.DISTRIBUTION_RESTRICTION}
                validate={validateDistributionRestriction}>
                <TranslationSelect optionText={Constants.model_fields.LABEL} />
                </ReferenceInput>
            
                <ReferenceArrayInput
                allowEmpty
                resource={Constants.models.DATA_COLLECTION_METHOD}
                className="input-medium"
                label={"en.models.datasets.data_collection_method"}
                source={Constants.model_fields.DATA_COLLECTION_METHOD}
                reference={Constants.models.DATA_COLLECTION_METHOD}
                validate={validateDataCollectionMethod}>
                <TranslationSelectArray optionText="label" />
                </ReferenceArrayInput>
            
                <ReferenceArrayInput
                resource={Constants.models.SENSITIVITY_LEVEL}
                className="input-medium"
                label={"en.models.datasets.sensitivity_level"}
                source={Constants.model_fields.SENSITIVITY_LEVEL}
                reference={Constants.models.SENSITIVITY_LEVEL}
                validate={validateSensitivityLevel}>
                <TranslationSelectArray optionText="label" />
                </ReferenceArrayInput>
            
                { this.props.mode === Constants.resource_operations.EDIT && this.props.id && (
                <React.Fragment>
                    <EditMetadata id={this.props.id} type="dataset"/>
                    <ConfigMetadata id={this.props.id} type="dataset" />
                </React.Fragment>
                )}
            
                { this.props.record && 
                 <MapForm content_type={'dataset'} recordGeo={this.props.record.geo} id={this.props.record.id} geoDataCallback={this.geoDataCallback}/>
                }
            </SimpleForm>
        );
    }
}
 
export default DSForm;
/*
                <Prompt when={this.state.isDirty} message={Constants.warnings.UNSAVED_CHANGES}/>

*/

/*
const BaseDatasetForm = ({ basePath, classes, ...props }) => {

/*
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      submitObjectWithGeo(data, geo, props)
    }
  }, [data])
*/
/*
function geoDataCallback(geo){
    if (props.record.geo !== geo){
      setGeo(geo)
      setIsDirty(true)
    }
  } 

  function handleSubmit(data) {
    //this is necessary instead of using the default react-admin save because there is no RA form that supports geoJSON
    //data_collection_method and sensitivity_level require some preprocessing due to how react-admin and the api treat multi entry fields.

    setIsDirty(false)
    let dcmList = []
    let slList = []
    let newData = {...data}
    data.data_collection_method.map(item => {dcmList.push({id: item}); return item})
    data.sensitivity_level.map(item => {slList.push({id: item}); return item;})
    newData.data_collection_method = dcmList
    newData.sensitivity_level = slList
    setData(newData) //will prompt the call in useEffect.

    submitObjectWithGeo(newData, geo, props)
  };

  //label={<CustomFormLabel classes={classes} labelText={"en.models.datasets.title"}/>}
  return(
  <SimpleForm {...props} save={handleSubmit} onChange={() => setIsDirty(true)} redirect={Constants.resource_operations.LIST}>
    <TextInput      
      label="Title"
      source={Constants.model_fields.TITLE}
      validate={validateTitle}
      
    />
    <TextInput
      className="input-large"
      label={"en.models.datasets.data_abstract"}
      options={{ multiline: true }}
      source={Constants.model_fields.ABSTRACT}
    />
    <TextInput
      className="input-small"
      label={"en.models.datasets.study_site"}
      source={Constants.model_fields.STUDY_SITE}
    />

    <ReferenceInput
      label={'en.models.datasets.project'}
      source={Constants.model_fk_fields.PROJECT}
      reference={Constants.models.PROJECTS}
      validate={validateProject}
      defaultValue={props.location.project ? props.location.project : null}
    >
      <SelectInput source={Constants.model_fields.NAME} optionText={<ProjectName basePath={basePath} label={"en.models.projects.name"}/>}/>
    </ReferenceInput>

    <ReferenceInput
      resource={Constants.models.DATA_COLLECTION_STATUS}
      className="input-small"
      label={"en.models.datasets.data_collection_status"}
      source={Constants.model_fields.DATA_COLLECTION_STATUS}
      reference={Constants.models.DATA_COLLECTION_STATUS}
      validate={validateDataCollectionStatus}>
      <TranslationSelect optionText={Constants.model_fields.LABEL} />
    </ReferenceInput>

    <ReferenceInput
      resource={Constants.models.DISTRIBUTION_RESTRICTION}
      className="input-small"
      label={"en.models.datasets.distribution_restriction"}
      source={Constants.model_fields.DISTRIBUTION_RESTRICTION}
      reference={Constants.models.DISTRIBUTION_RESTRICTION}
      validate={validateDistributionRestriction}>
      <TranslationSelect optionText={Constants.model_fields.LABEL} />
    </ReferenceInput>

    <ReferenceArrayInput
      allowEmpty
      resource={Constants.models.DATA_COLLECTION_METHOD}
      className="input-medium"
      label={"en.models.datasets.data_collection_method"}
      source={Constants.model_fields.DATA_COLLECTION_METHOD}
      reference={Constants.models.DATA_COLLECTION_METHOD}
      validate={validateDataCollectionMethod}>
      <TranslationSelectArray optionText="label" />
    </ReferenceArrayInput>

    <ReferenceArrayInput
      resource={Constants.models.SENSITIVITY_LEVEL}
      className="input-medium"
      label={"en.models.datasets.sensitivity_level"}
      source={Constants.model_fields.SENSITIVITY_LEVEL}
      reference={Constants.models.SENSITIVITY_LEVEL}
      validate={validateSensitivityLevel}>
      <TranslationSelectArray optionText="label" />
    </ReferenceArrayInput>

    { props.mode === Constants.resource_operations.EDIT && props.id && (
      <React.Fragment>
        <EditMetadata id={props.id} type="dataset"/>
        <ConfigMetadata id={props.id} type="dataset" />
      </React.Fragment>
    )}

    { props.record && 
      <MapForm content_type={'dataset'} recordGeo={props.record.geo} id={props.record.id} geoDataCallback={geoDataCallback}/>
    }
    <Prompt when={isDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
  </SimpleForm>)
};

*/