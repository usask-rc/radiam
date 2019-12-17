//FolderView.jsx
import React, { useState, useEffect } from 'react';
import {
  AddLocation,
  FolderOpen,
  Sort,
  ArrowUpward,
  ArrowDownward,
  ArrowBack,
  Description,
  Folder,
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
import { getFolderFiles, formatBytes } from '../../_tools/funcs';
import FileDetails from '../../_components/files/FileDetails';

const styles = theme => ({
  backCell: {
    verticalAlign: "middle",
    display: "flex",
  },
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
  displayFileIcons: {
    display: "flex",
    flexDirection: "row",

  },
  fileIcons: {
    display: "flex",
    verticalAlign: "middle",
    flexDirection: "row",
  },
  fileInfoDisplay: {
    display: 'flex',
    flexDirection: "row",
  },
  sortDisplay: {
    display: 'flex',
    flexDirection: "row",
  },
  fileDialog: {
    minWidth: "50em",
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
  iconDisplay: {
    marginTop: "-0.1em",
    paddingLeft: "0.1em",
    paddingRight: "0.1em",
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
  parentDisplay: {
    marginLeft: "1em",
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
    marginBottom: "2em",
    borderRadius: "16",

  },
  folderRow: {
    backgroundColor: "beige",
    borderRadius: "16",
  },
  fileRow: {

  },
  tableHead: {
    textAlign: "left",
    backgroundColor: "LightGray",
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
  {id: "name", numeric: false, disablePadding: false, canOrder: true, label: `File Name`},
  {id : "filesize", numeric: false, disablePadding: true, canOrder: true, label: "File Size"},
  {id : "path_parent", numeric: false, disablePadding: false, canOrder: false, label: "File Path"},
  {id : "indexed_date", numeric: false, disablePadding: false, canOrder: true, label: "Last Index Date"}
  //,{id : "location", numeric: false, dissablePadding: false, canOrder: true, label: "File Location"}
]

const DisplayFileIcons = withStyles(styles)(({classes, ...props}) => {
  const { file_num_in_dir, items } = props.folder

  console.log("Displayfileicons folder :", props, file_num_in_dir, items)

  if (items > 0){
    return(
      <div className={classes.displayFileIcons}>
          {
            items - file_num_in_dir > 0 &&
            <div className={classes.fileIcons}>
            {items - file_num_in_dir}
            <Folder className={classes.iconDisplay} />
          </div>
          }
          {file_num_in_dir > 0 && 
          <div className={classes.fileIcons}>
            {file_num_in_dir}
            <Description className={classes.iconDisplay} />
          </div>
          }
      </div>
    )
  }

  return null;
})


function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = property => event => {
      onRequestSort(event, property);
  };

  return (
      <TableHead className={classes.tableHead}>
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
                  {order === '-' ? 'sorted descending' : 'sorted ascending'}
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
  const [filePage, setFilePage] = useState(1)
  const [folderPage, setFolderPage] = useState(1)
  const [perPage, setPerPage] = useState(100)
  const [sortBy, setSortBy] = useState("last_modified")
  const [order, setOrder] = useState("-")
  const [file, setFile] = useState(null)
  const [fileTotal, setFileTotal] = useState(0)
  const [folderTotal, setFolderTotal] = useState(0)

  const addParent = (parent) => {
    let tempParents = [...parents, parent]
    setLoading(true)
    setFilePage(1)
    setFolderPage(1)
    setFileTotal(0)
    setFolderTotal(0)
    setFiles([])
    setFolders([])
    setParents(tempParents)
    //add a path to the list of parents at the end of the list
  }

  const handleRequestSort = (event, property) => {
    const isDesc = order === property && order === '-';
    setOrder(isDesc ? '' : '-');
    setSortBy(property);
};

  const removeParent = () => {
    let tempParents = [...parents]
    tempParents.splice(tempParents.length - 1, 1)
    setLoading(true)
    setFilePage(1)
    setFolderPage(1)
    setFileTotal(0)
    setFolderTotal(0)
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

    let fileParams = {
      folderPath: folderPath,
      projectID: projectID,
      numFiles: perPage,  //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
      page: filePage,
      sortBy: sortBy,
      order: order,
         //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
      //we by default want to show all of the data. when we 'change pages', we should be appending the new data onto what we already have, not removing what we have.
    }

    let folderParams = {
        folderPath: folderPath,
        projectID: projectID,
        numFiles: perPage,  //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
        page: folderPage,
        sortBy: sortBy,
        order: order,
           //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
        //we by default want to show all of the data. when we 'change pages', we should be appending the new data onto what we already have, not removing what we have.
    }

    console.log("folderParams: ", folderParams)

    //TODO: requires an order by component as well
    getFolderFiles(folderParams, "directory").then((data) => {
      if (_isMounted){
        //TODO:will have to change when pagination comes
        setFolderTotal(data.total)
        //cases for where we want to add more files via `...`
        //TODO: sort functionality adds duplicates in - the logic has to change here.
        if (folders && folders.length  > 0 ){
          const prevFolders = folders
          setFolders([...prevFolders, ...data.files])
          console.log("setting files to: ", [...prevFolders, ...data.files])
        }
        else{
          setFolders(data.files)
        }
      }
      return data
    }).then(() => {
      if (_isMounted && folders){
        setLoading(false)
      }
    })
    .catch((err => {console.error("error in getFiles (folder) is: ", err)}))

    getFolderFiles(fileParams, "file").then((data) => {
      console.log("folder files data: ", data)
      if (_isMounted){
        setFileTotal(data.total)
        if (files && files.length > 0){
          const prevFiles = files
          console.log("setting files to: ", [...prevFiles, ...data.files])
          setFiles([...prevFiles, ...data.files])
        }
        else{
          setFiles(data.files)
        }
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
  }, [parents, sortBy, order, filePage, folderPage, perPage]);

  console.log("FolderView with PID: ", projectID)
  return(
  <div>
    <Table size={"small"} className={classes.table}>
    <EnhancedTableHead classes={classes}
    onRequestSort={handleRequestSort}>
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
      {!loading && (parents.length > 1) &&
        <TableRow className={classes.folderRow}>
          <TableCell className={classes.backCell} onClick={() => parents.length > 1 ? removeParent() : null}><ArrowBack /><Typography className={classes.parentDisplay}>{`${parents[parents.length - 2]}`}</Typography></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      }
      {!loading && folders && folders.length > 0 && 
      <React.Fragment>
        {folders.map( folder => {
          return <TableRow className={classes.folderRow} onClick={() => addParent(folder.path)}>
            <TableCell className={classes.nameCell}>
              {folder.name}
            </TableCell>
            <TableCell className={classes.fileCountCell}>
              <DisplayFileIcons folder={folder} classes={classes} />
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
      </React.Fragment>
      }
      {!loading && folders && folders.length < folderTotal &&
        <TableRow className={classes.folderRow} onClick={() => setFolderPage(folderPage + 1)}>
          <TableCell>{`... ${folderTotal - folders.length} more directories`}</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      }
      {!loading && files && files.length > 0 && 
        files.map( file => {
          return <TableRow className={classes.fileRow} onClick={() => setFile(file)}>
          <TableCell className={classes.nameCell}>
            {file.name}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {formatBytes(file.filesize)}
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
      {!loading && files && files.length < fileTotal &&
        <TableRow className={classes.fileRow} onClick={() => setFilePage(filePage + 1)}>
          <TableCell>{`... ${fileTotal - files.length} more files`}</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      }
      
    </TableBody>
    </Table>
    {file &&
      <Dialog fullWidth className={classes.fileDialog} open={file} onClose={() => setFile(null)} aria-label="Show File">
      <DialogTitle>
      {file.name}
      </DialogTitle>
      <DialogContent className={classes.fileDialogContent}>
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
