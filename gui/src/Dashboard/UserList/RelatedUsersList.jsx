//RelatedUserList.jsx
import React, { useState } from 'react'
import { withStyles } from '@material-ui/styles';
import { TableHead, TableRow, TableCell, TableSortLabel, Card, Table, TableBody, Link, Typography, Tooltip, Chip } from '@material-ui/core';
import {PropTypes} from "prop-types";
import { translate } from "react-admin"
import moment from 'moment';
import { compose } from 'recompose';

const styles = {
    headlineTop: {
        backgroundColor: '#688db2',
        color: 'white',
        marginTop: '-16px !important;',
    },
    groupCell: {

    },
    chipLink: {
        cursor: "pointer"
    },
    chipField: {
        marginRight: "1em",
        cursor: "pointer",
    },
    headerDiv: {
    float:   'left',
    },
    searchCell: {
        width: "14em",

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
        width: "inherit",
    },
    textTop: {
        color: 'white',
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
    chipItem: {
        cursor: "pointer",
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
        {id: "username", numeric: false, disablePadding: false, canOrder: true, label: "Username"},
        {id: "name", numeric: false, disablePadding: false, canOrder: true, label: "Name"},
        {id: "email", numeric: false, disablePadding: false, canOrder: true, label: "Email"},
        {id: "groups", numeric: false, disablePadding: false, canOrder: true, label: "User Groups" },
    ]

    function desc(a, b, orderBy) {

        //TODO: handle separately - 'group' sits outside of the user object
        if (orderBy === "group"){
            return 0
        }

        let p1 = a.user[orderBy]
        let p2 = b.user[orderBy]

        if (orderBy === "name"){
            p1 = `${a.user["last_name"]}${a.user["first_name"]}`.toLowerCase()
            p2 = `${b.user["last_name"]}${b.user["first_name"]}`.toLowerCase()
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

EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const RelatedUsersList = ({classes, translate, relatedUsers, ...rest}) => {
    const [tableRows, setTableRows] = useState(5);
    const [tablePage, setTablePage] = useState(0)
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("username")
    const [selected, setSelected] = useState([]);
    const now = moment()

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

    const handleRequestSort = (event, property) => {
        const isDesc = orderBy === property && order === 'desc';
        setOrder(isDesc ? 'asc' : 'desc');
        setOrderBy(property);
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
                    rowCount={relatedUsers.length}
                    />
                <TableBody>
                    {
                        stableSort(relatedUsers, getSorting(order, orderBy))
                        .slice(tablePage * tableRows, tablePage * tableRows + tableRows)
                        .map((userObj, index) => {
                            const user = userObj.user
                            const user_display_name = user.last_name ? `${user.last_name}${user.first_name ? `, ${user.first_name}` : `` }`
                            : user.first_name
                            const groups = userObj.group
                            const isItemSelected = isSelected(user.username)
                            
                            console.log("userObj being mapped: ", userObj, groups)
                            return(
                                <TableRow key={user.id}
                                className={classes.projectRow}
                                hover
                                onClick={event => handleClick(event, user.username)}
                                tabIndex={-1}
                                key={user.username}
                                selected={isItemSelected}
                                >
                                    <TableCell className={classes.nameCell}>
                                        <Link className={classes.projectName} href={`/#/users/${user.id}/show`}>
                                            {user.username}
                                        </Link>
                                    </TableCell>
                                    <TableCell className={classes.nameCell}>
                                        <Typography>
                                            {user_display_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className={classes.nameCell}>
                                        <Typography>
                                            {`${user.email}`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className={classes.groupCell}>
                                        {groups.map(group => {
                                            const role = group.group_role
                                            const memberSince = moment(group.since).format("YYYY-MM-DD")
                                            const memberUntil = group.expires ? moment(group.expires).format("YYYY-MM-DD") : ""

                                            return(
                                                <Tooltip title={`${translate(`en.${role.label}`)} Since ${memberSince} ${memberUntil ? `Until: ${memberUntil}`:``}`}>
                                                    <Link href={`/#/researchgroups/${group.id}/show`}>
                                                        <Chip 
                                                        label= {group.name}
                                                        className={classes.chipItem}
                                                        />
                                                    </Link>
                                                </Tooltip>
                                            )
                                            }
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        )
                    }
                </TableBody>
            </Table>
        </Card>
    )
}

const enhance = compose(
    translate,
    withStyles(styles)
)

export default enhance(RelatedUsersList)