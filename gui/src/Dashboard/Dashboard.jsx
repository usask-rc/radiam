//Dashboard.jsx
import React, { PureComponent } from 'react';
import { GET_LIST } from 'react-admin';
import { httpClient, radiamRestProvider } from '../_tools';
import { getAPIEndpoint } from '../_tools/funcs';
import { Responsive } from 'react-admin';
import * as Constants from '../_constants/index';
import ProjectCards from "./ProjectCards/ProjectCards"
import moment from 'moment';
import WelcomeCards from './Welcome/WelcomeCards';
import { withStyles } from '@material-ui/styles';


const styles = theme => ({
  root: {

  }
})

class Dashboard extends PureComponent {
  constructor(props) {
    super(props);
    console.log("props of dashboard are: ", props)
    this.state = { loading: true, hasFiles: false, managedGroups:{} };
  }

  //this gets all projects that the user has worked on.
  //we want to get all (recent) files in a project and display them in an expandable listview.
  //TODO: handle potential setstate on unmounted component
  getRecentProjects = () => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    const now = moment();
    const { hasFiles } = this.state

    let projectCtr = 0
    let projectList = []

    dataProvider(GET_LIST, Constants.models.PROJECTS, {
      order: { field: Constants.model_fields.NAME },
      pagination: { page: 1, perPage: 1000 }, //TODO: this needs some sort of expandable pagination control for many files in a folder.
    })
      .then(response => response.data)
      .then(projects => {

        //Get the files from each project
        //TODO: once we can search we can search files on age range and avoid this entire filtering process
        projects.map(project => {

          //get the most recent file to display it
          dataProvider(
            "GET_FILES",
            Constants.models.PROJECTS + '/' + project.id,
            {
              sort: {
                field: Constants.model_fields.INDEXED_DATE,
                order: '-',
              },
              pagination: {
                page: 1,
                perPage: 1,
              },
            }
          //TODO: on a response code 500, there are no files for that project.  Something more elegant than an error should be put here.
          ).then(response => {
            const newProject = project
            newProject.nbFiles = response.total;
            newProject.recentFile = response.data[0]
            if (newProject.recentFile){
              const timeDiff = now.diff(moment(newProject.recentFile.indexed_date).toISOString(), 'days')
              newProject.daysOld = timeDiff
              newProject.recentFile.timeAgo = `${timeDiff} days ago`

              if (!hasFiles){
                this.setState({hasFiles: true})
              }
            }
            
            projectCtr += 1
            projectList.push(newProject)

            if (projectCtr === projects.length)
            {
              this.setState({ projects: projectList, loading:false });
            }

          }).catch(error => {
            projectCtr += 1
            if (projectCtr === projects.length)
            {
              this.setState({ projects: projectList, loading:false });
            }
          });
          return project;
        });
      });
  };

  //when component mounts, get the data we need to display on the front page.
  componentDidMount() {
    this.getRecentProjects();
  }

  render() {
    const {classes} = this.props
    const { loading, hasFiles, projects } = this.state
    return (
      <div className={classes.root}>
      <Responsive
        medium={
          <React.Fragment>
            <WelcomeCards loading={loading} hasFiles={hasFiles}  />
            {!loading &&
              <React.Fragment>
                <ProjectCards loading={loading} projects={projects} />
              </React.Fragment>
            }
          </React.Fragment>
        }
      />
      </div>
    );
  }
}

export default withStyles(styles)(Dashboard);
