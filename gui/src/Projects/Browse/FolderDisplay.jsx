import React from "react";
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import Folder from "@material-ui/icons/Folder"
import Add from "@material-ui/icons/Add"
import Description from "@material-ui/icons/Description"
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

        {file && file.file_num_in_dir > 0 &&
            <>
                <Grid
                    item
                    xs={"auto"}
                    >
                    <Description />
                </Grid>
                <Grid item xs={"auto"}>
                    {`${file.file_num_in_dir}`}
                </Grid>
            </>
        }
        {file && file.items - file.file_num_in_dir > 0 && 
            <>
                <Grid item xs={"auto"}
                >
                    <Folder className={classes.folderIcon} />
                </Grid>
                <Grid item xs={"auto"}>
                    {`${file.items - file.file_num_in_dir}`}
                </Grid>
            </>
        }
    </Grid>
)
export default FolderDisplay