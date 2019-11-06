//FolderView.jsx
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
import { translate } from 'ra-core';
import { LocationShow } from '../../_components/_fields/LocationShow';
import { ReferenceField } from 'ra-ui-materialui/lib/field';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import { getFolderFiles } from '../../_tools/funcs';

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
  folderLineItem: {
    display: "flex",
    flexDirection: "row",
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

function FolderView({ projectID, item, classes }) {
  let _isMounted = false
  //the contents of `/search/{projectID}/search/?path_parent={itemPath}`
  const [files, setFiles] = useState([]);
  const [folderPath, setFolderPath] = useState(item.path);
  const [parentList, setParentList] = useState([item]);

  useEffect(() => {
    _isMounted = true
    getFolderFiles(folderPath, projectID).then((data) => {
      if (_isMounted){
        setFiles(data)
      }
      return data
    })
    .catch((err => {console.error("error in getFiles is: ", err)}))

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [folderPath]);

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
            linkType={Constants.resource_operations.SHOW}
            basePath={`/${Constants.models.PROJECTS}`}
            resource={Constants.models.PROJECTS}
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
