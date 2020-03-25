//BrowseTab.jsx
import React, { useState, useEffect, Component } from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { translate, ReferenceField } from 'react-admin';
import FolderView from './FolderView';
import { getRootPaths, getRootPaths_old, getLocationData } from '../../_tools/funcs';
import { LocationShow } from '../../_components/_fields/LocationShow';
import { MODELS, MODEL_FK_FIELDS, RESOURCE_OPERATIONS, LINKS } from "../../_constants/index"
import LocationOn from "@material-ui/icons/LocationOn"

const styles = theme => ({
  main: {
    flex: '1',
    marginRight: '2em',
    textAlign: 'right',
  },
  loading: {
    textAlign: 'left',
  },
  locationDisplay: {
    display: "flex",
    float: 'left',
  },
  locationIconLink: {    
    display: "flex",
  },
  locationLinkDisplay: {
    display: "flex",
    marginLeft: "1em",
  },
});

class LocationLinkout extends Component {
  // A component that accepts a Promise for later data rerendering, then shows the best link to where the data lives
  state = { data: null, error: null };

  componentDidMount() {
    this.translate = this.props.t;
    this.classes = this.props.c;
    this.props.promise
      .then(data => this.setState({ data: data }))
      .catch(error => this.setState({ error: error }));
  }

  render() {
    if (!this.state.data) { return null }
    if (this.state.data.globus_endpoint !== null && this.state.data.globus_endpoint !== "") {
      return (
        <div className={this.classes.locationDisplay}>
        <Typography className={this.classes.locationLinkDisplay}>{this.translate('en.models.locations.globus_link_label')}:</Typography>
        <Typography component="a" className={this.classes.locationLinkDisplay}
          href={`${LINKS.GLOBUSWEBAPP}?origin_id=${this.state.data.globus_endpoint}&origin_path=${this.state.data.globus_path}`} 
          target="_blank" rel="noopener noreferrer">
            {`${this.state.data.globus_endpoint}`}
        </Typography></div>
      );
    } else if (this.state.data.osf_project !== null && this.state.data.osf_project !== "") {
      return (
        <div className={this.classes.locationDisplay}>
        <Typography className={this.classes.locationLinkDisplay}>{this.translate('en.models.locations.osf_link_label')}:</Typography>
        <Typography component="a" className={this.classes.locationLinkDisplay}
          href={`${LINKS.OSFWEBAPP}/${this.state.data.osf_project}/`} 
          target="_blank" rel="noopener noreferrer">
            {`${this.state.data.osf_project}`}
        </Typography></div>
      );
    }else if (this.state.data.portal_url !== null && this.state.data.portal_url !== "") {
      return (
        <div className={this.classes.locationDisplay}>
        <Typography className={this.classes.locationLinkDisplay}>{this.translate('en.models.locations.portal_link_label')}:</Typography>
        <Typography component="a" className={this.classes.locationLinkDisplay}
          href={`${this.state.data.portal_url}`} 
          target="_blank" rel="noopener noreferrer">
            {`${this.state.data.portal_url}`}
        </Typography></div>
      );
    } else {
        return null
    }
  }
}

function BrowseTab({ projectID, datasetID, searchModel={}, classes, translate, dataType="projects", projectName, ...props }) {
  const [status, setStatus] = useState({ loading: false, error: false });
  const [listOfRootPaths, setListOfRootPaths] = useState([])

  useEffect(() => {
    let _isMounted = true
    setStatus({loading: true})

    if (dataType === "projects"){
      getRootPaths(projectID, dataType, searchModel).then(data => {
          if (_isMounted){ 
            setListOfRootPaths(data)
            setStatus({loading: false, error: false})
          }
          return data
      }).catch(err => {
        setStatus({ loading: false, error: err })
      })
    }
    else if (dataType === "datasets"){
      //TODO: check location and search model - if we have the data we need, use that info instead to get files.
      getRootPaths_old(datasetID, "datasets").then(data => {
        setListOfRootPaths(data)
        setStatus({loading: false, error: false})
      })
    }
    else{
      console.error("invalid model type given to browse tab")
    }

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [projectID, dataType]);

  //console.log("browsetab rendering")
  return (
    <div className={classes.main}>
    {status.loading ? <Typography className={classes.loading}>{`Loading...`}</Typography> :
    !status.loading && status.error ? 
      <Typography className={classes.loading}>{`${status.error}`}</Typography>
      
      : listOfRootPaths.length > 0 &&
        listOfRootPaths.map(item => {
          return (<div key={`${item.location}_div`}>
            <div className={classes.locationDisplay}>
              <div className={classes.locationIconLink}>
                <LocationOn />
                <ReferenceField
                  label={'en.models.agents.location'}
                  source={MODEL_FK_FIELDS.LOCATION}
                  reference={MODELS.LOCATIONS}
                  link={RESOURCE_OPERATIONS.SHOW}
                  basePath={`/${MODELS.LOCATIONS}`}
                  resource={MODELS.PROJECTS}
                  key={item.location}
                  record={item}
                >
                  <LocationShow />
                </ReferenceField>
              </div>
              <LocationLinkout key={item.location} promise={item.locationpromise} t={translate} c={classes} />
          </div>

          <FolderView
            expanded={"true"}
            item={item}
            projectName={projectName}
            projectID={projectID}
            datasetID={datasetID}
            key={`${item.location}_folderView`}
            dataType={dataType}
            projectLocation={item.location}
            groupID={props.record ? props.record.group : null}
          />
          </div>)
        }
      )
    }
    </div>
  );
}

const enhance = compose(
  withStyles(styles),
  translate
);


export default enhance(BrowseTab);
