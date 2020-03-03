//the title on the dataset list can be too long in some cases.
//DatasetListTitle.jsx

import React from "react";
import { truncatePath } from "../_tools/funcs";
import { Typography, Tooltip } from "@material-ui/core";

const DatasetListTitle = ({record, classes}) => {
    const title = record.title
    const splitTitle = truncatePath(title)
    if (title.length > splitTitle.length){
        return (
        <Tooltip title={title}>
            <Typography>{`${splitTitle}`}</Typography>
        </Tooltip>)
    }
    else{
        return <Typography>{`${title}`}</Typography>
    }
}
export default DatasetListTitle