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
import { submitObjectWithGeo, toastErrors } from '../_tools/funcs';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import { withStyles } from '@material-ui/styles';
import { FormDataConsumer } from 'ra-core';
import { SelectArrayInput } from 'ra-ui-materialui/lib/input';
import { Typography, Button } from '@material-ui/core';
import { DefaultToolbar } from '../_components';
import { Redirect } from 'react-router';

const validateHostname = required('en.validate.locations.host_name');
const validateLocationType = required('en.validate.locations.location_type');
const validateGlobusEndpoint = regex(
  /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{8}/,
  'en.validate.locations.globus_endpoint'
);
const GJV = require("geojson-validation")

const styles = {
  geoTextArea: {
    display: 'flex',
    flexDirection: 'column',
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

    if (this.props.record && this.props.record.id){
      data.id = this.props.record.id
    }
    this.setState({isFormDirty: false}, () => {
        submitObjectWithGeo(data, geo, this.props, data.location_type === LOCATIONTYPE_OSF ? `/${MODELS.AGENTS}/create` : `/${MODELS.LOCATIONS}`)
        .then(data => {
          //console.log("locationform submitobjectwithgeo data: ", data)

          this.setState({redirect: "/locations"})
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
    const { staticContext, id, classes, record, mode, basePath, ...rest } = this.props;
    const { geo, showMap } = this.state;

    return (
      <SimpleForm
        {...rest}
        save={this.handleSubmit}
        name={`locationForm`}
        onChange={this.handleChange}
        toolbar={this.props.record && <DefaultToolbar />} 
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
          defaultValue={record && Object.keys(record).length > 0 ? record.location_type : LOCATIONTYPE_OSF}
        >
          <TranslationSelect optionText={MODEL_FIELDS.LABEL} />
        </ReferenceInput>
        <FormDataConsumer>
          {formDataProps => {

            //console.log("formDataProps in locform is: ", formDataProps)
            
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
              //console.log("translating projlist into a list: ", projList)
              const temp = []
              projList.map(item => {
                temp.push(item.id)
                return item
              })
              projList = temp
            }
            //console.log("projList being rendered: ", projList)
              return(<ReferenceArrayInput
                resource={"projects"}
                label={"en.models.locations.projects"}
                className={classes.projectList}
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
        <TextInput label={"en.models.locations.osf_project"} source="osf_project" defaultValue={record ? record.osf_project : ""} />
        <TextInput
          label={'en.models.locations.portal_url'}
          source="portal_url"
          defaultValue={record ? record.portal_url : ""}
          multiline
        />
        <TextInput label={'en.models.locations.notes'} multiline source={MODEL_FIELDS.NOTES}
        defaultValue={record ? record.notes : ""} />
        <div className={classes.preMapArea}>
          <Button variant="contained" color={showMap ? "secondary" : "primary"} onClick={() => this.setState({showMap: !showMap})}>{showMap ? `Hide Map Form` : `Show Map Form`}</Button>
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
      </SimpleForm>
    );
  }
}

const enhance = compose(withStyles(styles));
export default enhance(LocationForm);