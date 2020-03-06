import React from "react";
import { Chip } from "@material-ui/core";


const KeywordsChip = ({record, classes, ...props}) => {
    const keywords = record.keywords.split(",")

    if (keywords && keywords.length > 0){
    return(
        <>
        {keywords.map(keyword => (
            keyword.length > 0 ? <Chip className={classes.keywordChip} key={keyword} label={keyword}/> : null
        ) )}
        </>
    )
    }
    return null
}
export default KeywordsChip