//FileDetails.jsx
import React from 'react';
import { AgentShow } from '../_fields/AgentShow';
import compose from 'recompose/compose';
import * as Constants from '../../_constants/index';
import { formatBytes } from '../../_tools/funcs';
import { LocationShow } from '../_fields/LocationShow';
import { Grid, Typography } from '@material-ui/core';
import { ReferenceField, translate } from 'react-admin';
import withStyles from '@material-ui/core/styles/withStyles';
import { isObject } from 'util';

const styles = theme => ({
  card: {
    textAlign: 'left',
    display: 'flex',
    paddingBottom: "1em",
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
        <React.Fragment>
        {!isObject(item[key]) && 
            key !== Constants.model_fields.NAME &&
            key !== 'key' &&
            key !== 'children' ? (
              
                <Grid className={classes.key} item xs={6}>
                  <Typography className={classes.title}>{key}</Typography>
                  {key === Constants.model_fk_fields.LOCATION ? (
                      <ReferenceField
                        label={'en.models.projects.location'}
                        source={Constants.model_fk_fields.LOCATION}
                        reference={Constants.models.LOCATIONS}
                        linkType={Constants.resource_operations.SHOW}
                        basePath={`/${Constants.models.PROJECTS}`}
                        resource={Constants.models.PROJECTS}
                        record={item}
                      >
                        <LocationShow />
                      </ReferenceField>
                    ) : key === Constants.model_fk_fields.AGENT ? (
                      <ReferenceField
                        label={'en.models.projects.agent'}
                        source={Constants.model_fk_fields.AGENT}
                        reference={Constants.models.AGENTS}
                        linkType={Constants.resource_operations.SHOW}
                        basePath={`/${Constants.models.PROJECTS}`}
                        resource={Constants.models.PROJECTS}
                        record={item}
                      >
                        <AgentShow />
                      </ReferenceField>
                    ) : key === Constants.model_fields.FILESIZE ? (
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
