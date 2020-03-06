//datasetshow.jsx
import React, { SFC } from "react";
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { FieldProps, InjectedFieldProps, fieldPropTypes } from "react-admin";
import {MODEL_FIELDS, MODELS, RESOURCE_OPERATIONS} from "../../_constants/index";
import { Link, Chip } from "@material-ui/core";


export const datasetSelect = choice => choice.title

export const DatasetShow: SFC<FieldProps & InjectedFieldProps & fieldPropTypes> = ({
  className,
  allowEmpty,
  basePath,
  translateChoice,
  record = {},
  ...rest
}) => {
  const title = get(record, MODEL_FIELDS.TITLE)

    return (
    <Link href={`/#/${MODELS.DATASETS}/${record.id}/${RESOURCE_OPERATIONS.SHOW}`}>
        <Chip label={<Typography
            component="span"
            variant="body1"
            className={className}
            {...rest}
        >
            {title}
        </Typography>}/>
    </Link>
    );
};

