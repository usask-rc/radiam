import React from 'react'
import { Grid, Typography } from '@material-ui/core';
import { ImageField } from 'ra-ui-materialui/lib/field/ImageField';
import Link from '@material-ui/core/Link'
import { ReferenceField } from 'ra-ui-materialui/lib/field';

const FileSummaryNameDisplay = ({ classes, avatar, name, id }) => (
    <Grid item className={classes.item} xs={12} sm={12} md={9}>
        <Typography variant="h5">
            <Link href={`/#/projects/${id}/show`}>
                <ReferenceField
                    basePath="projects"
                    linkType={false}
                    source={'avatar'}
                    reference={'projectavatars'}
                    record={{ avatar: avatar }}
                    allowEmpty
                >
                    <ImageField
                        classes={{ image: classes.image }}
                        source="avatar_image"
                    />
                </ReferenceField>
                {`${name}`}
            </Link>
        </Typography>
    </Grid>
)

export default FileSummaryNameDisplay