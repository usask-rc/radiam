import React, { Component } from 'react';
import { GET_LIST } from 'react-admin';
import { httpClient, radiamRestProvider } from '../_tools';
import { getAPIEndpoint } from '../_tools/funcs';
import { Responsive } from 'react-admin';
import * as Constants from '../_constants/index';
import ProjectCards from "./ProjectCards/ProjectCards"
import moment from 'moment';
import WelcomeGrid from './Welcome/WelcomeCards';
import RecentFiles from './RecentFiles/RecentFiles';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    console.log("props of dashboard are: ", props)
    this.state = { loading: true, hasFiles: false };
  }

  getRecentUsers = () => {
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

    dataProvider(GET_LIST, Constants.models.USERS, {
      filter: { date_created: lastMonth.toISOString(), is_active: true },
      sort: { field: Constants.model_fields.EMAIL, order: 'DESC' },
      pagination: { page: 1, perPage: 5 }, //TODO: pagination does not work unless maybe via docker
    })
      .then(response => response.data)
      .then(newUsers => {
        this.setState({ newUsers });
        this.setState({ nbNewUsers: newUsers.reduce(nb => ++nb, 0) });
      });
  };

  getRecentGroups = () => {
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

    dataProvider(GET_LIST, Constants.models.GROUPS, {
      filter: {
        is_active: true,
      },
      sort: { field: Constants.model_fields.NAME, order: 'DESC' },
      pagination: { page: 1, perPage: 10 },
    })
      .then(response => response.data)
      .then(newGroups => {
        this.setState({ newGroups });
        this.setState({ nbNewGroups: newGroups.reduce(nb => ++nb, 0) });
      });
  };

  //this gets all projects that the user has worked on.
  //we want to get all (recent) files in a project and display them in an expandable listview.
  getRecentProjects = (dateLimit = 21) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

    dataProvider(GET_LIST, Constants.models.PROJECTS, {
      order: { field: Constants.model_fields.NAME },
      pagination: { page: 1, perPage: 1000 }, //TODO: this needs some sort of expandable pagination control for many files in a folder.
    })
      .then(response => response.data)
      .then(projects => {
        projects.map(project => {
          dataProvider(
            GET_LIST,
            Constants.models.PROJECTS + '/' + project.id + '/search',
            {
              sort: {
                field: Constants.model_fields.INDEXED_DATE,
                order: 'DESC',
              },
              pagination: {
                page: 1,
                perPage: 25,
              },
            }
          ) //TODO: on a response code 500, there are no files for that project.  Something more elegant than an error should be put here.
            .then(response => {
              project.nbFiles = response.total;

              return response.data;
            })
            .then(docs => {

              const now = moment();

              project.files = docs.filter(file => {
                const date_indexed = moment(file.indexed_date).toISOString();

                const timeDiff = now.diff(date_indexed, 'days');
                if (timeDiff > dateLimit) {
                  console.log(`greater than ${dateLimit} days, removing from recent list`);
                }
                else {
                  return file
                }
                return null
              });

              this.setState({ loading: false, hasFiles: docs.length > 0 ? true : this.state.hasFiles });
            })
            .catch(error => {
              console.log('error in getrecentproj is: ', error);
            });
          return project;
        });
        this.setState({ projects });
      });
  };

  //when component mounts, get the data we need to display on the front page.
  componentDidMount() {
    //this.getRecentUsers();
    //this.getRecentGroups();
    this.getRecentProjects();
  }

  handleDateLimitChange = daysSince => {
    this.getRecentProjects(daysSince)
  };

  render() {
    return (
      <Responsive
        medium={
          <React.Fragment>
            <WelcomeGrid />
            {!this.state.loading &&
              <React.Fragment>
                <ProjectCards {...this.state} />
                <RecentFiles {...this.state} handleDateLimitChange={this.handleDateLimitChange} />
              </React.Fragment>
            }
          </React.Fragment>
        }
      />
    );
  }
}

export default Dashboard;
