import React, { useState } from 'react';
import { TextField, Typography } from '@material-ui/core';
import { Search } from '@material-ui/icons';

const ProjectSearch = ({ classes, setSearch, project, handleSearch }) => {
    const [searchHidden, setSearchHidden] = useState(true);

    function handleChange(e) {
        setSearch(e.target.value);
    }
    return (
        <form onSubmit={handleSearch}>
            <div className={classes.searchArea}>
                {!searchHidden && (
                    <TextField
                        id="search"
                        type="search"
                        className={classes.textField}
                        onChange={handleChange}
                        placeholder={`Search Files`}
                        autoFocus
                    />
                )}
                <Search
                    className={classes.searchIcon}
                    onClick={() => setSearchHidden(!searchHidden)}
                />
                <Typography variant="body1" component="p" onClick={() => setSearchHidden(!searchHidden)} className={classes.fileCount}>
                    {`${project.nbFiles} Files`}
                </Typography>
            </div>
        </form>
    )
}

export default ProjectSearch