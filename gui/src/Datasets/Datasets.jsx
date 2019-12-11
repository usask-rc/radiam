//Datasets.jsx
import React, { useState, useEffect } from 'react';
import {
  Create,
  Edit,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  Show,
  ShowController,
  SimpleForm,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
  translate,
  withTranslate,
} from 'react-admin';
import compose from "recompose/compose";
import { ConfigMetadata, EditMetadata, MetadataEditActions, ShowMetadata } from "../_components/Metadata.jsx";
import * as Constants from '../_constants/index';
import MapForm from '../_components/_forms/MapForm';
import MapView from '../_components/_fragments/MapView';
import ProjectName from "../_components/_fields/ProjectName";
import PropTypes from 'prop-types';
import { submitObjectWithGeo, isAdminOfAParentGroup, postObjectWithoutSaveProp } from '../_tools/funcs';
import TranslationChipField from "../_components/_fields/TranslationChipField";
import TranslationField from '../_components/_fields/TranslationField';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import TranslationSelectArray from "../_components/_fields/TranslationSelectArray";
import { withStyles } from '@material-ui/core/styles';
import { GET_ONE } from 'ra-core';
import { Toolbar } from '@material-ui/core';
import { EditButton } from 'ra-ui-materialui/lib/button';
import { radiamRestProvider, getAPIEndpoint, httpClient } from '../_tools/index.js';
import DatasetTitle from './DatasetTitle.jsx';

const styles = {
  actions: {
    backgroundColor: 'inherit',
  },
  header: {
    backgroundColor: 'inherit',
  },
  root: {
    backgroundColor: 'inherit',
  },
  /* https://stackoverflow.com/questions/55940218/preserving-line-breaks-with-react-admin-material-uis-textfields */
  showBreaks: {
    whiteSpace: "pre-wrap",
  },

  label: {
    fontSize: '1em',
  },
  hint: {
  fontSize: '2em',
  }
};

const actionStyles = theme => ({
  toolbar:{
    float: "right",
    marginTop: "-20px",
  }
})

 export const DatasetShowActions = withStyles(actionStyles)(({ basePath, data, classes}) => {

  const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER));
  const [showEdit, setShowEdit] = useState(user.is_admin)

  //TODO: i hate that i have to do this.  It's not that inefficient, but I feel like there must be a better way.
  useEffect(() => {
    if (data && !showEdit){

      const params = { id: data.project }
      const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient)
      dataProvider(GET_ONE, Constants.models.PROJECTS, params).then(response => {
        isAdminOfAParentGroup(response.data.group).then(data => {setShowEdit(data)})
        //now have a group - check for adminship
      }).catch(err => {console.error("error in useeffect datasetshowactions: ", err)})
    }
  })
  if (showEdit){
    return(
    <Toolbar className={classes.toolbar}>
      <EditButton basePath={basePath} record={data} />
    </Toolbar>
    )
  }
  else{
    return null
  }

})


export const DatasetShow = withTranslate(({ classes, translate, ...props }) => (
  <Show actions={<DatasetShowActions/>} {...props}>
    <SimpleShowLayout>
        <DatasetTitle prefix="Viewing" />
        <TextField
          label={"en.models.datasets.title"}
          source={Constants.model_fields.TITLE}
        />

        <ReferenceField
          linkType={false}
          label={"en.models.grants.project"}
          source={Constants.model_fk_fields.PROJECT}
          reference={Constants.models.PROJECTS}
        >
          <ProjectName label={"en.models.projects.name"}/>
        </ReferenceField>

        <TextField
          label={"en.models.datasets.data_abstract"}
          source={Constants.model_fields.DATA_ABSTRACT}
        />

        <TextField
          label={"en.models.datasets.study_site"}
          source={Constants.model_fields.STUDY_SITE}
        />

        <ReferenceField
          label={"en.models.datasets.data_collection_status"}
          source={Constants.model_fields.DATA_COLLECTION_STATUS}
          reference={Constants.models.DATA_COLLECTION_STATUS}
          linkType={false}
        >
          <TranslationField
            label={"en.models.roles.label"}
            source={Constants.model_fields.LABEL}
          />
        </ReferenceField>

        <ReferenceArrayField label={"en.models.datasets.data_collection_method"} reference={Constants.models.DATA_COLLECTION_METHOD} source={Constants.model_fields.DATA_COLLECTION_METHOD}>
          <SingleFieldList linkType={"show"}>
            <TranslationChipField source={Constants.model_fields.LABEL}/>
          </SingleFieldList>
        </ReferenceArrayField>

        <ReferenceField
          label={"en.models.datasets.distribution_restriction"}
          source={Constants.model_fields.DISTRIBUTION_RESTRICTION}
          reference={Constants.models.DISTRIBUTION_RESTRICTION}
          linkType={false}
        >
          <TranslationField
            label={"en.models.roles.label"}
            source={Constants.model_fields.LABEL}
          />
        </ReferenceField>

        <ReferenceArrayField label={"en.models.datasets.sensitivity_level"} reference={Constants.models.SENSITIVITY_LEVEL} source={Constants.model_fields.SENSITIVITY_LEVEL}>
          <SingleFieldList linkType={"show"}>
            <TranslationChipField source={Constants.model_fields.LABEL} />
          </SingleFieldList>
        </ReferenceArrayField>

        {/** Needs a ShowController to get the record into the ShowMetadata **/}
        <ShowController translate={translate} {...props}>
          { controllerProps => (
            <ShowMetadata
              type="dataset"
              translate={translate}
              record={controllerProps.record}
              basePath={controllerProps.basePath}
              resource={controllerProps.resource}
              id={controllerProps.record.id}
              props={props}
            />
          )}
        </ShowController>
        <MapView/>
    </SimpleShowLayout>
  </Show>
));


const validateProject = required('A project is required for a dataset');
const validateTitle = required('en.validate.dataset.title');


const CustomLabel = ({classes, translate, labelText} ) => {
  return <p className={classes.label}>{translate(labelText)}</p>
}

const BaseDatasetForm = ({ basePath, classes, ...props }) => {
  const [geo, setGeo] = useState(props.record && props.record.geo ? props.record.geo : {})
  const [data, setData] = useState({})
  const [isDirty, setIsDirty] = useState(false)


  function geoDataCallback(geo){
    if (props.project || (props.record && props.record.geo !== geo)){
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
    
    console.log("handlesubmit of datasets form is: ", newData, props, geo)

    //when submitting from a modal, react-admin treats resource as the projects page instead of the dataset page.
    props.resource = "datasets"

    //if (props.save){
    submitObjectWithGeo(newData, geo, props, null, props.setCreateModal || props.setEditModal ? true : false)

    if (props.setCreateModal){
      props.setCreateModal(false)
    }
    else if (props.setEditModal){
      props.setEditModal(false)
    }
  };

  console.log("props record after editmodal transofmration: ", props.record)

  return(
  <SimpleForm {...props} save={handleSubmit} onChange={() => setIsDirty(true)} redirect={Constants.resource_operations.LIST}>
    <DatasetTitle prefix={props.record && Object.keys(props.record).length > 0 ? "Updating" : "Creating"} />  
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
      defaultValue={props.project ? props.project : null}
      disabled={props.project ? true : false}
    >
      <SelectInput source={Constants.model_fields.NAME} optionText={<ProjectName basePath={basePath} label={"en.models.projects.name"}/>}/>
    </ReferenceInput>

    <ReferenceInput
      resource={Constants.models.DATA_COLLECTION_STATUS}
      className="input-small"
      label={"en.models.datasets.data_collection_status"}
      source={Constants.model_fields.DATA_COLLECTION_STATUS}
      reference={Constants.models.DATA_COLLECTION_STATUS}
      required>
      <TranslationSelect optionText={Constants.model_fields.LABEL} />
    </ReferenceInput>

    <ReferenceInput
      resource={Constants.models.DISTRIBUTION_RESTRICTION}
      className="input-small"
      label={"en.models.datasets.distribution_restriction"}
      source={Constants.model_fields.DISTRIBUTION_RESTRICTION}
      reference={Constants.models.DISTRIBUTION_RESTRICTION}
      required>
      <TranslationSelect optionText={Constants.model_fields.LABEL} />
    </ReferenceInput>

    <ReferenceArrayInput
      allowEmpty
      resource={Constants.models.DATA_COLLECTION_METHOD}
      className="input-medium"
      label={"en.models.datasets.data_collection_method"}
      source={Constants.model_fields.DATA_COLLECTION_METHOD}
      reference={Constants.models.DATA_COLLECTION_METHOD}
      required>
      <TranslationSelectArray optionText="label" />
    </ReferenceArrayInput>

    <ReferenceArrayInput
      resource={Constants.models.SENSITIVITY_LEVEL}
      className="input-medium"
      label={"en.models.datasets.sensitivity_level"}
      source={Constants.model_fields.SENSITIVITY_LEVEL}
      reference={Constants.models.SENSITIVITY_LEVEL}
      required>
      <TranslationSelectArray optionText="label" />
    </ReferenceArrayInput>

    { props.mode === Constants.resource_operations.EDIT && props.id && (
      <React.Fragment>
        <EditMetadata id={props.id} type="dataset"/>
        <ConfigMetadata id={props.id} type="dataset" />
      </React.Fragment>
    )}

    <MapForm content_type={'dataset'} recordGeo={props.record ? props.record.geo : null} id={props.record ? props.record.id : null} geoDataCallback={geoDataCallback}/>
  </SimpleForm>)
};


export const DatasetCreate = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Create submitOnEnter={false} {...props}>
      <DatasetForm {...other} />
    </Create>
  );
};

export const BaseDatasetEdit = withTranslate(({ translate, ...props}) => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Edit actions={<MetadataEditActions />} submitOnEnter={false} {...props} >
      <DatasetForm mode={Constants.resource_operations.EDIT} {...other} />
    </Edit>
  );
});

const enhance = compose(
  translate,
  withStyles(styles),
);

BaseDatasetEdit.propTypes = {
  translate: PropTypes.func.isRequired,
};

export const CustomFormLabel = translate(CustomLabel)
export const DatasetForm = enhance(BaseDatasetForm)

export const DatasetEdit = enhance(BaseDatasetEdit);
