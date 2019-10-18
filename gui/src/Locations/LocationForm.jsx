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
import { submitObjectWithGeo } from '../_tools/funcs';
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


const styles = {
  mapPopup: {
    width: '400px',
  },
  geoTextArea: {
    display: 'flex',
    flexDirection: "column",
  }
};

class LocationForm extends Component {
  constructor(props) {
    super(props);
    this.state = { geo: this.props.record.geo, geoText: "", isFormDirty: false };
  }

  componentDidMount(){
    this.setState({geoText: JSON.stringify(this.state.geo, null, 2)})
  }

  geoDataCallback = geo => {
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
        <Grid xs={12}>
        <MapForm
          content_type={Constants.model_fk_fields.LOCATION}
          recordGeo={this.state.geo}
          id={this.props.id}
          geoDataCallback={this.geoDataCallback}
        />
        </Grid>
        <Grid xs={12}>
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
export default enhance(LocationForm)
