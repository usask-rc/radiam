import React from "react";
import { Chip, Typography } from "@material-ui/core";


const FieldsChip = ({record, classes, type="show", ...props}) => {
    const fields = record.fields.split(",")

    //console.log("FieldsChip props: ", props)

    if (record.fields.length > 0 && fields && fields.length > 0){
        //for some reason, labels arent working one level up on this.
        return(
            <>
            {type === "show" && <Typography className={classes.fieldChipLabel}>{`Fields Granted`}</Typography>}
            {fields.map(field => (<Chip className={classes.fieldChip} key={field} label={field}/>
            ) 
            )}
            </>
        )
    }
    return null
}
export default FieldsChip