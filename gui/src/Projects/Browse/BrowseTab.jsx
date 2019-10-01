import React, { useState, useEffect } from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { GET_LIST, translate } from 'react-admin';
import { radiamRestProvider, getAPIEndpoint, httpClient } from '../../_tools';
import Constants from '../../_constants/index';
import FolderView from './FolderView';

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

  const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

  //TODO: this will be invalidated once the data for 'root folder' exists.
  //instead of this, lets just do a prefix scan for the smallest prefix in path. for now.  Whatever has the smallest prefix is the root.
  useEffect(() => {
    //get root if filepath is None.
    //we need some way to get a list of root-level folders without querying the entire set of files at /search.  this does not yet exist and is required before this element can be implemented.
    const params = {
      pagination: { page: 1, perPage: 1000 }, //TODO: this needs some sort of expandable pagination control for many files in a folder.
      sort: { field: 'last_modified', order: 'ASC' },
    };

    const fetchData = async () => {
      await dataProvider(
        GET_LIST,
        Constants.models.PROJECTS + '/' + projectID + '/search',
        params
      )
        .then(response => {

          let rootList = {}

          response.data.map(file => {
            //new location that we haven't seen yet.  Add it to the dictionary.
            if (typeof file.location !== "undefined") {
              if (!rootList || !rootList[file.location]) {
                rootList[file.location] = file.path_parent;

              }
              //we've seen this location before.  Compare for the shorter string.
              else {
                //take the smaller value of the two.  They must share a parent path as they are in the same location.

                if (rootList[file.location].length > file.path_parent) {
                  rootList[file.location] = file.path_parent
                }
              }
            }
            else {
              console.error("file has no location: ", file)
            }
            return file;
          })

          let rootPaths = []

          //create dummy root folder items.
          for (var key in rootList) {
            rootPaths.push({ id: `${key}${rootList[key]}`, key: `${key}${rootList[key]}`, path_parent: rootList[key], path: rootList[key] })
          }
          setListOfRootPaths(rootPaths)
          setStatus({ loading: false });

        })
        .catch(error => {
          setStatus({ loading: false, error: error });
        });
    };
    fetchData();
  }, []);

  return (
    <div className={classes.main}>
      {status && status.loading ? (
        <Typography>{`Loading File Data...`}</Typography>
      ) : !status.error && listOfRootPaths && listOfRootPaths.length > 0 ?
          listOfRootPaths.map(item => {
            return <FolderView
              expanded={true}
              item={item}
              projectID={projectID}
              key={item.key}
              classes={classes}
            />
          }
          )
          : (
            <Typography>{`Error loading File Data.  Please Refresh the page and try again.`}</Typography>
          )}
    </div>
  );
}

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(BrowseTab);
