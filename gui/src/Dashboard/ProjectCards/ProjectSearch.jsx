import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { Redirect } from 'react-router';
import * as Constants from "../../_constants/index"

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
                    id={Constants.paths.SEARCH}
                    type={Constants.paths.SEARCH}
                    className={classes.textField}
                    onChange={handleChange}
                    placeholder= {`${project.nbFiles} ${Constants.model_fields.FILES}`}
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