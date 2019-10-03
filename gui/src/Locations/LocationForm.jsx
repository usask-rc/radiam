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
import {Field} from "redux-form";
import MapForm from '../_components/_forms/MapForm';
import { Prompt } from 'react-router';
import { submitObjectWithGeo } from '../_tools/funcs';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import { withStyles } from '@material-ui/styles';
import { TextField, Divider, Button } from '@material-ui/core';

const validateHostname = required('en.validate.locations.host_name');
const validateLocationType = required('en.validate.locations.location_type');
const validateGlobusEndpoint = regex(
  /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{8}/,
  'en.validate.locations.globus_endpoint'
);


const styles = {
  mapPopup: {
    width: '400px',
  },
};

class LocationForm extends Component {
  constructor(props) {
    super(props);
    this.state = { geo: this.props.record.geo, geoText: "", isFormDirty: false };
    this.geoDataCallback = this.geoDataCallback.bind(this);
  }

  componentDidMount(){
    this.setState({geoText: JSON.stringify(this.state.geo, null, 2)})
  }

  geoDataCallback(geo) {
    if (geo && Object.keys(geo).length > 0) {
      this.setState({ geo: geo });
    } else {
      //this will likely have to be changed
      this.setState({ geo: {} });
    }

    //mark as dirty if prop value does not equal state value.  If they're equal, leave isDirty as is.
    if (this.state.geo !== this.props.record.geo){
        this.setState({isFormDirty: true})
    }
  }

  //this is necessary instead of using the default react-admin save because there is no RA form that supports geoJSON
  handleSubmit = data => {
      this.setState({isFormDirty: false}, () => {
        submitObjectWithGeo(data, this.state.geo, this.props);
      })
  };

  handleChange = data => {
    this.setState({isFormDirty: true})
  }

  handleInput = event => {
    console.log("event.t.v in handleinput is: ", event.target.value)

    this.setState({geoText: event.target.value})
  }

  mapTextToGeo = event => {
    console.log("text to geo button pressed")
    let parseGeoText
    try {
      parseGeoText = JSON.parse(this.state.geoText)
      console.log("parsegeotext: ", parseGeoText)

      //remove values we cant put on the map and warn the user they won't display properly.
      //write it to geo
      this.setState({geo: parseGeoText})

    }
    catch(e){
      alert(e)
    }
    //check for difference between text and map
    //check for valid geoJSON
    //if valid geoJSON, send it to the map to be populated, EXCEPT any values that cannot be shown (multiline, multipoint, multipolygon).App
    //if not valid, indicate to the user this fact - maybe make the geotext field red?
  }

  render() {
      //const {isformdirty, rest} = {...this.props}
      const { staticContext, ...rest } = this.props;
      const { isFormDirty } = this.state
    return (
      <SimpleForm
        {...rest}
        redirect={Constants.resource_operations.LIST}
        save={this.handleSubmit}
        name={`locationForm`}
        //TODO: there is definitely a better way to do this - I just can't figure it out.  Any HOC using redux-form `isDirty` seems to fail.
        onChange={this.handleChange}
      >
        <TextInput
          label={'en.models.locations.display_name'}
          source={Constants.model_fields.DISPLAY_NAME}
        />
        <TextInput
          label={'en.models.locations.host_name'}
          source={Constants.model_fields.HOST_NAME}
          validate={validateHostname}
        />
        <ReferenceInput
          label={'en.models.locations.type'}
          source={Constants.model_fk_fields.LOCATION_TYPE}
          reference={Constants.models.LOCATIONTYPES}
          validate={validateLocationType}
        >
          <TranslationSelect optionText={Constants.model_fields.LABEL} />
        </ReferenceInput>
        <TextInput
          label={'en.models.locations.globus_endpoint'}
          source="globus_endpoint"
          validate={validateGlobusEndpoint}
        />
        <LongTextInput
          label={'en.models.locations.globus_path'}
          source="globus_path"
        />
        <TextInput label={"en.models.locations.osf_project"} source="osf_project" />
        <LongTextInput
          label={'en.models.locations.portal_url'}
          source="portal_url"
        />
        <LongTextInput label={'en.models.locations.notes'} source="notes" />
        <MapForm
          content_type={'location'}
          recordGeo={this.state.geo}
          id={this.props.id}
          geoDataCallback={this.geoDataCallback}
        />
        <TextField name="geoText" fullWidth label={'en.models.locations.geo'} value={this.state.geoText} placeholder='geoJSON' multiline={true} onChange={this.handleInput} />
        <Button name="mapTextToGeo" label={'en.models.locations.text_to_geo'} onClick={this.mapTextToGeo}>{`Convert geoJSON to Map`}</Button>
        <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
      </SimpleForm>
    );
  }
}

const enhance = compose(withStyles(styles));
export default enhance(LocationForm)
