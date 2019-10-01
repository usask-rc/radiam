import React, { useState } from 'react';
import { translate } from 'react-admin';
import {
  CardContent,
  Card,
  Typography,
} from '@material-ui/core';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router';
import * as Constants from '../../_constants/index';
import ProjectCardHeader from './ProjectCardHeader';
import ProjectKeywords from './ProjectKeywords';
import ProjectSearch from './ProjectSearch';

const styles = {
  headlineTop: {
    backgroundColor: '#688db2',
    color: 'white',
    marginLeft: '-24px',
    marginRight: '-24px',
    marginTop: '-16px !important;',
    marginBottom: '16px',
    paddingLeft: '24px',
    paddingRight: '24px',
    paddingTop: '16px',
    paddingBottom: '40px',
  },
  headerDiv: {
    float: 'left',
  },
  image: {
    height: `${Constants.AVATAR_HEIGHT}`,
    margin: '-6px 6px 0px 0px',
  },
  searchIcon: {
    height: '1em',
    width: '1em',
    marginTop: '1em',
  },
  searchArea: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  textTop: {
    color: 'white',
  },
  container: {
    margin: '1em',
    textAlign: 'center',
    minWidth: "20em",
  },
  fileCount: {
    textAlign: "right",
    color: "DarkGray"
  },
  chipItem: {
    margin: "0.25em"
  },
  chipContainer: {
    display: 'flex',
    width: 'inherit',
    alignItems: 'flex-end'
  },
  chipLabel: {
    color: "DarkGray",
    textAlign: "left",
    width: "inherit",
    alignItems: "start"
  }
};

const ProjectCardDisplay = ({ classes, project }) => {
  const [redirect, setRedirect] = useState(false);
  const [search, setSearch] = useState(null);

  function handleSearch(e) {
    setRedirect(true);
  }

  return (
    <Card className={classes.container}>
      <CardContent>
        <ProjectCardHeader classes={classes} project={project} />
        <Typography className={classes.chipLabel}>{`Keywords:`}</Typography>
        <ProjectKeywords classes={classes} project={project} />
        <ProjectSearch setSearch={setSearch} handleSearch={handleSearch} project={project} classes={classes} />
      </CardContent>
      {redirect && (
        <Redirect
          to={{
            pathname: `/projects/${project.id}/show/files`,
            state: { search: search },
          }}
        />
      )}
    </Card>
  );
};

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(ProjectCardDisplay);
