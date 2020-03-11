import React from 'react'
import { TableHead, TableRow, TableCell, TableSortLabel } from '@material-ui/core';
import {PropTypes} from "prop-types"



function EnhancedTableHead(props) {
    const { classes, order, orderBy, onRequestSort, headCells } = props;
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
                    className={classes.titleRowCell}
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

export default EnhancedTableHead