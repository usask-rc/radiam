//FolderView.jsx
import React, { useState, useEffect } from 'react';
import AddLocation from "@material-ui/icons/AddLocation"
import ArrowBack from "@material-ui/icons/ArrowBack"
import Description from "@material-ui/icons/Description"
import Folder from "@material-ui/icons/Folder"
import Search from "@material-ui/icons/Search"
import CloseIcon from "@material-ui/icons/Close"
import InsertChart from "@material-ui/icons/InsertChart"
import { compose } from 'recompose';
import {PATHS, ROLE_USER, MODEL_FK_FIELDS, MODELS, RESOURCE_OPERATIONS} from "../../_constants/index";
import Typography from "@material-ui/core/Typography"
import Table from "@material-ui/core/Table"
import TableHead from "@material-ui/core/TableHead"
import TableBody from "@material-ui/core/TableBody"
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import TableSortLabel from "@material-ui/core/TableSortLabel"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import TextField from "@material-ui/core/TextField"
import { translate } from "ra-core"
import { LocationShow } from '../../_components/_fields/LocationShow';
import { ReferenceField } from 'ra-ui-materialui/lib/field';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import { getFolderFiles, formatBytes, truncatePath } from '../../_tools/funcs';
import FileDetails from '../../_components/files/FileDetails';
import { Chip, Tooltip, IconButton } from '@material-ui/core';
import { Link } from  "react-router-dom";
import moment from 'moment';

const styles = theme => ({
  backCell: {
    verticalAlign: "middle",
    display: "flex",
    cursor: "pointer",
    backgroundColor: "beige",
    height: "40px",
  },
  specialBackRow: {
    backgroundColor: "beige",
    cursor: "pointer",
  },
  createDatasetCell: {
    margin: "0px",
    padding: "0px"
  },
  searchForm: {

  },
  searchFormTextField: {
    verticalAlign: "middle",
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
  iconDisplay: {
    marginTop: "-0.1em",
    paddingLeft: "0.1em",
    paddingRight: "0.1em",
  },
  curFolderDisplay: {
    fontWeight: "bold",
    cursor: "pointer",
  },
  showFolderRow: {
    height: "40px",
  },
  locationDisplay: {
    margin: '0.25em',
    marginLeft: '0.75em',
  },
  locationIcon: {
    verticalAlign: "middle",
  },
  closeButton: {
    float: "right",
  },
  modalTitle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    display: "inline",
  },
  modalTitleText: {
    float: "left",
    marginTop: "1em",
    marginBottom: "1em",
    fontWeight: "bold",
  },
  parentDisplay: {
    marginLeft: "1em",
  },
  table: {
    marginBottom: "2em",
    borderRadius: "16",
  },
  folderRow: {
    backgroundColor: "beige",
    borderRadius: "16",
    cursor: "pointer",
  },
  fileRow: {
    cursor: "pointer",
  },
  tableHead: {
    textAlign: "left",
    backgroundColor: "LightGray",
  },
  value: {
    padding: '0 16px',
    minHeight: 48,
    textAlign: 'right',
  },
});

const headCells = [
  {id: "name.keyword", numeric: false, disablePadding: false, canOrder: true, label: `File Name`},
  {id : "filesize", numeric: false, disablePadding: true, canOrder: true, label: "File Size"},
  {id : "path_parent", numeric: false, disablePadding: false, canOrder: false, label: "File Path"},
  {id : "last_modified", numeric: false, disablePadding: false, canOrder: true, label: "Last Modified"},
  {id : "create_dataset", numeric: false, disablePadding: true, canOrder: false, label: ""} //a column for an icon to create a dataset out of this folder on click
  //,{id : "location", numeric: false, dissablePadding: false, canOrder: true, label: "File Location"}
]

const DisplayFileIcons = withStyles(styles)(({classes, ...props}) => {
  const { file_num_in_dir, items } = props.folder

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
  const { classes, order, search, orderBy, onRequestSort, handleSearch } = props;
  const createSortHandler = property => event => {
      onRequestSort(event, property);
  };

  console.log("EnhancedTableHead order: ", order, "props: ", props)
  return (
      <TableHead className={classes.tableHead}>
      <TableRow>
          {headCells.map((headCell, idx) => (
          <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={order}
          >
              {headCell.canOrder ? 
              <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={order}
                  onClick={createSortHandler(headCell.id)}
                  
              >
              {headCell.label}
              </TableSortLabel>
              :
              headCell.label
              }
              {idx === 4 && 
                <form className={classes.searchForm} onSubmit={handleSearch}>
                  <TextField
                    id={PATHS.SEARCH}
                    name={PATHS.SEARCH}
                    type={PATHS.SEARCH}
                    className={classes.searchFormTextField}
                    value={search}
                    placeholder={`Search Files`}
                  />
                  <IconButton type={"submit"} className={classes.searchButton}>
                    <Search />
                  </IconButton>
                </form>
              }
            
          </TableCell>
          ))}
      </TableRow>
      </TableHead>
  );
}


function FolderView({ projectID, item, classes, dataType="projects", projectName, groupID, ...props }) {
  let _isMounted = false
  //the contents of `/search/{projectID}/search/?path_parent={itemPath}`

  //TODO: consolidate these into something nicer
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [parents, setParents] = useState([item.path_parent]); //base level is simply a path
  const [loading, setLoading] = useState(true)
  const [filePage, setFilePage] = useState(1)
  const [folderPage, setFolderPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const [sortBy, setSortBy] = useState("name.keyword")
  const [search, setSearch] = useState("") //TODO: the field holding this search value should be clearable and should clear when going up / down the folder hierarchy
  const [order, setOrder] = useState("desc")
  const [file, setFile] = useState(null)
  const [fileTotal, setFileTotal] = useState(0)
  const [folderTotal, setFolderTotal] = useState(0)
  const canCreateDataset = () => {
    const user = JSON.parse(localStorage.getItem(ROLE_USER))
    if (user && (user.is_admin || user.groupAdminships.includes(groupID))){
      console.log("user groupadminships: ", user.groupAdminships, groupID)
      return true
    }
    return false
  }

  const addParent = (folder) => {
    let tempParents = [...parents, folder]
    setLoading(true)
    setFilePage(1)
    setFolderPage(1)
    setFileTotal(0)
    setFolderTotal(0)
    setFiles([])
    setFolders([])
    setSearch("")
    setParents(tempParents)
    //add a path to the list of parents at the end of the list
  }

  const handleRequestSort = (event, property) => {

    setOrder(order === "desc" ? "asc" : "desc")
    setLoading(true)
    setFilePage(1)
    setFolderPage(1)
    setFileTotal(0)
    setFolderTotal(0)
    setFiles([])
    setFolders([])
    console.log("sort property: ", property)
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
    setSearch("")
    setParents(tempParents)
  }

  function getJsonKeys(json) {
    const keys = [];
    Object.keys(json).forEach(function (key) {
      keys.push(key);
    });
    return keys;
  }

  const handleDialogClose = () => {
    setFile(null)
  }

  const handleSearch = (e) => {
    console.log("handlesearch: ", e.target.elements.search.value)

    if (search !== e.target.elements.search.value){
      setLoading(true)
      setFilePage(1)
      setFolderPage(1)
      setFileTotal(0)
      setFolderTotal(0)
      setFolders([])
      setFiles([])
      setSearch(e.target.elements.search.value)
    }
    e.preventDefault()
  }

  //TODO: honestly i just dont really feel like doing this rn
  //const debouncedSearch = useDebounce()

  useEffect(() => {
    //search the given project with the appropriate location and search param

    //folderpath is probably irrelevant
    _isMounted = true
    let folderPath = parents[0] //TODO: this is fine for now - parents[0] is always a path itself.  will have to change.


    if (search && search.length > 0){
      let fileParams = {
        folderPath: folderPath,
        projectID: projectID,
        numFiles: 1000,  //TODO: paginate the file search component
        page: 1, //TODO: affix this to some other panel
        q: search
      }

      getFolderFiles(fileParams, "file", dataType=dataType).then((data) => {
        console.log("search files data: ", data)
        if (_isMounted){
          setFiles(data.files)
          setLoading(false)
        }
      }).catch((err => {console.error("error in getFiles is: ", err)}))

      
      getFolderFiles(fileParams, "directory", dataType=dataType).then((data) => {
        console.log("search files data: ", data)
        if (_isMounted){
          setFolders(data.files)
          setLoading(false)

          if (!data.files && !files){
            
          }
        }
      }).catch((err => {console.error("error in getFiles is: ", err)}))
    }

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [search])

  useEffect(() => {

    let folderPath

    if (parents.length > 1){
      folderPath = parents[parents.length - 1].path
    }
    else{
      folderPath = parents[0]
    }
    _isMounted = true

    let fileParams = {
      folderPath: folderPath,
      projectID: projectID,
      numFiles: perPage,  //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
      page: filePage,
      sortBy: sortBy,
      order: order === "desc" ? "-" : "",
      //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
      //we by default want to show all of the data. when we 'change pages', we should be appending the new data onto what we already have, not removing what we have.
    }

    let folderParams = {
        folderPath: folderPath,
        projectID: projectID,
        numFiles: perPage,  //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
        page: folderPage,
        sortBy: sortBy,
        order: order === "desc" ? "-" : "",
        //TODO: both of the following queries need pagination components.  I don't quite know how to best implement this yet.  Until then, we'll just display all files in a folder with a somewhat unreasonable limit on them.
        //we by default want to show all of the data. when we 'change pages', we should be appending the new data onto what we already have, not removing what we have.
    }

    if (!search){ //TODO: there is a better way to separate this out
      getFolderFiles(folderParams, "directory", dataType=dataType).then((data) => {
        console.log("folder files data: ", data.files)
        if (_isMounted){
          //TODO:will have to change when pagination comes
          setFolderTotal(data.total)
          //cases for where we want to add more files via `...`
          //TODO: sort functionality adds duplicates in - the logic has to change here.
          const prevFolders = folders

          //first page, set the values, otherwise append
          if (folderPage > 1){
            if (data.files[0].id !== prevFolders[prevFolders.length - data.files.length].id)
            {
              setFolders([...prevFolders, ...data.files])
            }
          }
          else{
            setFolders([...data.files]) 
          }
          setLoading(false)
        }
        return data
      })
      .catch((err => {console.error("error in getFiles (folder) is: ", err)}))

      getFolderFiles(fileParams, "file", dataType=dataType).then((data) => {
        console.log("files data: ", data)
        if (_isMounted){
          setFileTotal(data.total)

          const prevFiles = files
          if (filePage > 1){
            if (data.files[0].id !== prevFiles[prevFiles.length - data.files.length].id)
            {
              setFiles([...prevFiles, ...data.files])
            }
          }
          else{
            setFiles([...data.files]) 
          }
          setLoading(false)
        }
      }).catch((err => {console.error("error in getFiles is: ", err)}))
    }

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [parents, sortBy, order, filePage, folderPage, perPage, search]);

  //needs different UE for both folder and files

  //folder UE
  /* What do we want from this?
    At this level (PATH / parents?) get X (perFolderPage / perPage) Folders on Page (folderPage), sorted by (sortBy), ordered by (order)
  useEffect(() => {

  }, [folderPage, sortBy, order, folderPage, ])
   */

  return(
  <div>
    <Table size={"small"} className={classes.table}>
    <EnhancedTableHead classes={classes}
    onRequestSort={handleRequestSort}
    order={order}
    orderBy={sortBy}
    handleSearch={handleSearch}>
      <div className={classes.locationDisplay}>
        <AddLocation className={classes.locationIcon} />
        <ReferenceField
          label={'en.models.agents.location'}
          source={MODEL_FK_FIELDS.LOCATION}
          reference={MODELS.LOCATIONS}
          link={RESOURCE_OPERATIONS.SHOW}
          basePath={`/${MODELS.PROJECTS}`}
          resource={MODELS.PROJECTS}
          record={item}
        >
          <LocationShow />
        </ReferenceField>
      </div>
    </EnhancedTableHead>
    <TableBody>
      {!loading && (parents.length > 1) && //colspan doesnt work apparently, but rowSpan does.
        <TableRow className={classes.showFolderRow}>
          <TableCell align={"left"} colSpan={4} className={classes.backCell} onClick={() => parents.length > 1 ? removeParent() : null}>
            <ArrowBack />
          </TableCell>
          <TableCell onClick={() => setFile(parents[parents.length - 1])}>
            <Typography className={classes.curFolderDisplay}><div><Folder />{`${parents[parents.length - 1].name}`}</div></Typography>
          </TableCell>
          <TableCell>
            <Typography>{truncatePath(`${parents[parents.length - 1].path_parent}`)}</Typography>
          </TableCell>
          <TableCell>
            <Tooltip title={`${parents[parents.length - 1].last_modified}`}>
              <Typography className={classes.curFolderDisplay}>
                {`${moment().diff(moment(parents[parents.length - 1].last_modified).toISOString(), "days")} days ago`}
              </Typography>
            </Tooltip>
          </TableCell>
          <TableCell/>

        </TableRow>
      }
      {!loading && folders && folders.length > 0 && 
      <>
        {folders.map( folder => {
          //split to 3 folders up
          let truncated_path = truncatePath(folder.path_parent)

          return <TableRow className={classes.folderRow} key={folder.id}>
            <TableCell className={classes.nameCell} onClick={() => addParent(folder)}>
              {folder.name}
            </TableCell>
            <TableCell className={classes.fileCountCell} onClick={() => addParent(folder)}>
              <DisplayFileIcons folder={folder} classes={classes} />
            </TableCell>
            <TableCell className={classes.nameCell} onClick={() => addParent(folder)}>
              {truncated_path}
            </TableCell>
            <TableCell className={classes.nameCell} onClick={() => addParent(folder)}>
              <Tooltip title={`${folder.last_modified}`}>
                <Typography>
                  {`${moment().diff(moment(folder.last_modified).toISOString(), "days")} days ago`}
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell className={classes.createDatasetCell}>
              {canCreateDataset() ? 
                <Link to={{pathname: `/${MODELS.DATASETS}/Create`, title:`${projectName}_${folder.path}`, project: projectID, search_model: {wildcard: {path_parent: `${folder.path}*`}}}}>
                  <Tooltip title={`Create Dataset rooted at .../${folder.name}`}>
                    <Chip icon={<InsertChart />} clickable variant="outlined" label={"+"} key={`newDataset_${folder.id}`}/>
                  </Tooltip>
                </Link>
                : null
              }
            </TableCell>
          </TableRow>
        })
        }
      </>
      }
      {!loading && folders && folders.length < folderTotal &&
        <TableRow className={classes.folderRow} onClick={() => setFolderPage(folderPage + 1)}>
          <TableCell>{`... ${folderTotal - folders.length} more directories`}</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      }
      {!loading && files && files.length > 0 && 
        files.map( file => {
          let truncated_path = truncatePath(file.path_parent)

          return <TableRow className={classes.fileRow} key={file.id} onClick={() => setFile(file)}>
          <TableCell className={classes.nameCell}>
            {file.name}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {formatBytes(file.filesize)}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {truncated_path}
          </TableCell>
            <TableCell className={classes.nameCell}>
              <Tooltip title={file.last_modified}>
                <Typography>
                  {`${moment().diff(moment(file.last_modified).toISOString(), "days")} days ago`}
                </Typography>
              </Tooltip>
            </TableCell>
          <TableCell></TableCell>
          
        </TableRow>
      })
      }
      {!loading && files && files.length < fileTotal &&
        <TableRow className={classes.fileRow} onClick={() => setFilePage(filePage + 1)}>
          <TableCell>{`... ${fileTotal - files.length} more files`}</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      }
      {!loading && files.length === 0 && folders.length === 0 && search &&
      <TableRow className={classes.fileRow}>
          <TableCell colSpan={5}>{`No Files were found with query: <${search}>.  Please try a different Query.`}</TableCell>
      </TableRow>
      }
      
    </TableBody>
    </Table>
    {file &&
    <Dialog fullWidth maxWidth={false} aria-labelledby="customized-dialog-title" className={classes.fileDialog} open={file} onClose={handleDialogClose}>
      
      <DialogTitle>
        <div className={classes.modalTitle}>
          <Typography className={classes.modalTitleText} variant={"h6"}>{file.name}</Typography>
          <IconButton aria-label="close" className={classes.closeButton} onClick={handleDialogClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className={classes.fileDialogContent}>
        <FileDetails item={file} getJsonKeys={getJsonKeys} />
      </DialogContent>
    </Dialog>}

  </div>)
}


const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(withRouter(FolderView));
