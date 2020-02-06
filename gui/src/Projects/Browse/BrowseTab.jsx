//BrowseTab.jsx
import React, { useState, useEffect } from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { translate } from 'react-admin';
import FolderView from './FolderView';
import { getRootPaths, getProjectData } from '../../_tools/funcs';

const styles = theme => ({
  main: {
    flex: '1',
    marginRight: '2em',
    textAlign: 'right',
  },
  loading: {
    textAlign: 'left',
  },
});

function BrowseTab({ projectID, classes, translate, dataType="projects", projectName }) {
  const [status, setStatus] = useState({ loading: false, error: false });
  const [listOfRootPaths, setListOfRootPaths] = useState([])

  let _isMounted = false

  useEffect(() => {
    _isMounted = true
    setStatus({loading: true})
    
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
          return <FolderView
            expanded={"true"}
            item={item}
            projectName={projectName}
            projectID={projectID}
            key={item.key}
            dataType={dataType}
          />
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
