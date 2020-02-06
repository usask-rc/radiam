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
  SingleFieldList,
  Tab,
  TabbedShowLayout,
  TextField,
  TextInput,
  translate,
  withTranslate,
} from 'react-admin';
import compose from "recompose/compose";
import { ConfigMetadata, EditMetadata, MetadataEditActions, ShowMetadata } from "../_components/Metadata.jsx";
import {RESOURCE_OPERATIONS, MODEL_FK_FIELDS, MODELS, ROLE_USER, MODEL_FIELDS} from "../_constants/index";
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
import { GET_ONE, FormDataConsumer } from 'ra-core';
import { Toolbar } from '@material-ui/core';
import { EditButton } from 'ra-ui-materialui/lib/button';
import { radiamRestProvider, getAPIEndpoint, httpClient } from '../_tools/index.js';
import DatasetTitle from './DatasetTitle.jsx';
import ExportButton from 'ra-ui-materialui/lib/button/ExportButton';
import BrowseTab from '../Projects/Browse/BrowseTab.jsx';
import FilesTab from '../Projects/Files/FilesTab.jsx';
import { Field } from 'react-final-form';

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
  },
  searchModel: {
  }
};

const actionStyles = theme => ({
  toolbar:{
    float: "right",
    marginTop: "-20px",
  }
})

 export const DatasetShowActions = withStyles(actionStyles)(({ basePath, data, classes}) => {

  const user = JSON.parse(localStorage.getItem(ROLE_USER));
  const [showEdit, setShowEdit] = useState(user.is_admin)

  console.log("datasetshowactions data: ", data)

  //TODO: i hate that i have to do this.  It's not that inefficient, but I feel like there must be a better way.
  useEffect(() => {
    if (data && !showEdit){

      const params = { id: data.project }
      const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient)
      dataProvider(GET_ONE, MODELS.PROJECTS, params).then(response => {
        isAdminOfAParentGroup(response.data.group).then(data => {setShowEdit(data)})
        //now have a group - check for adminship
      }).catch(err => {console.error("error in useeffect datasetshowactions: ", err)})
    }
  })
  if (showEdit && data){
    return(
    <Toolbar className={classes.toolbar}>
      <ExportButton resource={`datasets/${data.id}/export`} />
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
    <TabbedShowLayout>
      <Tab label={'Summary'}>
        <DatasetTitle prefix="Viewing" />
        <TextField
          label={"en.models.datasets.title"}
          source={MODEL_FIELDS.TITLE}
        />

        <ReferenceField
          link={false}
          label={"en.models.grants.project"}
          source={MODEL_FK_FIELDS.PROJECT}
          reference={MODELS.PROJECTS}
        >
          <ProjectName label={"en.models.projects.name"}/>
        </ReferenceField>

        <TextField
          label={"en.models.datasets.data_abstract"}
          source={MODEL_FIELDS.DATA_ABSTRACT}
        />

        <TextField
          label={"en.models.datasets.study_site"}
          source={MODEL_FIELDS.STUDY_SITE}
        />

        <TextField multiline
        label={"en.models.datasets.search_model"}
        source={"search_model.search"}
        />

        <ReferenceField
          label={"en.models.datasets.data_collection_status"}
          source={MODEL_FIELDS.DATA_COLLECTION_STATUS}
          reference={MODELS.DATA_COLLECTION_STATUS}
          link={false}
        >
          <TranslationField
            label={"en.models.roles.label"}
            source={MODEL_FIELDS.LABEL}
          />
        </ReferenceField>

        <ReferenceArrayField label={"en.models.datasets.data_collection_method"} reference={MODELS.DATA_COLLECTION_METHOD} source={MODEL_FIELDS.DATA_COLLECTION_METHOD}>
          <SingleFieldList link={"show"}>
            <TranslationChipField source={MODEL_FIELDS.LABEL}/>
          </SingleFieldList>
        </ReferenceArrayField>

        <ReferenceField
          label={"en.models.datasets.distribution_restriction"}
          source={MODEL_FIELDS.DISTRIBUTION_RESTRICTION}
          reference={MODELS.DISTRIBUTION_RESTRICTION}
          link={false}
        >
          <TranslationField
            label={"en.models.roles.label"}
            source={MODEL_FIELDS.LABEL}
          />
        </ReferenceField>

        <ReferenceArrayField label={"en.models.datasets.sensitivity_level"} reference={MODELS.SENSITIVITY_LEVEL} source={MODEL_FIELDS.SENSITIVITY_LEVEL}>
          <SingleFieldList link={"show"}>
            <TranslationChipField source={MODEL_FIELDS.LABEL} />
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
      </Tab>
      <Tab label={MODEL_FIELDS.FILES} path={MODEL_FIELDS.FILES}>    
        <FilesTab projectID={props.id} dataType="datasets" />
      </Tab>
      <Tab label={'Browse'}>
        <BrowseTab projectID={props.id} dataType="datasets" projectName={`ds_`}
        //TODO: get the project name from the referenced project and insert it here into projectName
         />
      </Tab>
    </TabbedShowLayout>
  </Show>
));


const validateProject = required('A project is required for a dataset');
const validateTitle = required('en.validate.dataset.title');


/*
const validateUsername = [required('en.validate.user.username'), minLength(3), maxLength(12), regex(/^[a-zA-Z0-9]*$/, "Only Letters and Numbers are permitted")];

*/

const validateSearchModel = (value) => {
  console.log("validateSearchModel value: ", value)
  if (!value){
    return `Enter a search model in valid JSON`
  }

  //TODO: there is a bug here that if there is valid json already loaded into the form, you will have to modify it to get it to work again.
  try {
    let result = JSON.parse(value)

    //check here for invalid elasticsearch values
  }
  catch(e){
    console.log("json parse error e: ", e)
    return `Entry is not valid JSON`
  }

}

const CustomLabel = ({classes, translate, labelText} ) => {
  return <p className={classes.label}>{translate(labelText)}</p>
}

const BaseDatasetForm = ({ basePath, classes, ...props }) => {

  console.log("basedatasetform props: ", props)
  const [geo, setGeo] = useState(props.record && props.record.geo ? props.record.geo : {})
  const [data, setData] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  //TODO: refactor this
  const [searchModel, setSearchModel] = useState(props.location && props.location.search_model ? JSON.stringify(props.location.search_model) : props && props.record && props.record.search_model ? JSON.stringify(props.record.search_model.search) : "")

  function geoDataCallback(geo){
    if (props.project || (props.record && props.record.geo !== geo)){
      setGeo(geo)
      setIsDirty(true)
    }
  } 
  function handleChange(e){
    if (e.target && e.target.name === "search_model"){
      console.log("handlechange setsearchmodel to value: ", e.target.value)
      setSearchModel(e.target.value)
    }
  }

  function handleSubmit(data) {
    //this is necessary instead of using the default react-admin save because there is no RA form that supports geoJSON
    //data_collection_method and sensitivity_level require some preprocessing due to how react-admin and the api treat multi entry fields.

    console.log("datasetform handleSubmit sent data: ", data)
    setIsDirty(false)
    let dcmList = []
    let slList = []
    let newData = {...data}
    newData.search_model = {search: searchModel}
    try{
      let parseJSON = JSON.parse(searchModel)
      newData.search_model.search = JSON.stringify(parseJSON)
    }
    catch(e){
      console.log(`error parsing data to json: ${searchModel}` , e)
    }

    //TODO: refactor this shit
    
    data.data_collection_method.map(item => {dcmList.push({id: item}); return item})
    data.sensitivity_level.map(item => {slList.push({id: item}); return item;})
    newData.data_collection_method = dcmList
    newData.sensitivity_level = slList

    //TODO: there must be a better way to submit than this, even despite the isDirty flag.
    setData(newData) //will prompt the call in useEffect.

    
    console.log("handlesubmit of datasets form is: ", newData, props, geo)

    //when submitting from a modal, react-admin treats resource as the projects page instead of the dataset page.
    props.resource = "datasets"

    //if (props.save){
    if (!geo){

    }
    submitObjectWithGeo(newData, geo, props, null, props.setCreateModal || props.setEditModal ? true : false)

    if (props.setCreateModal){
      props.setCreateModal(false)
    }
    else if (props.setEditModal){
      props.setEditModal(false)
    }

  };

  console.log("props record after editmodal transofmration: ", props.record)


  //TODO: implement elasticsearch query setting area using `searchmodel/setsearchmodel`

  return(
  <SimpleForm {...props} save={handleSubmit} onChange={() => setIsDirty(true)} redirect={RESOURCE_OPERATIONS.LIST}>
    <DatasetTitle prefix={props.record && Object.keys(props.record).length > 0 ? "Updating" : "Creating"} />  
    <TextInput      
      label="Title"
      defaultValue={props.location && props.location.title || ""}
      source={MODEL_FIELDS.TITLE}
      validate={validateTitle}
      
    />
    <TextInput
      className="input-large"
      label={"en.models.datasets.data_abstract"}
      options={{ multiline: true }}
      source={MODEL_FIELDS.ABSTRACT}
    />
    <TextInput
      className="input-small"
      label={"en.models.datasets.study_site"}
      source={MODEL_FIELDS.STUDY_SITE}
    />

    <ReferenceInput
      label={'en.models.datasets.project'}
      source={MODEL_FK_FIELDS.PROJECT}
      reference={MODELS.PROJECTS}
      validate={validateProject}
      defaultValue={props.project ? props.project : props.location && props.location.project? props.location.project :  null}
      disabled={props.project ? true : false}
    >
      <SelectInput source={MODEL_FIELDS.NAME} optionText={<ProjectName basePath={basePath} label={"en.models.projects.name"}/>}/>
    </ReferenceInput>

      <TextInput
      className={classes.searchModel}
      id={"search_model"}
      name={"search_model"}
      label={"Search Model"}
      multiline
      validate={validateSearchModel}
      value={searchModel}
      onChange={(e) => handleChange(e)}
    />

    <ReferenceInput
      resource={MODELS.DATA_COLLECTION_STATUS}
      className="input-small"
      label={"en.models.datasets.data_collection_status"}
      source={MODEL_FIELDS.DATA_COLLECTION_STATUS}
      reference={MODELS.DATA_COLLECTION_STATUS}
      required>
      <TranslationSelect optionText={MODEL_FIELDS.LABEL} />
    </ReferenceInput>

    <ReferenceInput
      resource={MODELS.DISTRIBUTION_RESTRICTION}
      className="input-small"
      label={"en.models.datasets.distribution_restriction"}
      source={MODEL_FIELDS.DISTRIBUTION_RESTRICTION}
      reference={MODELS.DISTRIBUTION_RESTRICTION}
      required>
      <TranslationSelect optionText={MODEL_FIELDS.LABEL} />
    </ReferenceInput>

    <ReferenceArrayInput
      allowEmpty
      resource={MODELS.DATA_COLLECTION_METHOD}
      className="input-medium"
      label={"en.models.datasets.data_collection_method"}
      source={MODEL_FIELDS.DATA_COLLECTION_METHOD}
      reference={MODELS.DATA_COLLECTION_METHOD}
      required>
      <TranslationSelectArray optionText="label" />
    </ReferenceArrayInput>

    <ReferenceArrayInput
      resource={MODELS.SENSITIVITY_LEVEL}
      className="input-medium"
      label={"en.models.datasets.sensitivity_level"}
      source={MODEL_FIELDS.SENSITIVITY_LEVEL}
      reference={MODELS.SENSITIVITY_LEVEL}
      required>
      <TranslationSelectArray optionText="label" />
    </ReferenceArrayInput>

    { props.mode === RESOURCE_OPERATIONS.EDIT && props.id && (
      <>
        <EditMetadata id={props.id} type="dataset"/>
        <ConfigMetadata id={props.id} type="dataset" />
      </>
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
      <DatasetForm mode={RESOURCE_OPERATIONS.EDIT} {...other} />
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
