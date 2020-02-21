//FolderView.jsx
import React, { useState, useEffect } from 'react';
import AddLocation from "@material-ui/icons/AddLocation"
import ArrowBack from "@material-ui/icons/ArrowBack"
import Description from "@material-ui/icons/Description"
import Folder from "@material-ui/icons/Folder"
import Search from "@material-ui/icons/Search"
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
import { Chip } from '@material-ui/core';
import { Link } from  "react-router-dom";

const styles = theme => ({
  backCell: {
    verticalAlign: "middle",
    display: "flex",
    cursor: "pointer",
    borderRadius: "16",
  },
  specialBackRow: {
    backgroundColor: "beige",
    cursor: "pointer",
  },
  createDatasetCell: {
    margin: "0px",
    padding: "0px"
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
  locationDisplay: {
    margin: '0.25em',
    marginLeft: '0.75em',
  },
  locationIcon: {
    verticalAlign: "middle",
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
  {id : "indexed_date", numeric: false, disablePadding: false, canOrder: true, label: "Last Indexed At"},
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
              sortDirection={orderBy === headCell.id ? order : false}
          >
              {headCell.canOrder ? 
              <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={order === "-" ? "desc" : "asc"}
                  onClick={createSortHandler(headCell.id)}
                  
              >
              {headCell.label}
              </TableSortLabel>
              :
              headCell.label
              }
              {idx === 0 && <>
                <form className={classes.flex} onSubmit={handleSearch}>

                  <TextField
                    id={PATHS.SEARCH}
                    name={PATHS.SEARCH}
                    type={PATHS.SEARCH}
                    className={classes.textField}
                    value={search}
                    placeholder={`Search Files`}
                  />
                <Search />
                </form>
            </>
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
  const [parents, setParents] = useState([item.path_parent]);
  const [loading, setLoading] = useState(true)
  const [filePage, setFilePage] = useState(1)
  const [folderPage, setFolderPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [sortBy, setSortBy] = useState("name.keyword")
  const [search, setSearch] = useState("") //TODO: the field holding this search value should be clearable and should clear when going up / down the folder hierarchy
  const [order, setOrder] = useState("desc")
  const [file, setFile] = useState(null)
  const [fileTotal, setFileTotal] = useState(0)
  const [folderTotal, setFolderTotal] = useState(0)
  const [displayParent, setDisplayParent] = useState([item.path_parent]);

  const canCreateDataset = () => {
    const user = JSON.parse(localStorage.getItem(ROLE_USER))
    if (user && (user.is_admin || user.groupAdminships.includes(groupID))){
      console.log("user groupadminships: ", user.groupAdminships, groupID)
      return true
    }
    return false
  }

  const addParent = (parent) => {
    let tempParents = [...parents, parent]
    
    
    setDisplayParent(truncatePath(parent))
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

    setOrder(order === "-" ? "" : "-")
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

  

  const handleSearch = (e) => {
    console.log("handlesearch: ", e.target.elements.search.value)
    setLoading(true)
    setFilePage(1)
    setFolderPage(1)
    setFileTotal(0)
    setFolderTotal(0)
    setFolders([])
    setFiles([])
    setSearch(e.target.elements.search.value)
    e.preventDefault()

  }

  //TODO: honestly i just dont really feel like doing this rn
  //const debouncedSearch = useDebounce()

  useEffect(() => {
    //search the given project with the appropriate location and search param

    //folderpath is probably irrelevant
    _isMounted = true
    let folderPath = parents[0] //TODO: there can arise a conflict with two identical folder paths but different locations.


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
        }
      }).catch((err => {console.error("error in getFiles is: ", err)}))
    }

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [search])

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

    if (!search){ //TODO: there is a better way to separate this out

      getFolderFiles(folderParams, "directory", dataType=dataType).then((data) => {
        console.log("folder files data: ", data.files)
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

      getFolderFiles(fileParams, "file", dataType=dataType).then((data) => {
        console.log("files data: ", data)
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
    }

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [parents, sortBy, order, filePage, folderPage, perPage, search]);

  console.log("FolderView with PID: ", projectID)
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
      
        <TableRow className={classes.specialBackRow} onClick={() => parents.length > 1 ? removeParent() : null}>
          <TableCell align={"left"} colSpan={4} className={classes.backCell} >
            <ArrowBack />
            <Typography className={classes.parentDisplay}>{`${displayParent}`}</Typography>
          </TableCell>
          <TableCell />
          <TableCell />
          <TableCell />
          <TableCell />


        </TableRow>
      }
      {!loading && folders && folders.length > 0 && 
      <>
        {folders.map( folder => {
          //split to 3 folders up
          let truncated_path = truncatePath(folder.path_parent)

          return <TableRow className={classes.folderRow} key={folder.id}>
            <TableCell className={classes.nameCell} onClick={() => addParent(folder.path)}>
              {folder.name}
            </TableCell>
            <TableCell className={classes.fileCountCell} onClick={() => addParent(folder.path)}>
              <DisplayFileIcons folder={folder} classes={classes} />
            </TableCell>
            <TableCell className={classes.nameCell} onClick={() => addParent(folder.path)}>
              {truncated_path}
            </TableCell>
            <TableCell className={classes.nameCell} onClick={() => addParent(folder.path)}>
              {folder.indexed_date}
            </TableCell>
            <TableCell className={classes.createDatasetCell}>
              {canCreateDataset() ? 
                <Link to={{pathname: `/${MODELS.DATASETS}/Create`, title:`${projectName}_${folder.path}`, project: projectID, search_model: {wildcard: {path_parent: `${folder.path}*`}}}}>
                  <Chip icon={<InsertChart />} clickable variant="outlined" label={"+"} key={`newDataset_${folder.id}`}/>
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
            {file.indexed_date}
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
        </TableRow>
      }
      
    </TableBody>
    </Table>
    {file &&
    <Dialog fullWidth maxWidth={false} className={classes.fileDialog} open={file} onClose={() => setFile(null)} aria-label="Show File">
      <DialogTitle>
      {file.name}
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
