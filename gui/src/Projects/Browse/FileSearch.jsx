//FileSearch.jsx
import React, { useState, useEffect } from 'react'
import compose from 'recompose/compose';
import withStyles from '@material-ui/core/styles/withStyles';
import { Table, TableHead, TableCell, TableRow, Typography } from '@material-ui/core';

const styles = theme => {
    root: {

    }
}

//displaying a list of files returned from the `search`
const FileSearch = ({files, ...props}) => {
    return(<Table>
        <TableHead>
            <TableCell>
                <Typography>{`Filename`}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{`Filepath`}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{`Filesize`}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{`Last Updated`}</Typography>
            </TableCell>
        </TableHead>
    {files.map(file => {
        return (<TableRow>
            <TableCell>{file.name}</TableCell>
            <TableCell>{file.path}</TableCell>
            <TableCell>{file.size}</TableCell>
            <TableCell>{file.last_udpated}</TableCell>

        </TableRow>)

    })}
    </Table>
    )
}

export default withStyles(styles)(FileSearch)