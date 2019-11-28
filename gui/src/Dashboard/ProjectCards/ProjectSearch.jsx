import React, { useState } from 'react';
import { TextField, Typography } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import * as Constants from "../../_constants/index"

const ProjectSearch = ({ classes, setSearch, project, handleSearch }) => {
    const [searchHidden, setSearchHidden] = useState(false);

    function handleChange(e) {
        setSearch(e.target.value);
    }
    return (
        <form onSubmit={handleSearch}>
            <div className={classes.searchArea}>
                {!searchHidden && (
                    <TextField
                        id={Constants.paths.SEARCH}
                        type={Constants.paths.SEARCH}
                        className={classes.textField}
                        onChange={handleChange}
                        placeholder= {`${project.nbFiles} ${Constants.model_fields.FILES}`}
                        autoFocus
                    />
                )}
                <Search
                    className={classes.searchIcon}
                    //onClick={() => setSearchHidden(!searchHidden)}
                />
            </div>
        </form>
    )
}

export default ProjectSearch