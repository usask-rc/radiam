//ProjectList.jsx
import React, { useState } from 'react'
import { withStyles } from '@material-ui/styles';
import {AVATAR_HEIGHT, MODELS, MODEL_FIELDS} from "../../_constants/index"
import { Card, TableRow, Table, TableCell, TableBody, TablePagination, Link, Typography } from '@material-ui/core';
import ProjectKeywords from '../ProjectCards/ProjectKeywords';
import ProjectSearch from '../ProjectCards/ProjectSearch';
import ReferenceField from 'ra-ui-materialui/lib/field/ReferenceField';
import { ImageField } from "react-admin"
import EnhancedTableHead from '../EnhancedTableHead';
const styles = {
    headlineTop: {
        backgroundColor: '#688db2',
        color: 'white',
        marginTop: '-16px !important;',
    },
    headerDiv: {
    float:   'left',
    },
    searchCell: {
        width: "14em",

    },
    iconCell: {
        verticalAlign: "middle",
        width: `${AVATAR_HEIGHT}`,
    },
    image: {
        height: `${AVATAR_HEIGHT}`,
        width: `${AVATAR_HEIGHT}`,
    },
    nameCell: {
        fontSize: "1em",
    },

    projectNameContainer: {
        display: "flex",
        flexDirection: "row",
        textAlign: "center",
    },
    projectNameText: {
        display: "inline-block",
        verticalAlign: "middle",
        paddingTop: "0.9em",
        paddingBottom: "0.9m",
        paddingLeft: "0.5em",
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
        width: "inherit",
    },
    textTop: {
        color: 'white',
    },
    titleRowCell: {
        fontWeight: "bold"
    },
    container: {
        marginTop: '1em',
        textAlign: 'center',
        width: "inherit",
    },
    fileCount: {
        textAlign: "right",
        color: "DarkGray"
    },
    noFiles: {
        color: "LightGray",
    },
    projectRow: {
        minHeight: `${AVATAR_HEIGHT}`,
    },
    chipItem: {
        margin: "0.25em"
    },
    moreChips: {
        margin: "0.25em",
        backgroundColor: "green",
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
    lastFileCell: {
        width: "14em",
    },
    lastFileCellText: {
        verticalAlign: "center",
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
        {id: "name", numeric: false, disablePadding: false, canOrder: true, label: "Project Name"},
        {id: "keywords", numeric: false, disablePadding: false, canOrder: true, label: "Keywords" },
        {id: "nbFiles", numeric: false, disablePadding: false, canOrder: true, label: "Search Project"},
        {id : "daysOld", numeric: false, disablePadding: false, canOrder: true, label: "Last Index"}
        //,{id : "location", numeric: false, dissablePadding: false, canOrder: true, label: "File Location"}
    ]

    function desc(a, b, orderBy) {

        console.log("in desc, comparison is: ", a[orderBy], b[orderBy], "a, b: ", a, b)

        let p1 = a[orderBy]
        let p2 = b[orderBy]
        if (orderBy === "name" || orderBy === "keywords"){
            p1 = p1.toLowerCase()
            p2 = p2.toLowerCase()
        }

        if (p1 === undefined || p2 < p1) {
            return -1;
        }
        if (p2 === undefined || p2 > p1) {
            return 1;
        }
        return 0;
    }

const ProjectList = ({classes, projects}) => {

    const [tableRows, setTableRows] = useState(5);
    const [tablePage, setTablePage] = useState(0)
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("daysOld")
    const [selected, setSelected] = useState([]);

    function stableSort(array, cmp) {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            console.log("in stablesort, comparing a, b: ", a, b)
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
                headCells={headCells}
                />
            <TableBody>
                {projects.length > 0 &&

                stableSort(projects, getSorting(order, orderBy))
                .slice(tablePage * tableRows, tablePage * tableRows + tableRows)
                    .map((project, index) => {
                        const isItemSelected = isSelected(project.name)
                        return (
                            <TableRow key={project.id}
                            className={classes.projectRow}
                            hover
                            onClick={event => handleClick(event, project.name)}
                            tabIndex={-1}
                            key={project.name}
                            selected={isItemSelected}
                            >
                                <TableCell className={classes.nameCell}>
                                    <Link className={classes.projectNameContainer} href={`/#/projects/${project.id}/show`}>
                                        <ReferenceField
                                            record={project}
                                            basePath={MODELS.PROJECTS}
                                            link={false}
                                            source={MODEL_FIELDS.AVATAR}
                                            reference={MODELS.PROJECTAVATARS}
                                            allowEmpty
                                        >
                                            <ImageField
                                                classes={{ image: classes.image }}
                                                title={project.name}
                                                source={MODEL_FIELDS.AVATAR_IMAGE}
                                                allowEmpty
                                            />
                                        </ReferenceField>
                                        <Typography className={classes.projectNameText}>
                                            {project.name}
                                        </Typography>
                                    </Link>
                                </TableCell>
                                <TableCell className={classes.keywordCell}>
                                    <ProjectKeywords classes={classes} project={project} />
                                </TableCell>
                                <TableCell className={classes.searchCell}>
                                    {project.nbFiles > 0 ? 
                                        <ProjectSearch project={project} classes={classes} />
                                        :
                                        <Typography className={classes.noFiles}>{`No Files to Search`}</Typography>
                                    }
                                </TableCell>
                                <TableCell className={classes.lastFileCell}>
                                {console.log("recentFile is: ", project.recentFile)}
                                    {project.recentFile ? 
                                        <Typography className={classes.lastFileCellText}>{project.recentFile.timeAgo}</Typography>
                                        :
                                        <Typography className={classes.noFiles}>{`None`}</Typography>
                                    }
                                </TableCell>
                            </TableRow>
                        )
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