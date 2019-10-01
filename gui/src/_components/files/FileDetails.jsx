import React from 'react';
import { AgentShow } from '../_fields/AgentShow';
import compose from 'recompose/compose';
import * as Constants from '../../_constants/index';
import { formatBytes } from '../../_tools/funcs';
import { LocationShow } from '../_fields/LocationShow';
import { Grid, Typography } from '@material-ui/core';
import { ReferenceField, translate } from 'react-admin';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  card: {
    textAlign: 'left',
    display: 'flex',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

//TODO:  'tika_metadata' string will likely be updated at some point.  This needs to become modular.
const FileDetails = ({ classes, item, getJsonKeys }) => {
  return (
    <Grid className={classes.card} container spacing={1} direction="row">
      {getJsonKeys(item).map(key => (
        <React.Fragment key={key}>
          {key !== 'tika_metadata' &&
            key !== 'name' &&
            key !== 'key' &&
            key !== 'children' && (
              <React.Fragment>
                <Grid item xs={12} s={2} md={2}>
                  <Typography className={classes.title}>{key}</Typography>
                </Grid>
                <Grid item xs={12} s={2} md={4}>
                  <React.Fragment>
                    {key === 'location' ? (
                      <ReferenceField
                        label={'en.models.projects.location'}
                        source={Constants.model_fk_fields.LOCATION}
                        reference={Constants.models.LOCATIONS}
                        linkType="show"
                        basePath="/projects"
                        resource="projects"
                        record={item}
                      >
                        <LocationShow />
                      </ReferenceField>
                    ) : key === 'agent' ? (
                      <ReferenceField
                        label={'en.models.projects.agent'}
                        source={Constants.model_fk_fields.AGENT}
                        reference={Constants.models.AGENTS}
                        linkType="show"
                        basePath="/projects"
                        resource="projects"
                        record={item}
                      >
                        <AgentShow />
                      </ReferenceField>
                    ) : key === 'filesize' ? (
                      formatBytes(item[key], 2)
                    ) : (
                      item[key]
                    )}
                  </React.Fragment>
                </Grid>
              </React.Fragment>
            )}
        </React.Fragment>
      ))}
      {item['tika_metadata'] && (
        <React.Fragment>
          <Typography
            className={classes.title}
          >{`Extended Metadata: `}</Typography>
          <FileDetails
            item={item['tika_metadata']}
            getJsonKeys={getJsonKeys}
            classes={classes}
          />
        </React.Fragment>
      )}
    </Grid>
  );
};

const enhance = compose(
  translate,
  withStyles(styles)
);

export default enhance(FileDetails);
