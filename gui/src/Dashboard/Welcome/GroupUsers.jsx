import React, { Component } from 'react'
import { withStyles } from '@material-ui/styles'
const styles = () => ({
    root: {
        marginTop: "1em",
    }
})
const GroupUsers = ({classes, relatedUsers, ...rest}) => {

    console.log("relatedUsers are: ", relatedUsers)
    return(
        <>

        </>
    )
}

export default withStyles(styles)(GroupUsers)