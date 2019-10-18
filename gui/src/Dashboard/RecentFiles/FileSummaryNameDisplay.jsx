import React from 'react'
import { Grid, Typography } from '@material-ui/core';
import { ImageField } from 'ra-ui-materialui/lib/field/ImageField';
import Link from '@material-ui/core/Link'
import { ReferenceField } from 'ra-ui-materialui/lib/field';
import * as Constants from "../../_constants/index"

const FileSummaryNameDisplay = ({ classes, avatar, name, id }) => (
    <Grid item className={classes.item} xs={12} sm={12} md={9}>
        <Typography variant="h5">
            <Link href={`/#/${Constants.models.PROJECTS}/${id}/${Constants.resource_operations.SHOW}`}>
                <ReferenceField
                    basePath={Constants.models.PROJECTS}
                    linkType={false}
                    source={Constants.model_fields.AVATAR}
                    reference={Constants.models.PROJECTAVATARS}
                    record={{ avatar: avatar }}
                    allowEmpty
                >
                    <ImageField
                        classes={{ image: classes.image }}
                        source={Constants.model_fields.AVATAR_IMAGE}
                    />
                </ReferenceField>
                {`${name}`}
            </Link>
        </Typography>
    </Grid>
)

export default FileSummaryNameDisplay