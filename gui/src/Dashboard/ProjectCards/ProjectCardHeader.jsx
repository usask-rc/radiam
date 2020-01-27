import React from 'react';
import { ImageField } from 'ra-ui-materialui/lib/field/ImageField';
import { Link, Typography } from '@material-ui/core';
import { ReferenceField } from 'ra-ui-materialui/lib/field';
import {MODELS, MODEL_FIELDS} from "../../_constants/index"


const ProjectCardHeader = ({ classes, project }) =>
    (<Typography className={classes.headlineTop} variant="h5" component="h5">
        <div className={classes.headerDiv}>
            <ReferenceField
                record={project}
                basePath={MODELS.PROJECTS}
                link={false}
                source={MODEL_FIELDS.AVATAR}
                reference={MODELS.PROJECTAVATARS}
                allowEmpty
            >

                <ImageField
                    classes={{ image: classes.image }}
                    source={MODEL_FIELDS.AVATAR_IMAGE}
                />

            </ReferenceField>
        </div>
        <div className={classes.headerDiv}>
            <Link
                className={classes.textTop}
                href={`/#/projects/${project.id}/show`}
            >
                {`${project.name}`}
            </Link>
        </div>
    </Typography>
    )

export default ProjectCardHeader