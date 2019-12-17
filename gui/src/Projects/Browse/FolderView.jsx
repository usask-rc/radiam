//FolderView.jsx
import React, { useState, useEffect } from 'react';
import {
  AddLocation,
  FolderOpen,
  Sort,
  ArrowUpward,
  ArrowDownward,
} from '@material-ui/icons';
import { compose } from 'recompose';
import Constants from '../../_constants/index';
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@material-ui/core';
import FileSummary from '../../_components/files/FileSummary';
import FolderDisplay from './FolderDisplay';
import { translate } from 'ra-core';
import { LocationShow } from '../../_components/_fields/LocationShow';
import { ReferenceField } from 'ra-ui-materialui/lib/field';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import { getFolderFiles } from '../../_tools/funcs';
import FileDetails from '../../_components/files/FileDetails';

const styles = theme => ({
  baseFolder: {
    backgroundColor: "beige",
  },
  baseFolderText: {
    fontWeight: 'bold',
    display: 'flex',
  },
  buttonContainer: {
    textAlign: 'right',
  },
  details: {
    flexDirection: 'column',
    textAlign: 'left',
  },
  fileInfoDisplay: {
    display: 'flex',
    flexDirection: "row",
  },
  sortDisplay: {
    display: 'flex',
    flexDirection: "row",
  },
  fileSummary: {
    paddingRight: '2em',
    marginRight: '20em',
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
  folderIcon: {
    marginRight: '0.25em',
  },
  folderLineItem: {
    display: "flex",
    flexDirection: "row",
  },
  listItemText: {
    paddingRight: 0,
  },
  locationDisplay: {
    margin: '0.25em',
    marginLeft: '0.75em',
  },
  locationIcon: {
    verticalAlign: "middle",
  },
  main: {
    flex: '1',
    marginRight: '2em',
    marginLeft: '5em',
    marginTop: '2em',
    textAlign: 'right',
  },
  nestedFolderPanel: {
    backgroundColor: '#BEBEBE',
    width: 'inherit',
    marginRight: '1em',
    borderRadius: 3,
  },
  noDataFoundText: {
    fontWeight: 'bold',
    padding: "1em",
  },
  parentPanel: {
    textAlign: 'left',
  },
  sortIcon: {
    height: '1em',
    width: '1em',
    verticalAlign: "middle",
  },
  orderIcon: {
    height: '1.25em',
    width: '1.25em',
    verticalAlign: "middle",
  },
  smallDisplay: {
    textAlign: 'right',
    verticalAlign: 'middle',
  },
  sortSelect: {
    textAlign: 'right',
  },
  table: {

  },
  tableRow: {

  },
  tableHead: {
    textAlign: "left",

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
  smallIcon: {},
});

const headCells = [
  {id: "name", numeric: false, disablePadding: false, canOrder: true, label: "Project Name"},
  {id : "filesize", numeric: true, disablePadding: true, canOrder: true, label: "File Size"},
  {id : "path_parent", numeric: false, disablePadding: false, canOrder: true, label: "File Path"},
  {id : "indexed_date", numeric: false, disablePadding: false, canOrder: true, label: "Last Index Date"}
  //,{id : "location", numeric: false, dissablePadding: false, canOrder: true, label: "File Location"}
]

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = property => event => {
      onRequestSort(event, property);
  };

  return (
      <TableHead>
      <TableRow>
          {headCells.map(headCell => (
          <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === headCell.id ? order : false}
          >
              {headCell.canOrder ? 
              <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={order}
                  onClick={createSortHandler(headCell.id)}
                  
              >
              {headCell.label}
              {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
              ) : null}
              </TableSortLabel>
              :
              headCell.label
              }
          </TableCell>
          ))}
      </TableRow>
      </TableHead>
  );
}


function FolderView({ projectID, item, classes }) {

  let _isMounted = false
  //the contents of `/search/{projectID}/search/?path_parent={itemPath}`
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [parents, setParents] = useState([item.path_parent]);
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [numFiles, setNumFiles] = useState(100)
  const [sortBy, setSortBy] = useState("last_modified")
  const [order, setOrder] = useState("-")
  const [file, setFile] = useState(null)

  const addParent = (parent) => {
    let tempParents = [...parents, parent]
    setLoading(true)
    setFolders([])
    setFiles([])
    setParents(tempParents)
    //add a path to the list of parents at the end of the list
  }

  const removeParent = () => {
    let tempParents = [...parents]
    tempParents.splice(tempParents.length - 1, 1)
    setLoading(true)
    setFolders([])
    setFiles([])
    setParents(tempParents)
  }

function getJsonKeys(json) {
  const keys = [];
  Object.keys(json).forEach(function (key) {
    keys.push(key);
  });
  return keys;
}

  useEffect(() => {

    let folderPath = parents[parents.length - 1]
    _isMounted = true

    let params = {
      folderPath: folderPath,
      projectID: projectID,
      numFiles: numFiles,  //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
      page: page,
      sortBy: sortBy,
      order: order,
         //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
      //we by default want to show all of the data. when we 'change pages', we should be appending the new data onto what we already have, not removing what we have.
    }

    //TODO: requires an order by component as well
    getFolderFiles(params, "directory").then((data) => {
      if (_isMounted){
        //TODO:will have to change when pagination comes
        setFolders(data.files)
      }
      return data
    }).then(() => {
      if (_isMounted && folders){
        setLoading(false)
      }
    })
    .catch((err => {console.error("error in getFiles (folder) is: ", err)}))

    getFolderFiles(params, "file").then((data) => {
      if (_isMounted){
        //TODO:will have to change when pagination comes
        setFiles(data.files)
      }
    }).then(() => 
    {
      if (_isMounted && files)
      {
        setLoading(false)
      }
    }
    ).catch((err => {console.error("error in getFiles is: ", err)}))

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [parents, sortBy, order]);

  console.log("FolderView with PID: ", projectID)
  return(
  <div>
    <Table size={"small"} className={classes.table}>
    <EnhancedTableHead className={classes.tableHead}>
      <div className={classes.locationDisplay}>
        <AddLocation className={classes.locationIcon} />
        <ReferenceField
          label={'en.models.agents.location'}
          source={Constants.model_fk_fields.LOCATION}
          reference={Constants.models.LOCATIONS}
          linkType={Constants.resource_operations.SHOW}
          basePath={`/${Constants.models.PROJECTS}`}
          resource={Constants.models.PROJECTS}
          record={item}
        >
          <LocationShow />
        </ReferenceField>
      </div>
    </EnhancedTableHead>
    <TableBody>
      {!loading && folders && folders.length > 0 && 
      folders.map( folder => {
        return <TableRow onClick={() => setFile(folder)}>
          <TableCell className={classes.nameCell}>
            {folder.name}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {folder.filesize}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {folder.path_parent}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {folder.indexed_date}
          </TableCell>
        </TableRow>
      })
      }
      {!loading && files && files.length > 0 && 
        files.map( file => {
          return <TableRow onClick={() => setFile(file)}>
          <TableCell className={classes.nameCell}>
            {file.name}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {file.filesize}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {file.path_parent}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {file.indexed_date}
          </TableCell>
        </TableRow>
      })
      }
    </TableBody>
    </Table>
    {file &&
      <Dialog fullWidth open={file} onClose={() => setFile(null)} aria-label="Show File">
      <DialogTitle>
      {file.name}
      </DialogTitle>
      <DialogContent>
        <FileDetails item={file} getJsonKeys={getJsonKeys} />
      </DialogContent>
    </Dialog>
    }
  </div> )
/*
    return (
      <ReducedExpansionPanel
        expanded={"true"}
        className={classes.parentPanel}
        TransitionProps={{ unmountOnExit: true }}
      >
        <div className={classes.fileInfoDisplay}>
          <div className={classes.locationDisplay}>
            <AddLocation className={classes.locationIcon} />
            <ReferenceField
              label={'en.models.agents.location'}
              source={Constants.model_fk_fields.LOCATION}
              reference={Constants.models.LOCATIONS}
              linkType={Constants.resource_operations.SHOW}
              basePath={`/${Constants.models.PROJECTS}`}
              resource={Constants.models.PROJECTS}
              record={item}
            >
            
              <LocationShow />
            </ReferenceField>
          </div>

          <div className={classes.sortDisplay}>
            <Sort className={classes.sortIcon} />
            <Select
              id={'sort-select'}
              label={`Sort By`}
              className={classes.sortSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <MenuItem value={Constants.model_fields.NAME}>File Name</MenuItem>
              <MenuItem value={Constants.model_fields.INDEXED_DATE}>Indexed On</MenuItem>
              <MenuItem value={Constants.model_fields.LAST_MODIFIED}>Last Modified</MenuItem>
              <MenuItem value={Constants.model_fields.FILESIZE}>Filesize</MenuItem>
              <MenuItem value={Constants.model_fields.LAST_ACCESS}>Last Accessed</MenuItem>
            </Select>
          </div>

          <div className={classes.sortDisplay}>
            {order === "-" ? <ArrowUpward className={classes.orderIcon} onClick={() => setOrder("")}/> : <ArrowDownward className={classes.orderIcon} onClick={() => setOrder("-")}/>}
          </div>
        </div>
        <ExpansionPanelSummary
          className={classes.baseFolder}
          onClick={() => {
              if (parents.length > 1){
                removeParent()
              }
            }
          }
        >
          <FolderOpen className={classes.folderIcon} />
          <Typography
            className={classes.baseFolderText}
          >{`${parents[parents.length - 1]}`}</Typography>
        </ExpansionPanelSummary>

        {!loading && folders && folders.length > 0 && folders.map(folder => {
          return (
              <ReducedExpansionPanelDetails key={`nested_file:${folder.key}`}>
                    <ExpansionPanelSummary
                      className={classes.nestedFolderPanel}
                      onClick={() => {
                          addParent(folder.path) //TODO: this is probably wrong we want to use setparent to create a list of parents
                      }}
                    >
                      <FolderDisplay classes={classes} file={folder} />
                    </ExpansionPanelSummary>
              </ReducedExpansionPanelDetails>
            );
        })}

        {!loading && files &&
          files.length > 0 &&
          files.map(file => {
            return (
              <ReducedExpansionPanelDetails key={`nested_file:${file.key}`}>
                  <FileSummary
                    item={file}
                    key={file.key}
                    caller={`browser`}
                    className={classes.fileSummary}
                  />
              </ReducedExpansionPanelDetails>
            );
          })}

          {!loading && files.length === 0 && folders.length === 0 && 
            <Typography className={classes.noDataFoundText}>{`No data was found in this directory.`}</Typography>
          }

          { _isMounted && loading && <Typography>{`Loading...`}</Typography>}
      </ReducedExpansionPanel>
    );
    */
}


const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(withRouter(FolderView));
