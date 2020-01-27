//LocationForm.jsx
import React, { Component } from 'react';
import {
  TextInput,
  ReferenceInput,
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
import { Grid } from '@material-ui/core';
import { FormDataConsumer } from 'ra-core';
import LocationTitle from './LocationTitle';

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
  }

  componentDidMount() {
    const { geo } = this.state
    this.setState({ geoText: geo && geo.geojson ? JSON.stringify(geo.geojson.features, null, 2) : '[]' });
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
    this.setState({isFormDirty: false}, () => {
        submitObjectWithGeo(data, geo, this.props, data.location_type === LOCATIONTYPE_OSF ? `/${MODELS.AGENTS}/create` : `/${MODELS.LOCATIONS}`);
    })
    
  };

  handleChange = data => {
    //start marking form as dirty only when the user makes changes.  This property is case sensitive.
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
    //const {isformdirty, rest} = {...this.props}
    const { staticContext, id, ...rest } = this.props;
    const { isFormDirty, geo, mapFormKey } = this.state;
    return (
      <SimpleForm
        {...rest}
        save={this.handleSubmit}
        name={`locationForm`}
        //TODO: there is definitely a better way to do this - I just can't figure it out.  Any HOC using redux-form `isDirty` seems to fail.
        onChange={this.handleChange}
      >
      <FormDataConsumer>
      {({formData, ...rest}) => 
      {
        return(
          <Grid container>
            {formData && formData.display_name ? <LocationTitle record={formData} prefix={"Updating"} /> : <LocationTitle prefix={"Creating Location"} />}

            <Grid item xs={12}>
              <TextInput
                label={'en.models.locations.display_name'}
                source={MODEL_FIELDS.DISPLAY_NAME}
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput
                label={'en.models.locations.host_name'}
                source={MODEL_FIELDS.HOST_NAME}
                validate={validateHostname}
                defaultValue={formData && formData.location_type && formData.location_type === LOCATIONTYPE_OSF ? "osf.io" : ""}
              />
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <>
              <Grid item xs={12}>
                <TextInput
                  label={'en.models.locations.globus_endpoint'}
                  source="globus_endpoint"
                  validate={validateGlobusEndpoint}
                />
              </Grid>
              <Grid item xs={12}>
                <TextInput
                  label={'en.models.locations.globus_path'}
                  source="globus_path"
                />
              </Grid>
            </>
            {formData && formData.location_type && formData.location_type === LOCATIONTYPE_OSF &&
              <Grid item xs={12}>
                <TextInput label={"en.models.locations.osf_project"} source="osf_project" required />
              </Grid>
            }
            <Grid item xs={12}>
              <TextInput
                label={'en.models.locations.portal_url'}
                source="portal_url"
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput label={'en.models.locations.notes'} source={MODEL_FIELDS.NOTES} />
            </Grid>

            <Grid item xs={12} key={mapFormKey}>
              <MapForm
                content_type={MODEL_FK_FIELDS.LOCATION}
                recordGeo={geo}
                id={id}
                geoDataCallback={this.geoDataCallback}
              />
            </Grid>
          
          </Grid>
        )
      }
      }
      </FormDataConsumer>

        <Prompt when={isFormDirty} message={WARNINGS.UNSAVED_CHANGES}/>
      </SimpleForm>
    );
  }
}

const enhance = compose(withStyles(styles));
export default enhance(LocationForm);