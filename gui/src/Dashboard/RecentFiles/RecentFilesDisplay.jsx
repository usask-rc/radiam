import React, { useState, useEffect } from 'react';
import { Card, Tabs, Tab, TextField, Typography } from '@material-ui/core';
import compose from 'recompose/compose';
import * as Constants from "../../_constants/index"
import { ImageField } from 'ra-ui-materialui/lib/field/ImageField';
import RecentFilesSummary from './RecentFilesSummary';
import { ReferenceField } from 'ra-ui-materialui/lib/field';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { translate } from 'react-admin';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({

  container: {
    margin: '1em',
    textAlign: 'left',
    width: 'inherit',
  },
  dateLimitSelection: {
    float: 'right',
    fontSize: "1em",
    borderRadius: "4px",
    backgroundColor: "white",
    marginLeft: "-200px", //this prevents this element from extending the card to the right - there's a better way to do this.
  },
  dateLimitSelectionLabel: {
    float: 'right',
    fontSize: '1em',
  },
  headlineTop: {
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    backgroundColor: '#688db2',
    color: 'white',
    paddingLeft: '24px',
    paddingRight: '24px',
    paddingTop: '16px',
    paddingBottom: '16px',
    flexDirection: 'row',
    verticalAlign: "middle",

  },
  image: {
    height: `${Constants.AVATAR_HEIGHT}`,
  },
  listItemText: {
    paddingRight: 0,
  },
  projectName: {
    display: "inline-block",
  },
  recentFiles: {
    width: 'auto',
    height: "2em",
  },
  recentFilesText: {
    float: 'left',
  },
  tabs: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: "1.25em",
  },
  titleIcon: {
    marginRight: '8px',
    verticalAlign: "middle",
    height: "28px",
    width: "28px",
  },
  value: {
    padding: '0 16px',
    minHeight: 48,
  },
});

function RecentFilesDisplay({ projects, translate, classes }) {
  const [value, setValue] =  useState(null);

  useEffect(() => {
    const first = projects.findIndex((project) => project.files && project.files.length > 0)
    setValue(first)
  }, [])

  //TODO: these can and likely should be combined
  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (
    <Card className={classes.container}>

      <React.Fragment>
          <Typography
            className={classes.headlineTop}
            variant="h5"
            component="h5"
          >
            <ScheduleIcon className={classes.titleIcon} />
            {translate('en.dashboard.recentfiles')} 
          </Typography>
          
        {projects.length > 0 ? (
          <div>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="fullWidth"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
              className={classes.tabs}
            >
              {projects.map((item, i) => {
                return item.files && item.files.length > 0 &&
                  <Tab label={<React.Fragment><ReferenceField
                    record={item}
                    basePath={Constants.models.PROJECTS}
                    linkType={false}
                    source={Constants.model_fields.AVATAR}
                    reference={Constants.models.PROJECTAVATARS}
                    className={classes.projectName}
                    allowEmpty
                  >
                    <ImageField
                      classes={{ image: classes.image }}
                      source={Constants.model_fields.AVATAR_IMAGE}
                    />
                  </ReferenceField>{item.name}</React.Fragment>} value={i} key={item.id} className={classes.tabText}>
                  </Tab>
              })}
            </Tabs>
            {projects.map((item, i) => {
              return value === i && item.files && item.files.length > 0 && <RecentFilesSummary {...item} />;
            })}
          </div>) : <Typography>Loading Files...</Typography> //is this necessary?
        }
      </React.Fragment>
    </Card >

  );
}

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(RecentFilesDisplay);
