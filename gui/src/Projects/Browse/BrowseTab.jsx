//BrowseTab.jsx
import React, { useState, useEffect } from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { translate, ReferenceField, TextField, } from 'react-admin';
import FolderView from './FolderView';
import { getRootPaths, getProjectData, getAllProjectData } from '../../_tools/funcs';
import { LocationShow } from '../../_components/_fields/LocationShow';
import { MODELS, MODEL_FK_FIELDS, RESOURCE_OPERATIONS } from "../../_constants/index"
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

  useEffect(() => {
    let _isMounted = true
    setStatus({loading: true})

    getAllProjectData(projectID).then(data => {
      console.log("getallprojectdata: ", data)
    })

    getRootPaths(projectID, dataType).then(data => {
      if (data.length === 0){
        //there are no folders to get a root path off of.  We have to get it off of a file instead.  we only need 1 file.
        const params = {
          id: projectID,
          pagination: { page: 1, perPage: 1 },
          type: "file",
        };

        getProjectData(params, dataType=dataType).then(data => {

          if (data && data.files && data.files.length > 0){ //else there are no project files
          let folderItem = { 
            id: `${data.files[0].id}`, 
            key: `${data.files[0].key}`, 
            path_parent: data.files[0].path_parent, 
            path: data.files[0].path,
            location: data.files[0].location
          }

          setListOfRootPaths([folderItem])
          setStatus({loading: false, error: false})
          }
          else{
            setStatus({loading: false, error: "No files were found"})
          }
        })
      }
      else{
        if (_isMounted){ 
          console.log("getrootpaths in browsetab retrieves data: ", data)

          setListOfRootPaths(data)
          setStatus({loading: false, error: false})
        }
        return data
      }
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
                <Typography className={classes.globusIDDisplayLabel}>{`Globus ID: `}</Typography>
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
                  <TextField source={"globus_endpoint"} />
                </ReferenceField>
              </div>
              <div className={classes.globusPathDisplay}>
              <Typography className={classes.globusPathDisplayLabel}>{`Globus Path: `}</Typography>
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
                  <TextField source={"globus_path"} />
                </ReferenceField>
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
