import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { Redirect } from 'react-router';
import {PATHS, MODEL_FIELDS }from "../../_constants/index"

const ProjectSearch = ({ classes, project }) => {
    const [search, setSearch] = useState("")
    const [redirect, setRedirect] = useState(false)

    function handleChange(e) {
        setSearch(e.target.value);
    }
    function handleSearch(e) {
        setRedirect(true)
    }

    return (
        <form onSubmit={handleSearch}>
            <div className={classes.searchArea}>
                <TextField
                    id={PATHS.SEARCH}
                    type={PATHS.SEARCH}
                    className={classes.textField}
                    onChange={handleChange}
                    placeholder= {`${project.nbFiles} ${MODEL_FIELDS.FILES}`}
                    autoFocus
                />
            </div>
            {redirect && (
                <Redirect
                to={{
                    pathname: `/projects/${project.id}/show/files`,
                    state: { search: search },
                }}
                />
            )}
        </form>
    )
}

export default ProjectSearch