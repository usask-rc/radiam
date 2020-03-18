//the title on the dataset list can be too long in some cases.
//DatasetListTitle.jsx

import React from "react";
import { truncatePath } from "../_tools/funcs";
import { Typography, Tooltip } from "@material-ui/core";

const DatasetListTitle = ({record}) => {
    const title = record.title
    const splitTitle = truncatePath(title)

    return (
        <Tooltip title={title}>
            {
                title.length > splitTitle.length ? 
                    <Typography>{`${splitTitle}`}</Typography>
                :
                    <Typography>{`${title}`}</Typography>
            }
        </Tooltip>
    )
}
export default DatasetListTitle