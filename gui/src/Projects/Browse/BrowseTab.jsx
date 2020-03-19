//BrowseTab.jsx
import React, { useState, useEffect } from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { translate, ReferenceField, TextField, useQuery, Loading, Error } from 'react-admin';
import FolderView from './FolderView';
import { getRootPaths, getProjectData, getLocationData } from '../../_tools/funcs';
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
  globusIDDisplay: {
    display: "flex",
    marginLeft: "1em",
  },
  globusIDDisplayLabel: {
    marginRight: "1em",
  },
  globusPathDisplay: {
    display: "flex",
    marginLeft: "1em",
  },
  globusPathDisplayLabel: {
    marginRight: "1em",
  },
});

function BrowseTab({ projectID, classes, translate, dataType="projects", projectName, ...props }) {
  const [status, setStatus] = useState({ loading: false, error: false });
  const [listOfRootPaths, setListOfRootPaths] = useState([])
  const [locationDetails, setLocationDetails] = useState(null)

  useEffect(() => {
    let _isMounted = true
    setStatus({loading: true})

    getRootPaths(projectID, dataType).then(data => {
        if (_isMounted){ 
          console.log("getrootpaths in browsetab retrieves data: ", data)

          setListOfRootPaths(data)
          setStatus({loading: false, error: false})
        }
        return data
    }).catch(err => {
      setStatus({ loading: false, error: err })
    })

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [projectID]);

  console.log("browsetab rendering")
  return (
    <div className={classes.main}>
    {status.loading ? <Typography className={classes.loading}>{`Loading...`}</Typography> :
    !status.loading && status.error ? 
      <Typography className={classes.loading}>{`${status.error}`}</Typography>
      
      : listOfRootPaths.length > 0 &&
        listOfRootPaths.map(item => {
          console.log("listofrootpaths item: ", item)
          let globus_path = "path"
          let globus_endpoint = null
          item.locationpromise.then( data => {
              console.log("***** PROMISE DONE ***** Endpoint is: " + data.globus_endpoint)
              globus_endpoint = data.globus_endpoint
            }
          )

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
              <div className={classes.globusIDDisplay}>
                <Typography className={classes.globusIDDisplayLabel}>{translate('en.models.locations.globus_link_label')}:</Typography>
                <Typography className={classes.link} component="a"
                  href={`${LINKS.GLOBUSWEBAPP}?origin_id=${globus_endpoint}&origin_path=${globus_path}`} 
                  target="_blank" rel="noopener noreferrer">
                    {`${globus_endpoint}`}
                </Typography>
              </div>
          </div>

          <FolderView
            expanded={"true"}
            item={item}
            projectName={projectName}
            projectID={projectID}
            key={`${item.location}_folderView`}
            dataType={dataType}
            projectLocation={item.location}
            groupID={props.record.group || null}
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
