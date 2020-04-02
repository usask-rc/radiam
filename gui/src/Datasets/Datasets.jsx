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
import get from 'lodash/get';
import { ConfigMetadata, EditMetadata, ShowMetadata } from "../_components/Metadata.jsx";
import {RESOURCE_OPERATIONS, MODEL_FK_FIELDS, MODELS, ROLE_USER, MODEL_FIELDS} from "../_constants/index";
import MapForm from '../_components/_forms/MapForm';
import MapView from '../_components/_fragments/MapView';
import ProjectName from "../_components/_fields/ProjectName";
import PropTypes from 'prop-types';
import { submitObjectWithGeo, isAdminOfAParentGroup, getExportKey, requestDownload } from '../_tools/funcs';
import TranslationChipField from "../_components/_fields/TranslationChipField";
import TranslationField from '../_components/_fields/TranslationField';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import TranslationSelectArray from "../_components/_fields/TranslationSelectArray";
import { withStyles } from '@material-ui/core/styles';
import { GET_ONE } from 'ra-core';
import { Toolbar, Button, IconButton, Typography, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { EditButton } from 'ra-ui-materialui/lib/button';
import CloudDownload from "@material-ui/icons/CloudDownload"
import { radiamRestProvider, getAPIEndpoint, httpClient } from '../_tools/index.js';
import BrowseTab from '../Projects/Browse/BrowseTab.jsx';
import { DefaultToolbar } from '../_components/index.js';
import { SimpleShowLayout } from 'ra-ui-materialui/lib/detail';
import { Redirect } from 'react-router';
import DatasetTitle from './DatasetTitle.jsx';

const styles = {
  actions: {
    backgroundColor: 'inherit',
  },
  buttonIcon: {
    marginRight: "0.5em",
  },
  buttonText: {
    fontSize: "0.55em",
  },
  abstractField: {
    width: "50em",
  },
  titleField: {
    width: "50em",
  },
  otherField: {
    width: "20em",
  },
  searchModelField: {
    width: "30em",
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
  },
  mapFormHeader: {
    marginTop: "1em",
    paddingBottom: "1em",
  },
  preMapArea: {
    marginBottom: "1em",
  },
};

const actionStyles = theme => ({
  toolbar:{
    float: "right",
    marginTop: "-20px",
  }
})

 export const DatasetShowActions = withStyles(actionStyles)(({ basePath, data, setExportLink, classes}) => {

  const user = JSON.parse(localStorage.getItem(ROLE_USER));
  const [showEdit, setShowEdit] = useState(user.is_admin)
  let _isMounted = true

  console.log("in datasetshowactions, data is: ", data)

  const exportDataset = (data) => {
    const {id, title} = data

    getExportKey(id, MODELS.DATASETS).then(exportKey => {
      requestDownload(exportKey, {id, title} ).then(response => {
        return response //nothing to report upon success.
      }).catch(err => console.error(err))
      return data
    })
  }

  useEffect(() => {
    if (data && !showEdit){

      const params = { id: data.project }
      const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient)
      dataProvider(GET_ONE, MODELS.PROJECTS, params).then(response => {
        if (_isMounted){
          isAdminOfAParentGroup(response.data.group).then(data => {setShowEdit(data)})
        }
        //now have a group - check for adminship
      }).catch(err => {console.error("error in useeffect datasetshowactions: ", err)})
    }
    return function cleanup() {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      _isMounted = false
    }
  })
  if (showEdit && data){
    return(
    <Toolbar className={classes.toolbar}>
      <IconButton color={"primary"} name={"exportButton"} aria-label={"EXPORT"} label={"Export"} onClick={() => exportDataset(data)}>
        <CloudDownload className={classes.buttonIcon} />
        <Typography className={classes.buttonText}>{`EXPORT`}</Typography>
      </IconButton>
      <EditButton basePath={basePath} record={data} />
    </Toolbar>
    )
  }
  else{
    return null
  }

})


//a form used for displaying a dataset in a modal (a simplified view with no tabs))
export const DatasetModalShow = withTranslate(({ classes, translate, ...props}) => (
  <Show {...props}>
    <SimpleShowLayout>
    <DatasetTitle prefix="Viewing" />
        <TextField
          label={"en.models.datasets.title"}
          source={MODEL_FIELDS.TITLE}
        />

        <ReferenceField
          link={false}
          label={"en.models.datasets.project"}
          source={MODEL_FK_FIELDS.PROJECT}
          reference={MODELS.PROJECTS}
        >
          <ProjectName label={"en.models.projects.name"}
          />
        </ReferenceField>

        <TextField
          label={"en.models.datasets.data_abstract"}
          source={MODEL_FIELDS.ABSTRACT}
          options={{ multiline: true}}
        />

        <TextField
          label={"en.models.datasets.study_site"}
          source={MODEL_FIELDS.STUDY_SITE}
        />

        <TextField
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

        <ReferenceArrayField
          link={false}
          label={"en.models.datasets.data_collection_method"} reference={MODELS.DATA_COLLECTION_METHOD} source={MODEL_FIELDS.DATA_COLLECTION_METHOD}>
          <SingleFieldList linkType={false}>
            <TranslationChipField link={false} source={MODEL_FIELDS.LABEL}/>
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

        <ReferenceArrayField 
          label={"en.models.datasets.sensitivity_level"} reference={MODELS.SENSITIVITY_LEVEL} source={MODEL_FIELDS.SENSITIVITY_LEVEL}>
          <SingleFieldList linkType={false}>
            <TranslationChipField link={false} source={MODEL_FIELDS.LABEL} />
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
        <ShowController {...props}>
          {controllerProps => (controllerProps.record && 
          controllerProps.record.geo && 
          controllerProps.record.geo.geojson && 
          controllerProps.record.geo.geojson.features.length > 0 ?
          <MapView {...controllerProps}/>
          : null
          )}
        </ShowController>
    </SimpleShowLayout>
  </Show>
))


export const BaseDatasetShow = withTranslate(({ classes, translate, ...props }) => {
  const [exportLink, setExportLink] = useState(false)

  console.log("exportLink in basedatasetshow is: ", exportLink)
  return(
  <Show actions={<DatasetShowActions setExportLink={setExportLink} classes={classes}/>} {...props}>
    <TabbedShowLayout>
      <Tab label={'Summary'}>
        <Dialog open={exportLink} onClose={() => {setExportLink(false)}} aria-label="Download Data">
          <DialogTitle>{`Download Metadata`}</DialogTitle>
          <DialogContent>
            <a href={exportLink} download={exportLink}>{`${exportLink}`}</a>
          </DialogContent>
        </Dialog>
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
          source={MODEL_FIELDS.ABSTRACT}
        />

        <TextField
          label={"en.models.datasets.study_site"}
          source={MODEL_FIELDS.STUDY_SITE}
        />

        <TextField
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
          <SingleFieldList linkType={false}>
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
          <SingleFieldList linkType={false}>
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
        <ShowController {...props}>
          {controllerProps => (controllerProps.record && 
          controllerProps.record.geo && 
          controllerProps.record.geo.geojson && 
          controllerProps.record.geo.geojson.features.length > 0 ?
          <MapView {...controllerProps}/>
          : null
          )}
        </ShowController>
      </Tab>
      <Tab label={MODEL_FIELDS.FILES} path={MODEL_FIELDS.FILES}>    
        <ShowController {...props}>
          {controllerProps => {
          if (controllerProps && controllerProps.record){
            return <BrowseTab projectID={controllerProps.record.project} searchModel={controllerProps.record.search_model} datasetID={controllerProps.record.id} dataType="datasets" projectName={`ds_`} {...controllerProps} />
          }
          return <Typography>{`Loading...`}</Typography>;

          }}
        </ShowController>
      </Tab>
    </TabbedShowLayout>
  </Show>
)
          });


const validateProject = required('A project is required for a dataset');
const validateTitle = required('en.validate.dataset.title');
const validatedcm = required("A Data Collection Method is required")
const validatedcs = required("A Data Collection Status is required")
const validatedr = required("A Distribution Restriction must be specified")
const validatesl = required("A Sensitivity Level must be specified")

const validateSearchModel = (value) => {

  //return true if searchModel is not yet loaded - this is to get around the fact that the parse arrives after initial validation
  //after initial load, this value should be either valid or invalid JSON, but never undef again
  if (value === undefined){
    return
  }
  
  if (!value){
    //we've been sent no value
    return `Enter a search model in valid JSON`
  }

  try {
    if (value.search){
      JSON.stringify(value.search)
    }
    else{
      JSON.parse(value)
    }
  }
  catch(e){
    console.error("json parse error e: ", value)
    return `Entry is not valid JSON`
  }
}

const CustomLabel = ({classes, translate, labelText} ) => {
  return <p className={classes.label}>{translate(labelText)}</p>
}

const BaseDatasetForm = ({ basePath, classes, location, mode, onSave, record, save, translate, ...props }) => {
  const [geo, setGeo] = useState(get(record, "geo", {}));
  const [redirect, setRedirect] = useState(null)
  const [showMap, setShowMap] = useState(get(record, "geo.geojson.features.length", 0) > 0);
  //TODO: refactor this
  const [searchModel, setSearchModel] = useState(JSON.stringify(get(location, "search_model.search", get(record, "search_model.search", {}))));

  function handleChange(e){
    if (e.target && e.target.name === "search_model"){
      //console.log("handlechange setsearchmodel to value: ", e.target.value)
      setSearchModel(e.target.value)
    }
  }

  function handleSubmit(data) {
    //this is necessary instead of using the default react-admin save because there is no RA form that supports geoJSON
    //data_collection_method and sensitivity_level require some preprocessing due to how react-admin and the api treat multi entry fields.

    //console.log("datasetform handleSubmit sent data: ", data)
    let dcmList = []
    let slList = []
    let newData = {...data}
    newData.search_model = {search: searchModel}
    try{
      let parseJSON = JSON.parse(searchModel)
      newData.search_model.search = JSON.stringify(parseJSON)
    }
    catch(e){
      console.error(`error parsing data to json: ${searchModel}` , e)
    }

    data.data_collection_method.map(item => {dcmList.push({id: item}); return item})
    data.sensitivity_level.map(item => {slList.push({id: item}); return item;})
    newData.data_collection_method = dcmList
    newData.sensitivity_level = slList
    props.resource = "datasets"

    submitObjectWithGeo(newData, geo, props, null, props.setCreateModal || props.setEditModal ? true : false).then(
      data => {
        //console.log("submitobjectwithgeo success, returned data: ", data)
        setRedirect("/datasets")
      }
    ).catch(err => console.error("submitobjectwithgeo dataset error", err))
  };

  return(
    <SimpleForm record={record} {...props} save={handleSubmit} redirect={RESOURCE_OPERATIONS.LIST}
        toolbar={mode && mode === "edit" && <DefaultToolbar {...props} />}>
      <DatasetTitle prefix={props.record && Object.keys(props.record).length > 0 ? "Updating" : "Creating"} />  
      <TextInput
        label="Title"
        defaultValue={props.location && props.location.title ? props.location.title : ""}
        source={MODEL_FIELDS.TITLE}
        validate={validateTitle}
        className={classes.titleField}
      />
      <TextInput
        className={classes.abstractField}
        label={"en.models.datasets.data_abstract"}
        options={{ multiline: true, rows: 8 }}
        source={MODEL_FIELDS.ABSTRACT}
        rows={5}
      />
      <TextInput
        className={classes.otherField}
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
        required
        className={classes.otherField}
      >
        <SelectInput source={MODEL_FIELDS.NAME} optionText={<ProjectName basePath={basePath} label={"en.models.projects.name"}/>}/>
      </ReferenceInput>

      <TextInput
        className={classes.searchModelField}
        id={"search_model"}
        name={"search_model"}
        label={"Search Model"}
        multiline
        rows={5}
        validate={validateSearchModel}
        value={searchModel}
        required
        onChange={(e) => handleChange(e)}
      />

      <ReferenceInput
        resource={MODELS.DATA_COLLECTION_STATUS}
        label={"en.models.datasets.data_collection_status"}
        source={MODEL_FIELDS.DATA_COLLECTION_STATUS}
        reference={MODELS.DATA_COLLECTION_STATUS}
        validate={validatedcs}
        className={classes.otherField}
        required>
        <TranslationSelect 
          optionText={MODEL_FIELDS.LABEL}
        />
      </ReferenceInput>

      <ReferenceArrayInput
        allowEmpty
        resource={MODELS.DATA_COLLECTION_METHOD}
        label={"en.models.datasets.data_collection_method"}
        source={MODEL_FIELDS.DATA_COLLECTION_METHOD}
        reference={MODELS.DATA_COLLECTION_METHOD}
        validate={validatedcm}
        className={classes.otherField}
        required>
        <TranslationSelectArray 
          optionText="label" 
        />
      </ReferenceArrayInput>

      <ReferenceInput
        resource={MODELS.DISTRIBUTION_RESTRICTION}
        label={"en.models.datasets.distribution_restriction"}
        source={MODEL_FIELDS.DISTRIBUTION_RESTRICTION}
        reference={MODELS.DISTRIBUTION_RESTRICTION}
        validate={validatedr}
        className={classes.otherField}
        required>
        <TranslationSelect 
          optionText={MODEL_FIELDS.LABEL} 
        />
      </ReferenceInput>

      <ReferenceArrayInput
        resource={MODELS.SENSITIVITY_LEVEL}
        label={"en.models.datasets.sensitivity_level"}
        source={MODEL_FIELDS.SENSITIVITY_LEVEL}
        reference={MODELS.SENSITIVITY_LEVEL}
        validate={validatesl}
        className={classes.otherField}
        required>
        <TranslationSelectArray 
        optionText="label"
         />
      </ReferenceArrayInput>

      { mode === "edit" && record && (
        <>
          <EditMetadata id={get(record, "id", null)} values={get(record, "metadata", null)} type="dataset" addButton={true}/>
          <ConfigMetadata record={record} type="dataset" />
        </>
      )}
      <div className={classes.preMapArea}>
        <Button variant="contained" color={showMap ? "secondary" : "primary"} onClick={() => setShowMap(!showMap)}>{showMap ? `Hide Map Form` : `Show Map Form`}</Button>
      </div>
      {showMap &&
        <MapForm content_type={'dataset'} recordGeo={geo} id={record && record.id ? record.id : null} geoDataCallback={setGeo}/>
      }
      {redirect && <Redirect to={redirect} /> }
    </SimpleForm>
  )
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
    <Edit submitOnEnter={false} {...props} >
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
export const DatasetShow = enhance(BaseDatasetShow)
