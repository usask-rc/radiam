import React, { Component } from 'react';
import { Typography } from '@material-ui/core';

const Results = (props) => {

    if (props && props.location && props.location.data && props.location.data.results) {

        return (
            props.location.data.results.map(item => {
                return (<Typography>{item.name}</Typography>)
            })
        )
    }
    else {

        return (
            <Typography></Typography>
        )
    }

}
export default Results