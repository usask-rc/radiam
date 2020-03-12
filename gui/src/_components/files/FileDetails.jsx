//FileDetails.jsx
import React, {Component} from 'react';
import { TopToolbar } from 'react-admin';
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
import { EditConfigMetadataForm, MetadataEditActions, ShowMetadata } from "../Metadata.jsx";
import Button from '@material-ui/core/Button';
import ContentCreate from '@material-ui/icons/Create';

const styles = theme => ({
  additionalMetadata: {
    fontSize: '16px',
    fontWeight: 'bold',
    paddingTop: '40px',
  },
  button: {
    color: '#3f51b5',
    paddingLeft: '0px',
    paddingBottom: '24px',
  },
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

class FileDetails extends Component {
  constructor (props) {
    super(props);
    this.state = {
        show: true,
        edit: false,
        config: false,
        record: {}
    };
  }

  toggleDisplay = (event) => {
    this.setState(prevState => (
      { show: !prevState.show,
        edit: !prevState.edit}));
  };

  render() {
  const { classes, item, getJsonKeys, projectID, translate } = this.props;
  return (
    <>
      <Grid className={classes.card} container spacing={2} direction="row">
        {getJsonKeys(item).map(key => {
        return(
        <React.Fragment key={key}>
          {!isObject(item[key]) && 
              key !== MODEL_FIELDS.NAME &&
              key !== 'key' &&
              key !== 'metadata' &&
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
              ) : isObject(item[key]) && key !== 'children' && key !== 'metadata' ? 
          <>
            <Typography
              className={classes.title}
            >{`${key}:`}
            </Typography>
            <FileDetails
              translate={translate}
              item={item[key]}
              getJsonKeys={getJsonKeys}
              classes={classes}
              projectID={projectID}
            />
          </> :
          null
          }
          </React.Fragment>
        )})}
      </Grid>
      <div className={classes.additionalMetadata}>
        { this.state.show ?
            <>
              <TopToolbar>
                <Button
                  className={classes.button}
                  onClick={() => {
                    this.setState(prevState => (
                      { show: !prevState.show,
                        edit: !prevState.edit}));}
                  }
                >
                  {translate('en.metadata.edit.title')}<ContentCreate/>
                </Button>
              </TopToolbar>
              <ShowMetadata
                type={MODEL_FK_FIELDS.FILE}
                translate={translate}
                id={item.entity}
                record={item}
                projectID={projectID}
              />
            </>
            : null
          }
          { this.state.edit ?
            <>
              <MetadataEditActions cancel={
                <Button
                  className={classes.button}
                  onClick={() => {
                    this.setState(prevState => (
                      { show: !prevState.show,
                        edit: !prevState.edit}));}
                  }
                >
                  {translate('ra.action.cancel')}
                </Button>
              } />
              <EditConfigMetadataForm
                  id={item.entity}
                  doc={item.id}
                  onCancel={this.toggleDisplay}
                  onSave={this.toggleDisplay}
                  projectID={projectID}
                  record={item}
                  translate={translate}
                  />
            </>
            : null
          }
      </div>
    </>
  );
}
};

const enhance = compose(
  translate,
  withStyles(styles)
);

export default enhance(FileDetails);
