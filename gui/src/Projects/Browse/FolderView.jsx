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
import FileDetails from './FileDetails';
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
    padding: "0px",
    float: "right",
  },
  searchForm: {
    float: "right",
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
    cursor: "pointer",
  },
  curFolderText: {
    fontWeight: "bold",
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
                  <div>
                    <TextField
                      id={PATHS.SEARCH}
                      name={PATHS.SEARCH}
                      type={PATHS.SEARCH}
                      className={classes.searchFormTextField}
                      value={search}
                      placeholder={`Search Files`}
                      defaultValue={
                        (props &&
                          props.location &&
                          props.location.state &&
                          props.location.state.search) ||
                        null
                      }
                    />
                    <IconButton type={"submit"} className={classes.searchButton}>
                      <Search />
                    </IconButton>
                  </div>
                </form>
              }
            
          </TableCell>
          ))}
      </TableRow>
      </TableHead>
  );
}


function FolderView({ projectID, item, classes, dataType="projects", projectName, groupID, projectLocation, ...props }) {
  let _isMounted = false

  console.log("item in folderview is: ", item)

  //TODO: consolidate these into something nicer
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [parents, setParents] = useState([item]); //base level is simply path_parent which should be ".."
  const [loading, setLoading] = useState(true)
  const [filePage, setFilePage] = useState(1)
  const [folderPage, setFolderPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [sortBy, setSortBy] = useState("name.keyword")
  const [search, setSearch] = useState(
    (props &&
      props.location &&
      props.location.state &&
      props.location.state.search) ||
    null
  ); //TODO: the field holding this search value should be clearable and should clear when going up / down the folder hierarchy
  const [order, setOrder] = useState("desc")
  const [file, setFile] = useState(null)
  const [fileTotal, setFileTotal] = useState(0)
  const [folderTotal, setFolderTotal] = useState(0)
  const fileTypes = ["file", "directory"]

  const canCreateDataset = () => {
    const user = JSON.parse(localStorage.getItem(ROLE_USER))
    if (user && (user.is_admin || user.groupAdminships.includes(groupID))){
      return true
    }
    return false
  }

  const addParent = (folder) => {
    let tempParents = [...parents, folder]

    console.log("adding parent, tempParents is: ", tempParents)
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

  const getParentNameList = () => {
    //for all parents, append their names together with "/"
    const parentNames = []

    parents.map(parent => {
      if (parent && parent.name){
        parentNames.push(parent.name)
      }
      return parent
    })
    return `...${parentNames.join("\\")}`
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
    //on search clear, reset to base
    else if (e.target.elements.search.value === ""){
      setLoading(true)
      setFilePage(1)
      setFolderPage(1)
      setFileTotal(0)
      setFolderTotal(0)
      setFolders([])
      setFiles([])
      setParents([item])
      setSearch("")
    }
    e.preventDefault()
  }

  useEffect(() => {
    //search the given project with the appropriate location and search param

    //folderpath is probably irrelevant
    _isMounted = true

    let folderPath = parents[parents.length - 1].path
    if (parents.length === 1){
      folderPath = ".." //root is `..`
    }

    if (search && search.length > 0){
      let fileParams = {
        folderPath: folderPath,
        projectID: projectID,
        numFiles: perPage, 
        page: filePage,
        order: order === "desc" ? "-" : "",
        sortBy: sortBy,
        location: projectLocation,
        q: search
      }

      fileTypes.forEach(type => {

        fileParams.page = filePage
        if (type === "directory"){
          fileParams.page = folderPage
        }
        // eslint-disable-next-line no-self-assign
        getFolderFiles(fileParams, type, dataType=dataType).then((data) => {
          if (_isMounted){
            if (type === "file"){
              setFileTotal(data.total)
              const prevFiles = files
              if (filePage > 1){
                //append only if necessary
                if (data.files[0].id !== prevFiles[prevFiles.length - data.files.length].id){
                  setFiles([...prevFiles, ...data.files])
                }
                else{
                  console.error("unhandled case in set files in search")
                }
              }
              else{
                setFiles([...data.files])
              }
            }
            else if (type === "directory"){
              setFolderTotal(data.total)
              const prevFolders = folders
              if (folderPage > 1){
                if (data.files[0].id !== prevFolders[prevFolders.length - data.files.length].id){
                  console.log("new folder list being set to: ", [...prevFolders, ...data.files])
                  setFolders([...prevFolders, ...data.files])
                }
                else{
                  console.error("unhandled case in set folders in search")
                }
              }
              else{
                setFolders([...data.files])
              }
            }
            else{
              console.error("unknown file requested as data: ", type, data)
            }
            setLoading(false)
          }
        }).catch((err => {console.error("error in getFiles (search) is: ", err)}))
      })
    }

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [search, filePage, folderPage, order])

  useEffect(() => {
    let folderPath = parents[parents.length - 1].path
    if (parents.length === 1){
      folderPath = ".."
    }
    
    _isMounted = true

    let fileParams = {
      folderPath: folderPath,
      projectID: projectID,
      numFiles: perPage,  
      page: filePage,
      sortBy: sortBy,
      location: projectLocation,
      order: order === "desc" ? "-" : "",
    }

    if (!search){ //TODO: there is a better way to separate this out

      fileTypes.forEach(type => {
        fileParams.page = filePage
        if (type === "directory"){
          fileParams.page = folderPage
        }
        // eslint-disable-next-line no-self-assign
        getFolderFiles(fileParams, type, dataType=dataType).then((data) => {
          console.log(`${type} data: ${data.files}`)
          if (_isMounted){

            if (type === "file"){
              
              setFileTotal(data.total)
              const prevFiles = files

              console.log("prevFiles, data.files: ", [...prevFiles, ...data.files])
              if (filePage > 1){
                if (data.files[0].id !== prevFiles[prevFiles.length - data.files.length].id)
                {
                  setFiles([...prevFiles, ...data.files])
                }
              }
              else{
                setFiles([...data.files]) 
              }
            }
            else if (type === "directory"){
              setFolderTotal(data.total)
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
            }
            else{
              console.error("unknown file type requested from data: ", type, data)
            }
            setLoading(false)
          }
          return data
        })
        .catch((err => {console.error("error in getFiles (no search) is: ", err)}))
      })
    }

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [parents, sortBy, order, filePage, folderPage, perPage, search]);

  return(
  <div>
    <Table size={"small"} className={classes.table}>
    <EnhancedTableHead classes={classes}
    onRequestSort={handleRequestSort}
    order={order}
    orderBy={sortBy}
    handleSearch={handleSearch}
    {...props}>
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
          <TableCell className={classes.curFolderDisplay} onClick={() => setFile(parents[parents.length - 1])}>
            <Typography className={classes.curFolderText}>{`${parents[parents.length - 1].name ? parents[parents.length - 1].name : `<No Folder Name>` }`}</Typography>
          </TableCell>
          <TableCell className={classes.curFolderDisplay} onClick={() => setFile(parents[parents.length - 1])}>
            <Typography className={classes.curFolderText}>{getParentNameList()}</Typography>
          </TableCell>
          <TableCell className={classes.curFolderDisplay} onClick={() => setFile(parents[parents.length - 1])}>
            <Tooltip title={`${parents[parents.length - 1].last_modified}`}>
              <Typography className={classes.curFolderText}>
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
          let truncated_path = truncatePath(folder.path)

          return <TableRow className={classes.folderRow} key={folder.id}>
            <TableCell className={classes.nameCell} onClick={() => addParent(folder)}>
              {folder.name ? folder.name : `<No Folder Name>`}
            </TableCell>
            <TableCell className={classes.fileCountCell} onClick={() => addParent(folder)}>
              <DisplayFileIcons folder={folder} classes={classes} />
            </TableCell>
            <TableCell className={classes.nameCell} onClick={() => addParent(folder)}>
              <Typography>{truncated_path}</Typography>
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
          let truncated_path = truncatePath(file.path)

          return <TableRow className={classes.fileRow} key={file.id} onClick={() => setFile(file)}>
          <TableCell className={classes.nameCell}>
            {file.name}
          </TableCell>
          <TableCell className={classes.nameCell}>
            {formatBytes(file.filesize)}
          </TableCell>
          <TableCell className={classes.nameCell}>
            <Typography>{truncated_path}</Typography>
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
      <TableRow className={classes.fileRow} onClick={() => setSearch("")}>
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
        <FileDetails item={file} getJsonKeys={getJsonKeys} projectID={projectID} />
      </DialogContent>
    </Dialog>}

  </div>)
}


const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(withRouter(FolderView));
