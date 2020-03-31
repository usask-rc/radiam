//LocationForm.jsx
import React, { Component } from 'react';
import {
  TextInput,
  ReferenceInput,
  ReferenceArrayInput,
  regex,
  required,
  SimpleForm,
} from 'react-admin';

import { compose } from 'recompose';
import {LOCATIONTYPE_OSF, MODELS, MODEL_FIELDS, MODEL_FK_FIELDS} from '../_constants/index';
import MapForm from '../_components/_forms/MapForm';
import { submitObjectWithGeo, toastErrors, deleteItem } from '../_tools/funcs';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import { withStyles } from '@material-ui/styles';
import { FormDataConsumer } from 'ra-core';
import { SelectArrayInput } from 'ra-ui-materialui/lib/input';
import { Typography, Button } from '@material-ui/core';
import { Redirect } from 'react-router';
import { toast } from 'react-toastify';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from "@material-ui/icons/Save";
import Toolbar from 'ra-ui-materialui/lib/form/Toolbar';
import SaveButton from 'ra-ui-materialui/lib/button/SaveButton';

const validateHostname = required('en.validate.locations.host_name');
const validateLocationType = required('en.validate.locations.location_type');
const validateGlobusEndpoint = regex(
  /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{8}/,
  'en.validate.locations.globus_endpoint'
);
const GJV = require("geojson-validation")

const toolbarStyles = ({
  deleteButton: {
    marginLeft: "0.5em",
    color: "tomato",
    fontSize: "0.8em",
  }
})

const styles = {
  geoTextArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  fakeToolbar: {
    marginTop: "1em",
  },
  preMapArea: {
    marginBottom: "1em",
  },
  titleText: {
    fontSize: "2em",
    width: 'inherit',
  },
  mapFormHeader: {
    paddingBottom: "1em",
    marginTop: "1em",
  },
  projectList: {
    minWidth: "18em",
  },
};

//NOTE: don't try to modularize this, it won't work because react-admin tries to force its way in.
const CustomDeleteButton = withStyles(toolbarStyles)(({id, resource, setRedirect, classes, ...props}) => {
  const callDelete = (data) => {
    deleteItem (id, "locations").then(data => {
      toast.success("Location Deleted")
      setRedirect("/locations")
    }).catch(err => toast.error(`Location not deleted: ${err}`))
  }

  return <Button className={classes.deleteButton} startIcon={<DeleteIcon />} onClick={() => callDelete()}>{`DELETE`}
  </Button>
})


class LocationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      geo: props.record.geo,
      geoText: '',
      isFormDirty: false,
      mapFormKey: 0,
      jsonTextFormKey: 1000,
      redirect: null,
      showMap: props.record && props.record.geo && props.record.geo.geojson && props.record.geo.geojson.features.length > 0 ? true : false,
    };

    if (props.record && props.record.projects){
      props.record.projects = this.fixProjectList(props.record.projects)
    }
  }

  componentDidMount() {
    const { geo } = this.state
    this.setState({ geoText: geo && geo.geojson ? JSON.stringify(geo.geojson.features, null, 2) : '[]' });
  }

  fixProjectList(projects) {
    const projList = []

    projects.map(project => {
      console.log("fixprojectlist project: ", project)
      projList.push(project.id)
      return project
    })
    return projList

  }

  
  geoDataCallback = callbackGeo => {

    const {record} = this.props
    const { jsonTextFormKey, geo } = this.state //no longer needed unless we re implement

    if (callbackGeo && Object.keys(callbackGeo).length > 0) {
      this.setState({ geo: callbackGeo }, () => this.setState({geoText: JSON.stringify(callbackGeo.geojson.features, null, 2)}, () => this.setState({jsonTextFormKey: jsonTextFormKey + 1})));
    } else {
      //this will likely have to be changed
      this.setState({ geo: {} });
    }

    //mark as dirty if prop value does not equal state value.  If they're equal, leave isDirty as is.
    if (geo !== record.geo) {
      this.setState({ isFormDirty: true });
    }
  };

  //this is necessary instead of using the default react-admin save because there is no RA form that supports geoJSON
  handleSubmit = (data) => {
    const { geo } = this.state  
    const projList = []
    
    data.projects.map(project => {
      projList.push({id: project, name: "temp"})
      return project
    })
    
    data.projects = projList

    if (this.props.record && this.props.record.id){
      data.id = this.props.record.id
    }

    //fill in blank fields that wont otherwise update, for some reason only happens in locationform
    const fields = [MODEL_FIELDS.GLOBUS_PATH, MODEL_FIELDS.GLOBUS_ENDPOINT, MODEL_FIELDS.DISPLAY_NAME, MODEL_FIELDS.HOST_NAME, MODEL_FIELDS.DISPLAY_NAME, 
       MODEL_FIELDS.OSF_PROJECT, MODEL_FIELDS.PORTAL_URL, MODEL_FIELDS.NOTES ]

    fields.map(field => {
      if (!data[`${field}`]){
        data[`${field}`] = ""
      }
    })

    console.log("handlesubmit data locationform: ", data)
    this.setState({isFormDirty: false}, () => {
        submitObjectWithGeo(data, geo, this.props, data.location_type === LOCATIONTYPE_OSF ? `/${MODELS.AGENTS}/create` : `/${MODELS.LOCATIONS}`)
        .then(data => {
          console.log("locationform submitobjectwithgeo data: ", data)

          this.setState({redirect: `${MODELS.LOCATIONS}`})
        }).catch(err => {
          console.error("error in submitobjectwithgeo in locationform: ", err)
        });
    })
  };

  handleChange = data => {
    //start marking form as dirty only when the user makes changes.  This property is case sensitive.
    //console.log("handlechange data: ", data)
    if (data && data.timeStamp){
      this.setState({isFormDirty: true})
    }
  }

  handleInput = event => {
    this.setState({ geoText: event.target.value });
  };

  mapTextToGeo = event => {
    //console.log('text to geo button pressed');
    let parseGeoText;
    const { record } = this.props

    const { geoText, mapFormKey} = this.state
    try {

      //organize features into a geoJSON object to see if it is valid geoJSON.
      const geoObject = {
        "geojson": {
          "type": "FeatureCollection",
          "features": JSON.parse(geoText)
        },
        "content_type": "location",
      }

      if (record && record.id){
        geoObject.object_id = record.id
      }
      if (record && record.geo && record.geo.id){
        geoObject.id = record.geo.id
      }

      parseGeoText = JSON.parse(JSON.stringify(geoObject));

      if (parseGeoText && GJV.valid(geoObject.geojson)){
        this.setState({ geo: geoObject }, this.setState({mapFormKey: mapFormKey + 1}));
      }
      else{
        console.error("Invalid geoJSON provided to form - If there's a plugin that identifies the mistake in-page, please insert it here.")
        //toastErrors("Invalid JSON given to Text Entry Field")
        alert(`Invalid geoJSON provided.  Check out a site like http://geojsonlint.com/ to find the error.  GeoJSON:${JSON.stringify(parseGeoText.geojson)}`)
      }

    } catch (e) {
      toastErrors("Invalid JSON given to Text Entry: ", e)
      console.error("e in try catch geoObject failure is: ", e)
    }
  };

  render() {
    const { staticContext, id, classes, record, mode, ...rest } = this.props;
    const { geo, showMap } = this.state;

    return (
      <SimpleForm
        save={this.handleSubmit}
        name={`locationForm`}
        onChange={this.handleChange}
        toolbar={null}
        {...rest}

      >
        <Typography className={classes.titleText}>{record && Object.keys(record).length > 0 ? `Updating ${record && record.display_name ? record.display_name : ""}` : `Creating Location`}</Typography>
        <TextInput
          label={'en.models.locations.display_name'}
          source={MODEL_FIELDS.DISPLAY_NAME}
          defaultValue={record ? record.display_name : ""}
        />
        <TextInput
          label={'en.models.locations.host_name'}
          source={MODEL_FIELDS.HOST_NAME}
          validate={validateHostname}
          defaultValue={record.host_name || "osf.io"}
        />
        <ReferenceInput
          label={'en.models.locations.type'}
          resource={MODELS.LOCATIONTYPES}
          source={MODEL_FK_FIELDS.LOCATION_TYPE}
          reference={MODELS.LOCATIONTYPES}
          validate={validateLocationType}
          required
          defaultValue={record && Object.keys(record).length > 0 ? record.location_type : LOCATIONTYPE_OSF}
        >
          <TranslationSelect optionText={MODEL_FIELDS.LABEL} />
        </ReferenceInput>
        <FormDataConsumer>
          {formDataProps => {

            const {formData} = formDataProps

            let projList = []

            if (formData.projects && formData.projects.length > 0){
              projList = formData.projects
            }
            else if (record.projects && record.projects.length > 0){
              projList = record.projects
            }
              return(<ReferenceArrayInput
                resource={MODELS.PROJECTS}
                label={"en.models.locations.projects"}
                className={classes.projectList}
                source={MODEL_FIELDS.PROJECTS}
                reference={MODELS.PROJECTS}
                required>
                <SelectArrayInput 
                  defaultValue={projList}
                  optionText={MODEL_FIELDS.NAME} />
              </ReferenceArrayInput>)
            }
          }
        </FormDataConsumer>

        <TextInput
          label={'en.models.locations.globus_endpoint'}
          source={MODEL_FIELDS.GLOBUS_ENDPOINT}
          validate={validateGlobusEndpoint}
          defaultValue={record && record.globus_endpoint}
        />
        <TextInput
          label={'en.models.locations.globus_path'}
          source={MODEL_FIELDS.GLOBUS_PATH}
          defaultValue={record && record.globus_path}
          multiline
        />
        <TextInput label={"en.models.locations.osf_project"} source={MODEL_FIELDS.OSF_PROJECT} defaultValue={record ? record.osf_project : ""} />
        <TextInput
          label={'en.models.locations.portal_url'}
          source={MODEL_FIELDS.PORTAL_URL}
          defaultValue={record ? record.portal_url : ""}
          multiline
        />
        <TextInput label={'en.models.locations.notes'} multiline source={MODEL_FIELDS.NOTES}
        defaultValue={record ? record.notes : ""} />
        <div className={classes.preMapArea}>
          <Button variant={"outlined"} color={showMap ? "secondary" : "primary"} onClick={() => this.setState({showMap: !showMap})}>{showMap ? `Hide Map Form` : `Show Map Form`}</Button>
        </div>
        {showMap && 
          <MapForm
            content_type={MODEL_FK_FIELDS.LOCATION}
            recordGeo={geo}
            id={id}
            geoDataCallback={this.geoDataCallback}
          />
        }
        {this.state.redirect && <Redirect to={this.state.redirect} /> }
        <FormDataConsumer>
        {formDataProps => {
          const {formData} = formDataProps
        return( <div className={classes.fakeToolbar}>
          <Button variant={"contained"} color={"primary"} startIcon={<SaveIcon/>} onClick={() => this.handleSubmit(formData)}>{`SAVE`}</Button>
          {this.props.id && <CustomDeleteButton setRedirect={() => this.setState({redirect: `/${MODELS.LOCATIONS}` })} resource={MODELS.LOCATIONS} id={this.props.id} /> } 
        </div>)
        }
      }
        </FormDataConsumer>

      </SimpleForm>
    );
  }
}

const enhance = compose(withStyles(styles));
export default enhance(LocationForm);
