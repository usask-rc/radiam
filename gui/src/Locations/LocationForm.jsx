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
import {LOCATIONTYPE_OSF, MODELS, MODEL_FIELDS, MODEL_FK_FIELDS, WARNINGS} from '../_constants/index';
import MapForm from '../_components/_forms/MapForm';
import { Prompt } from 'react-router';
import { submitObjectWithGeo, toastErrors } from '../_tools/funcs';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import { withStyles } from '@material-ui/styles';
import { FormDataConsumer } from 'ra-core';
import LocationTitle from './LocationTitle';
import TranslationSelectArray from "../_components/_fields/TranslationSelectArray";
import { SelectArrayInput } from 'ra-ui-materialui/lib/input';
import { Typography } from '@material-ui/core';
import { DefaultToolbar } from '../_components';

const validateHostname = required('en.validate.locations.host_name');
const validateLocationType = required('en.validate.locations.location_type');
const validateGlobusEndpoint = regex(
  /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{8}/,
  'en.validate.locations.globus_endpoint'
);
const GJV = require("geojson-validation")

const styles = {
  mapPopup: {
    width: '400px',
  },
  geoTextArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleText: {
    fontSize: "2em",
    width: 'inherit',
  }
};

class LocationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      geo: props.record.geo,
      geoText: '',
      isFormDirty: false,
      mapFormKey: 0,
      jsonTextFormKey: 1000,
    };
    if (props.record && props.record.projects){
      props.record.projects = this.fixProjectList(props.record.projects)
    }

    console.log("props.record.projects in locationform is: ", props.record.projects)
  }

  componentDidMount() {
    const { geo } = this.state
    this.setState({ geoText: geo && geo.geojson ? JSON.stringify(geo.geojson.features, null, 2) : '[]' });

  }

  fixProjectList(projects) {
    const projList = []

    projects.map(project => {
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
      projList.push({id: project})
      return project
    })
    data.projects = projList
    this.setState({isFormDirty: false}, () => {
        submitObjectWithGeo(data, geo, this.props, data.location_type === LOCATIONTYPE_OSF ? `/${MODELS.AGENTS}/create` : `/${MODELS.LOCATIONS}`);
    })
    
  };

  handleChange = data => {
    //start marking form as dirty only when the user makes changes.  This property is case sensitive.
    console.log("handlechange data: ", data)
    if (data && data.timeStamp){
    this.setState({isFormDirty: true})
    }
  }

  handleInput = event => {
    this.setState({ geoText: event.target.value });
  };

  mapTextToGeo = event => {
    console.log('text to geo button pressed');
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
        //check for unsupported types - Multi____

        //TODO: the belong code doesn't belong on the text validator, it belongs on the map prior to a display attempt.
        //1. parse for validity (already done by this point)
        //2.  send to the map display for processing
          //a. Update State
          //b. Modify Key to force a refresh
          //c. Map Values are now imported.  Scan them for these irregularities.
        //3.  display alert
        //4.  check to ensure data still exists in map when exported.
        /*
        parseGeoText.geojson.features.map(feature => {
          const type = feature.geometry.type
          //TODO:could just do a splice on the first 5 letters honestly
          if (type === "MultiPolygon" || type === "MultiPoint" || type === "MultiLineString"){

          }
        })*/

        //TODO: non-feature values should not be in the text form.
        this.setState({ geo: geoObject }, this.setState({mapFormKey: mapFormKey + 1}));
      }
      else{
        console.log("Invalid geoJSON provided to form - If there's a plugin that identifies the mistake in-page, please insert it here.")
        //toastErrors("Invalid JSON given to Text Entry Field")
        alert(`Invalid geoJSON provided.  Check out a site like http://geojsonlint.com/ to find the error.  GeoJSON:${JSON.stringify(parseGeoText.geojson)}`)
      }

    } catch (e) {
      toastErrors("Invalid JSON given to Text Entry: ", e)
      console.log("e in try catch geoObject failure is: ", e)
    }
  };

  render() {
    const { staticContext, id, classes, record, mode, ...rest } = this.props;
    const { isFormDirty, geo, mapFormKey } = this.state;


    return (
      <SimpleForm
        {...rest}
        save={this.handleSubmit}
        name={`locationForm`}
        toolbar={this.props.record && <DefaultToolbar {...this.props}/> }
        //TODO: there is definitely a better way to do this - I just can't figure it out.  Any HOC using redux-form `isDirty` seems to fail.
        onChange={this.handleChange}
      >
        <Typography className={classes.titleText}>{record && record.length > 0 ? `Updating ${record && record.display_name ? record.display_name : ""}` : `Creating Location`}</Typography>
        <TextInput
          label={'en.models.locations.display_name'}
          source={MODEL_FIELDS.DISPLAY_NAME}
          defaultValue={record ? record.display_name : ""}
        />
        <TextInput
          label={'en.models.locations.host_name'}
          source={MODEL_FIELDS.HOST_NAME}
          validate={validateHostname}
          defaultValue={record && record.length > 0 ? record.host_name : "osf.io"}
        />
        <ReferenceInput
          label={'en.models.locations.type'}
          resource={MODELS.LOCATIONTYPES}
          source={MODEL_FK_FIELDS.LOCATION_TYPE}
          reference={MODELS.LOCATIONTYPES}
          validate={validateLocationType}
          defaultValue={LOCATIONTYPE_OSF}
        >
          <TranslationSelect optionText={MODEL_FIELDS.LABEL} />
        </ReferenceInput>
        <FormDataConsumer>
        {formDataProps => {

          console.log("formDataProps in locform is: ", formDataProps)
          
          const {formData} = formDataProps

          let projList = []

          if (formData.projects && formData.projects.length > 0){
            projList = formData.projects
          }
          else if (record.projects && record.projects.length > 0){
            projList = record.projects
          }

          //somehow still need to translate this shit
          if (projList && projList.length > 0 && typeof projList[0] === 'object'  ){
            console.log("translating projlist into a list: ", projList)
            const temp = []
            projList.map(item => {
              temp.push(item.id)
            })
            projList = temp
          }
          console.log("projList being rendered: ", projList)
            return(<ReferenceArrayInput
              resource={"projects"}
              className="input-medium"
              label={"en.models.locations.projects"}
              source={"projects"}
              reference={"projects"}
              required>
              <SelectArrayInput 
              defaultValue={projList}
              optionText="name" />
            </ReferenceArrayInput>)
          }
        }
        </FormDataConsumer>

        <TextInput
          label={'en.models.locations.globus_endpoint'}
          source="globus_endpoint"
          validate={validateGlobusEndpoint}
          defaultValue={record && record.globus_endpoint}
        />
        <TextInput
          label={'en.models.locations.globus_path'}
          source="globus_path"
          defaultValue={record && record.globus_path}
          multiline
        />
        <TextInput label={"en.models.locations.osf_project"} source="osf_project" defaultValue={record && record.osf_project || ""} required />

        <TextInput
          label={'en.models.locations.portal_url'}
          source="portal_url"
          defaultValue={record && record.portal_url || ""}
          multiline
        />
        <TextInput label={'en.models.locations.notes'} multiline source={MODEL_FIELDS.NOTES}
        defaultValue={record && record.notes || ""} />

        <MapForm
          content_type={MODEL_FK_FIELDS.LOCATION}
          recordGeo={geo}
          id={id}
          geoDataCallback={this.geoDataCallback}
        />
      </SimpleForm>
    );
  }
}

const enhance = compose(withStyles(styles));
export default enhance(LocationForm);