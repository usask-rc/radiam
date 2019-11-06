//BrowseTab.jsx
import React, { useState, useEffect } from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { translate } from 'react-admin';
import FolderView from './FolderView';
import { getRootPaths } from '../../_tools/funcs';

const styles = theme => ({
  main: {
    flex: '1',
    marginRight: '2em',
    textAlign: 'right',
  },
});

function BrowseTab({ projectID, classes }) {
  const [status, setStatus] = useState({ loading: true, error: false });
  const [listOfRootPaths, setListOfRootPaths] = useState([])

  let _isMounted = false
  useEffect(() => {

    _isMounted = true
    
    getRootPaths(projectID).then(data => {
      if (_isMounted){      
        setListOfRootPaths(data)
        setStatus({loading: false})
      }
      return data
    }).catch(err => {
      setStatus({ loading: false, error: err })
      console.error(err)
    })

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [projectID]);

  return (
    <div className={classes.main}>
    {status && status.error ? 
      <Typography>{`Error loading File Data.  Please Refresh the page and try again.`}</Typography>
      : status && status.loading ? (
        <Typography>{`Loading File Data...`}</Typography>
      ) : listOfRootPaths && listOfRootPaths.length > 0 &&
          listOfRootPaths.map(item => {
            return <FolderView
              expanded={"true"}
              item={item}
              projectID={projectID}
              key={item.key}
              classes={classes}
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
