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
import { Prompt } from "react-router"
import PropTypes from 'prop-types';
import { submitObjectWithGeo } from '../_tools/funcs';
import TranslationChipField from "../_components/_fields/TranslationChipField";
import TranslationField from '../_components/_fields/TranslationField';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import TranslationSelectArray from "../_components/_fields/TranslationSelectArray";
import { withStyles } from '@material-ui/core/styles';

const listStyles = {
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
};

export const DatasetShow = withTranslate(({ classes, translate, ...props }) => (
  <Show title={<DatasetTitle />} {...props}>
    <SimpleShowLayout>
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
          <SingleFieldList>
            <TranslationChipField source={Constants.model_fields.LABEL} />
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
          <SingleFieldList>
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
        


const validateDistributionRestriction = required('en.validate.dataset.distribution_restriction');
const validateDataCollectionMethod = required('en.validate.dataset.data_collection_method');
const validateDataCollectionStatus = required('en.validate.dataset.data_collection_status');
const validateProject = required('A project is required for a dataset');
const validateSensitivityLevel = required('en.validate.dataset.sensitivity_level');
const validateTitle = required('en.validate.dataset.title');



const DatasetForm = ({ basePath, classes, ...props }) => {
  const [geo, setGeo] = useState(props.record.geo ? props.record.geo : {})
  const [dirty, setDirty] = useState(false)
  const [data, setData] = useState({})

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      submitObjectWithGeo(data, geo, props)
    }
  }, [data])

  function geoDataCallback(geo){
    if (props.record.geo !== geo){
      setGeo(geo)
      setDirty(true)
    }
  } 

  function handleSubmit(data) {
    //this is necessary instead of using the default react-admin save because there is no RA form that supports geoJSON
    //data_collection_method and sensitivity_level require some preprocessing due to how react-admin and the api treat multi entry fields.
    let dcmList = []
    let slList = []
    let newData = {...data}
    data.data_collection_method.map(item => {dcmList.push({id: item}); return item})
    data.sensitivity_level.map(item => {slList.push({id: item}); return item;})
    newData.data_collection_method = dcmList
    newData.sensitivity_level = slList
    setDirty(false)
    setData(newData) //will prompt the call in useEffect.
  };

  function handleChange(data) {
    setDirty(true)
  }

  return(
  <SimpleForm {...props} save={handleSubmit} onChange={handleChange} redirect={Constants.resource_operations.LIST}>
    <TextInput
      className="input-small"
      label={"en.models.datasets.title"}
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

    { props.mode == Constants.resource_operations.EDIT && props.id && (
      <React.Fragment>
        <EditMetadata id={props.id} type="dataset"/>
        <ConfigMetadata id={props.id} type="dataset" />
      </React.Fragment>
    )}

    { props.record && 
      <MapForm content_type={'dataset'} recordGeo={props.record.geo} id={props.record.id} geoDataCallback={geoDataCallback}/>
    }
    <Prompt when={dirty} message={Constants.warnings.UNSAVED_CHANGES}/>


  </SimpleForm>)
};

export const DatasetCreate = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Create {...props}>
      <DatasetForm {...other} />
    </Create>
  );
};

export const DatasetTitle = ({ record }) => {
  return <span>Dataset {record ? `"${record.name}"` : ''}</span>;
};

export const BaseDatasetEdit = withTranslate(({ translate, ...props}) => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Edit title={<DatasetTitle />} actions={<MetadataEditActions />} {...props} >
      <DatasetForm mode={Constants.resource_operations.EDIT} {...other} />
    </Edit>
  );
});

const enhance = compose(
  translate,
  withStyles(listStyles),
);

BaseDatasetEdit.propTypes = {
  translate: PropTypes.func.isRequired,
};


export const DatasetEdit = enhance(BaseDatasetEdit);
