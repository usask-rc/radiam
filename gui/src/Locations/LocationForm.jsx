//LocationForm.jsx
import React, { Component } from 'react';
import {
  LongTextInput,
  ReferenceInput,
  regex,
  required,
  SimpleForm,
  TextInput,
} from 'react-admin';

import { compose } from 'recompose';
import * as Constants from '../_constants/index';
import MapForm from '../_components/_forms/MapForm';
import { Prompt } from 'react-router';
import { submitObjectWithGeo, toastErrors } from '../_tools/funcs';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import { withStyles } from '@material-ui/styles';
import { TextField, Button, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, Grid } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { FormDataConsumer } from 'ra-core';

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
      geo: this.props.record.geo,
      geoText: '',
      isFormDirty: false,
      mapFormKey: 0,
      jsonTextFormKey: 1000,
    };
  }

  componentDidMount() {
    this.setState({ geoText: this.state.geo && this.state.geo.geojson ? JSON.stringify(this.state.geo.geojson.features, null, 2) : '[]' });
  }

  geoDataCallback = geo => {
    if (geo && Object.keys(geo).length > 0) {
      this.setState({ geo: geo }, () => this.setState({geoText: JSON.stringify(geo.geojson.features, null, 2)}, () => this.setState({jsonTextFormKey: this.state.jsonTextFormKey + 1})));
    } else {
      //this will likely have to be changed
      this.setState({ geo: {} });
    }

    //mark as dirty if prop value does not equal state value.  If they're equal, leave isDirty as is.
    if (this.state.geo !== this.props.record.geo) {
      this.setState({ isFormDirty: true });
    }
  };

  //this is necessary instead of using the default react-admin save because there is no RA form that supports geoJSON
  handleSubmit = (data) => {
    console.log("data in handlesubmit locform is: ", data)
    
    this.setState({isFormDirty: false}, () => {
        submitObjectWithGeo(data, this.state.geo, this.props, data.location_type === Constants.LOCATIONTYPE_OSF ? `/${Constants.models.AGENTS}/create` : `/${Constants.models.LOCATIONS}`);
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
    try {

      //TODO: this isnt parsing geotext, it's parsing features.

      /**
       *{
  "id": "97313af3-ac52-4b12-afdb-4a0307bb58e2",
  "geojson": {
    "type": "FeatureCollection",
    "features": []
  },
  "object_id": "e950313e-faf0-47aa-ac35-5294857c1486",
  "content_type": "location"
} 
       */


       //organize features into a geoJSON object to see if it is valid geoJSON.
      const geoObject = {
        "geojson": {
          "type": "FeatureCollection",
          "features": JSON.parse(this.state.geoText)
        },
        "content_type": "location",
      }

      if (this.props.record && this.props.record.id){
        geoObject.object_id = this.props.record.id
      }
      if (this.props.record && this.props.record.geo && this.props.record.geo.id){
        geoObject.id = this.props.record.geo.id
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
        this.setState({ geo: geoObject }, this.setState({mapFormKey: this.state.mapFormKey + 1}));
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
    //check for difference between text and map
    //check for valid geoJSON
    //if valid geoJSON, send it to the map to be populated, EXCEPT any values that cannot be shown (multiline, multipoint, multipolygon).App
    //if not valid, indicate to the user this fact - maybe make the geotext field red?
  };

  render() {
    //const {isformdirty, rest} = {...this.props}
    const { staticContext, ...rest } = this.props;
    const { isFormDirty } = this.state;
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
          <Grid xs={12}>
        <TextInput
          label={'en.models.locations.display_name'}
          source={Constants.model_fields.DISPLAY_NAME}
        />
        </Grid>
        <Grid xs={12}>
        <TextInput
          label={'en.models.locations.host_name'}
          source={Constants.model_fields.HOST_NAME}
          validate={validateHostname}
          defaultValue={formData && formData.location_type && formData.location_type === Constants.LOCATIONTYPE_OSF ? "osf.io" : ""}
        />
        </Grid>
        <Grid xs={12}>
        <ReferenceInput
          label={'en.models.locations.type'}
          source={Constants.model_fk_fields.LOCATION_TYPE}
          reference={Constants.models.LOCATIONTYPES}
          validate={validateLocationType}
          defaultValue={Constants.LOCATIONTYPE_OSF}
        >
          <TranslationSelect optionText={Constants.model_fields.LABEL} />
        </ReferenceInput>
        </Grid>
        <React.Fragment>
          <Grid xs={12}>
            <TextInput
              label={'en.models.locations.globus_endpoint'}
              source="globus_endpoint"
              validate={validateGlobusEndpoint}
            />
          </Grid>
          <Grid xs={12}>
            <LongTextInput
              label={'en.models.locations.globus_path'}
              source="globus_path"
            />
          </Grid>
        </React.Fragment>
        {formData && formData.location_type && formData.location_type === Constants.LOCATIONTYPE_OSF &&
        <Grid xs={12}>
          <TextInput label={"en.models.locations.osf_project"} source="osf_project" required />
        </Grid>
        }
        <Grid xs={12}>
        <LongTextInput
          label={'en.models.locations.portal_url'}
          source="portal_url"
        />
        </Grid>
        <Grid xs={12}>
        <LongTextInput label={'en.models.locations.notes'} source={Constants.model_fields.NOTES} />
        </Grid>
        <Grid xs={12} key={this.state.mapFormKey}>
        <MapForm
          content_type={Constants.model_fk_fields.LOCATION}
          recordGeo={this.state.geo}
          id={this.props.id}
          geoDataCallback={this.geoDataCallback}
        />
        </Grid>
        
        </Grid>
        )
      }
      }
      </FormDataConsumer>

        <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
      </SimpleForm>
    );
  }
}

const enhance = compose(withStyles(styles));
export default enhance(LocationForm);


/**
 *  This is the geojson text form - it can be thrown into the form, but currently we're still figuring out the best way to implement this.
        <Grid xs={12} key={this.state.jsonTextFormKey}>
          <ExpansionPanel fullWidth>
            <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
              <Typography>{`Geo Text Entry - Experimental`}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={styles.geoTextArea}>
            <Grid container>
            <Grid item xs={12}>
              <TextField name="geoText" fullWidth label={'en.models.locations.geo'} value={this.state.geoText} placeholder='geoJSON' multiline={true} onChange={this.handleInput} />
              </Grid>
              <Grid item xs={12}>
              <Button name="mapTextToGeo" label={'en.models.locations.text_to_geo'} onClick={this.mapTextToGeo}>{`Convert geoJSON to Map`}</Button>
              </Grid>
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
 */