import React from 'react';
import { Button } from '@material-ui/core';

const FileSummaryButton = ({ nbFiles, handleRedirect, translate }) => (

    <Button
        variant="contained"
        onClick={handleRedirect}
        color="primary"
        styles={{ float: "right" }}
    >
        {`${translate(
            'en.dashboard.show_all'
        )} ${nbFiles} ${translate('en.dashboard.files')}`}
    </Button>

)
export default FileSummaryButton