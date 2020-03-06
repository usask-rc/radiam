//the title on the dataset list can be too long in some cases.
//DatasetListTitle.jsx

import React from "react";
import { truncatePath } from "../_tools/funcs";
import { Typography, Tooltip } from "@material-ui/core";

const DatasetListTitle = ({record, classes}) => {
    const title = record.title
    const splitTitle = truncatePath(title)
    let shortTitle

    if (title.length > 40){
        shortTitle = `...${title.slice(-40)}`
    }

    return (
        <Tooltip title={title}>
            {
                title.length > splitTitle.length ? 
                    <Typography>{`${splitTitle}`}</Typography>
                :shortTitle ? 
                    <Typography>{`${shortTitle}`}</Typography>
                :
                    <Typography>{`${title}`}</Typography>
            }
        </Tooltip>
    )
}
export default DatasetListTitle