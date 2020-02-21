//FileDetails.jsx
import React from 'react';
import { AgentShow } from '../_fields/AgentShow';
import compose from 'recompose/compose';
import {MODEL_FIELDS, MODEL_FK_FIELDS, MODELS, RESOURCE_OPERATIONS} from '../../_constants/index';
import { formatBytes } from '../../_tools/funcs';
import { LocationShow } from '../_fields/LocationShow';
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import { ReferenceField, translate } from 'react-admin';
import withStyles from '@material-ui/core/styles/withStyles';
import { isObject } from 'util';

const styles = theme => ({
  card: {
    textAlign: 'left',
    display: 'flex',
    paddingBottom: "1em",
    minWidth: "90em",
  },
  value: {
    paddingRight: "1em",
  },
  key: {
    paddingRight: "1em",
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const FileDetails = ({ classes, item, getJsonKeys }) => {
  return (
    <Grid className={classes.card} container spacing={2} direction="row">
      {getJsonKeys(item).map(key => {
      return(
        <React.Fragment key={key}>
        {!isObject(item[key]) && 
            key !== MODEL_FIELDS.NAME &&
            key !== 'key' &&
            key !== 'children' ? (
              
                <Grid className={classes.key} item xs={6}>
                  <Typography className={classes.title}>{key}</Typography>
                  {key === MODEL_FK_FIELDS.LOCATION ? (
                      <ReferenceField
                        label={'en.models.projects.location'}
                        source={MODEL_FK_FIELDS.LOCATION}
                        reference={MODELS.LOCATIONS}
                        link={RESOURCE_OPERATIONS.SHOW}
                        basePath={`/${MODELS.PROJECTS}`}
                        resource={MODELS.PROJECTS}
                        record={item}
                      >
                        <LocationShow />
                      </ReferenceField>
                    ) : key === MODEL_FK_FIELDS.AGENT ? (
                      <ReferenceField
                        label={'en.models.projects.agent'}
                        source={MODEL_FK_FIELDS.AGENT}
                        reference={MODELS.AGENTS}
                        link={RESOURCE_OPERATIONS.SHOW}
                        basePath={`/${MODELS.PROJECTS}`}
                        resource={MODELS.PROJECTS}
                        record={item}
                      >
                        <AgentShow />
                      </ReferenceField>
                    ) : key === MODEL_FIELDS.FILESIZE ? (
                      formatBytes(item[key], 2)
                    ) : (
                      item[key]
                    )}
                </Grid>
            ) : isObject(item[key]) && key !== 'children' ? 
            
        <>
          <Typography
            className={classes.title}
          >{`${key}:`}
          </Typography>
          <FileDetails
            item={item[key]}
            getJsonKeys={getJsonKeys}
            classes={classes}
          />
        </> :
        null
        }
        </React.Fragment>
      )})}
    </Grid>
  );
};

const enhance = compose(
  translate,
  withStyles(styles)
);

export default enhance(FileDetails);
