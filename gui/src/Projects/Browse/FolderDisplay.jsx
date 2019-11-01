import React from "react";
import { Grid, Typography } from "@material-ui/core";
import {
    Folder,
    Add,
    Description,
} from '@material-ui/icons';
const FolderDisplay = ({ classes, file }) => (
    <Grid container alignItems="center" className={classes.folderLineItem}>
        <Grid item xs={"auto"}>
            <Add />
        </Grid>
        <Grid item xs={"auto"}>
            <Folder className={classes.folderIcon} />
        </Grid>
        <Grid item xs={9}>
            <Typography className={classes.folderContentsName}>{`${file.name}`}</Typography>
        </Grid>

        <Grid
            item
            xs={"auto"}
            >
            <Description />
        </Grid>
        <Grid item xs={"auto"}>
            {`${file.items}`}
        </Grid>
    </Grid>
)
export default FolderDisplay