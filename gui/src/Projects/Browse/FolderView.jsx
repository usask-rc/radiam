import React, { useState, useEffect } from 'react';
import {
  AddLocation,
  FolderOpen,
} from '@material-ui/icons';
import { compose } from 'recompose';
import Constants from '../../_constants/index';
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
} from '@material-ui/core';
import FileSummary from '../../_components/files/FileSummary';
import FolderDisplay from './FolderDisplay';
import { getAPIEndpoint, httpClient,radiamRestProvider } from '../../_tools';
import { GET_LIST, translate } from 'ra-core';
import { LocationShow } from '../../_components/_fields/LocationShow';
import { ReferenceField } from 'ra-ui-materialui/lib/field';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  main: {
    flex: '1',
    marginRight: '2em',
    marginLeft: '5em',
    marginTop: '2em',
    textAlign: 'right',
  },
  baseFolderText: {
    fontWeight: 'bold',
    display: 'flex',
  },
  title: {
    fontSize: 16,
    fontDecoration: 'bold',
  },
  value: {
    padding: '0 16px',
    minHeight: 48,
    textAlign: 'right',
  },
  listItemText: {
    paddingRight: 0,
  },
  details: {
    flexDirection: 'column',
    textAlign: 'left',
  },
  buttonContainer: {
    textAlign: 'right',
  },
  sortSelect: {
    textAlign: 'right',
  },
  fileSummary: {
    paddingRight: '2em',
    marginRight: '20em',
  },
  folderIcon: {
    height: '1em',
    width: '1em',
    marginRight: '0.25em',
  },
  nestedFolderPanel: {
    backgroundColor: '#BEBEBE',
    width: 'inherit',
    marginRight: '1em',
    borderRadius: 3,
  },
  parentPanel: {
    textAlign: 'left',
  },
  locationDisplay: {
    margin: '0.25em',
    marginLeft: '0.75em',
  },
  smallDisplay: {
    textAlign: 'right',
    verticalAlign: 'middle',
  },
  folderContents: {
    display: 'flex',
  },
  folderContentsName: {
    textAlign: 'flex-start',
    fontSize: 16,
  },
  folderContentsCount: {
    textAlign: 'flex-end',
    verticalAlign: 'middle',
  },
  folderContentsGrid: {
    display: 'inline-block',
  },
  smallIcon: {},
});

const ReducedExpansionPanelDetails = withStyles(() => ({
  root: {
    width: '100%',
    margin: '0.4em',
    padding: '0.4em',
  },
}))(ExpansionPanelDetails);

const ReducedExpansionPanel = withStyles(() => ({
  root: {
    fontWeight: 'bold',
    width: '100%',
    marginLeft: '2em',
    border: '2px solid #87CEFA',
    borderRadius: 5,
  },
  expanded: {
    height: '80%',
  },
}))(ExpansionPanel);

function isFile(file) {
  if (file.type !== 'directory') {
    return true;
  }
  return false;
}

function FolderView({ projectID, item, classes, ...props }) {
  //the contents of `/search/{projectID}/search/?path_parent={itemPath}`
  const [files, setFiles] = useState([]);
  const [folderPath, setFolderPath] = useState(item.path);
  const [parentList, setParentList] = useState([item]);

  const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
  useEffect(() => {
    //TODO: we need some way to get a list of root-level folders without querying the entire set of files at /search.  this does not yet exist and is required before this element can be implemented.
    const params = {
      //folderPath may or may not contain an item itself.
      filter: { path_parent: folderPath },
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
          let fileList = [];
          response.data.map(file => {
            const newFile = file;
            newFile.children = [];
            newFile.key = file.id;
            fileList = [...fileList, newFile];
            return file;
          });

          fileList.sort(function (a, b) {
            if (a.items) {
              if (b.items) {
                if (a.name < b.name) {
                  return -1;
                }
                return 1;
              }
              return -1;
            } else {
              if (b.items) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 1;
            }
          });
          setFiles(fileList);
        })
        .catch(error => {
          //setStatus(status => (status = { loading: false, error: error }));
          console.log('error in fetch from API: ', error);
        });
    };
    fetchData();
  }, [folderPath]);

  // className={classes.fileDisplay}

  if (files) {
    return (
      <ReducedExpansionPanel
        key={folderPath}
        expanded={true}
        className={classes.parentPanel}
        TransitionProps={{ unmountOnExit: true }}
      >
        <div className={classes.locationDisplay}>
          <AddLocation className={classes.folderIcon} />
          <ReferenceField
            label={'en.models.agents.location'}
            source={Constants.model_fk_fields.LOCATION}
            reference={Constants.models.LOCATIONS}
            linkType="show"
            basePath="/projects"
            resource="projects"
            record={files[0]}
          >
            <LocationShow />
          </ReferenceField>
        </div>
        <ExpansionPanelSummary
          onClick={() => {
            if (parentList.length > 0) {
              const parentListItem = parentList.pop();
              setFolderPath(parentListItem.path_parent);
            }
          }}
        >
          <FolderOpen className={classes.folderIcon} />
          <Typography
            className={classes.baseFolderText}
          >{`${folderPath}`}</Typography>
        </ExpansionPanelSummary>

        {files &&
          files.length > 0 &&
          files.map(file => {
            return (
              <ReducedExpansionPanelDetails key={`nested_file:${file.key}`}>
                {isFile(file) ? (
                  <FileSummary
                    item={file}
                    key={file.key}
                    caller={`browser`}
                    className={classes.fileSummary}
                  />
                ) : (
                    <ExpansionPanelSummary
                      className={classes.nestedFolderPanel}
                      onClick={() => {
                        setFolderPath(file.path);
                        setParentList([...parentList, file]);
                      }}
                    >
                      <FolderDisplay classes={classes} file={file} />
                    </ExpansionPanelSummary>
                  )}
              </ReducedExpansionPanelDetails>
            );
          })}
      </ReducedExpansionPanel>
    );
  } else {
    return <React.Fragment>{`Loading...`}</React.Fragment>;
  }
}

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(withRouter(FolderView));
