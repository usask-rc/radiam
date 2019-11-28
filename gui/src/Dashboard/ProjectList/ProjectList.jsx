import React, { Component, useState } from 'react'
import { withStyles } from '@material-ui/styles';
import {PropTypes} from "prop-types";
import * as Constants from "../../_constants/index"
import { Card, CardContent, Typography, CardHeader, TableRow, TableHead, Table, TableCell, TableBody, TablePagination, TableSortLabel } from '@material-ui/core';
import ProjectKeywords from '../ProjectCards/ProjectKeywords';
import ProjectSearch from '../ProjectCards/ProjectSearch';
import { Redirect } from 'react-router';
import ProjectCardHeader from '../ProjectCards/ProjectCardHeader';
import ReferenceField from 'ra-ui-materialui/lib/field/ReferenceField';
import { ImageField } from 'ra-ui-materialui/lib/field/ImageField';

const styles = {
    headlineTop: {
      backgroundColor: '#688db2',
      color: 'white',
      marginTop: '-16px !important;',
    },
    headerDiv: {
      float: 'left',
    },
    iconCell: {
        padding:"15px",
    },
    image: {
      height: `${Constants.AVATAR_HEIGHT}`,
      margin: '-6px 6px 0px 0px',
    },
    nameCell: {
        fontSize: "1em",
    },
    searchIcon: {
      height: '1em',
      width: '1em',
      marginTop: '1em',
    },
    searchArea: {
      display: 'flex',
      alignItems: 'flex-end',
    },
    table: {

    },
    textTop: {
      color: 'white',
    },
    container: {
      margin: '1em',
      textAlign: 'center',
      minWidth: "20em",
    },
    fileCount: {
      textAlign: "right",
      color: "DarkGray"
    },
    chipItem: {
      margin: "0.25em"
    },
    chipContainer: {
      display: 'flex',
      width: 'inherit',
      alignItems: 'flex-end'
    },
    chipLabel: {
      color: "DarkGray",
      textAlign: "left",
      width: "inherit",
      alignItems: "flex-start"
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
      },
  };

  const headCells = [
      {id: 'icon', numeric: false, disablePadding: true, label: "Icon"},
      {id: "name", numeric: false, disablePadding: false, label: "Project Name"},
      {id: "keywords", numeric: false, disablePadding: false, label: "Keywords" },
      {id: "search", numeric: false, disablePadding: false, label: "Search"},
      {id: "numFiles", numeric: true, disablePadding: true, label: "File Count"}
  ]

  function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  function EnhancedTableHead(props) {
    const { classes, order, orderBy, numSelected, rowCount, onRequestSort } = props;
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
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  
  EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };



const ProjectList = ({classes, loading, projects}) => {

    const [redirect, setRedirect] = useState(false);
  const [search, setSearch] = useState(null);
  const [tableRows, setTableRows] = useState(5);
  const [tablePage, setTablePage] = useState(0)
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState('name')
const [selected, setSelected] = useState([]);

    function handleSearch(e) {
        setRedirect(true);
    }
    function stableSort(array, cmp) {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
          const order = cmp(a[0], b[0]);
          if (order !== 0) return order;
          return a[1] - b[1];
        });

        return stabilizedThis.map(el => el[0]);
      }

      

    function getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
  }

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  };


  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

    //https://material-ui.com/components/tables/
    const handleChangePage = (event, newPage) => {
        setTablePage(newPage);
    };
    
    const handleChangeRowsPerPage = event => {
    setTableRows(parseInt(event.target.value, 10));
    setTablePage(0);
    };

    const isSelected = name => selected.indexOf(name) !== -1;

    const emptyRows = tableRows - Math.min(tableRows, projects.length - tablePage * tableRows);
  

    console.log("projects in ProjectList are: ", projects)
    return(
    <Card className={classes.container}>
      <Table className={classes.table} size="small">
      <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={projects.length}
            />
      <TableBody>
        {projects.length > 0 &&

        stableSort(projects, getSorting(order, orderBy))
        .slice(tablePage * tableRows, tablePage * tableRows + tableRows)
            .map((project, index) => {
                const isItemSelected = isSelected(project.name)
                return (
                    <TableRow key={project.id}
                    hover
                    onClick={event => handleClick(event, project.name)}
                    tabIndex={-1}
                    key={project.name}
                    selected={isItemSelected}
                    >
                    <TableCell className={classes.iconCell}>
                    
                    <ReferenceField
                        record={project}
                        basePath={Constants.models.PROJECTS}
                        linkType={false}
                        source={Constants.model_fields.AVATAR}
                        reference={Constants.models.PROJECTAVATARS}
                        allowEmpty
                    >

                        <ImageField
                            classes={{ image: classes.image }}
                            source={Constants.model_fields.AVATAR_IMAGE}
                        />

                    </ReferenceField>
                    </TableCell>
                    <TableCell className={classes.nameCell}>{project.name}</TableCell>
                    <TableCell className={classes.keywordCell}>
                        <ProjectKeywords classes={classes} project={project} />
                    </TableCell>
                    <TableCell className={classes.searchCell}>
                        <ProjectSearch setSearch={setSearch} handleSearch={handleSearch} project={project} classes={classes} />
                    </TableCell>
                    <TableCell className={classes.countCell}>
                        <Typography>{project.nbFiles}</Typography>
                    </TableCell>
                    {redirect && (
                        <Redirect
                        to={{
                            pathname: `/projects/${project.id}/show/files`,
                            state: { search: search },
                        }}
                        />
                    )}
                </TableRow>)
            })

        }
      </TableBody>
      
      </Table>
      <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={projects.length}
          rowsPerPage={tableRows}
          page={tablePage}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
    </Card>
    )
}

export default withStyles(styles)(ProjectList)