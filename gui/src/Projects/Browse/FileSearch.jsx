//FileSearch.jsx
import React, { useState, useEffect } from 'react'
import compose from 'recompose/compose';
import withStyles from '@material-ui/core/styles/withStyles';
import { Table, TableHead, TableCell, TableRow } from '@material-ui/core';

const styles = theme => {
    root: {

    }
}

//displaying a list of files returned from the `search`
const FileSearch = ({files, ...props}) => {
    return(<Table>
        <TableHead>
            <TableCell>
            </TableCell>

            <TableCell>
            </TableCell>

            <TableCell>
            </TableCell>

            <TableCell>
            </TableCell>
        </TableHead>
    {files.map(file => {
        return (<TableRow>
            <TableCell>{file.name}</TableCell>
            <TableCell></TableCell>

            <TableCell></TableCell>
            <TableCell></TableCell>

        </TableRow>)

    })}
    </Table>
    )
}

export default withStyles(styles)(FileSearch)