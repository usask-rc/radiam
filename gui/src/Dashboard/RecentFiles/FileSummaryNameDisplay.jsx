import React from 'react'
import { Grid, Typography } from '@material-ui/core';
import { ImageField } from 'ra-ui-materialui/lib/field/ImageField';
import Link from '@material-ui/core/Link'
import { ReferenceField } from 'ra-ui-materialui/lib/field';
import {MODELS, RESOURCE_OPERATIONS, MODEL_FIELDS} from "../../_constants/index"

const FileSummaryNameDisplay = ({ classes, avatar, name, id }) => (
    <Grid item className={classes.item} xs={12} sm={12} md={9}>
        <Typography variant="h5">
            <Link href={`/#/${MODELS.PROJECTS}/${id}/${RESOURCE_OPERATIONS.SHOW}`}>
                <ReferenceField
                    basePath={MODELS.PROJECTS}
                    linkType={false}
                    source={MODEL_FIELDS.AVATAR}
                    reference={MODELS.PROJECTAVATARS}
                    record={{ avatar: avatar }}
                    allowEmpty
                >
                    <ImageField
                        classes={{ image: classes.image }}
                        source={MODEL_FIELDS.AVATAR_IMAGE}
                    />
                </ReferenceField>
                {`${name}`}
            </Link>
        </Typography>
    </Grid>
)

export default FileSummaryNameDisplay