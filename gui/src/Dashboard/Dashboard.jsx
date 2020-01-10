//Dashboard.jsx
import React, { PureComponent } from 'react';
import { getRecentProjects } from '../_tools/funcs';
import { Responsive } from 'react-admin';
import ProjectCards from "./ProjectCards/ProjectCards"
import WelcomeCards from './Welcome/WelcomeCards';
import { withStyles } from '@material-ui/styles';


const styles = theme => ({
  root: {

  }
})

class Dashboard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { loading: true, hasFiles: false, managedGroups:{} };
  }

  //when component mounts, get the data we need to display on the front page.
  componentDidMount() {
    getRecentProjects().then(data => {
      this.setState(data)
    })
    .catch(err => {
      console.error("Error in getRecentProjects: ", err)
    })
  }

  render() {
    const {classes, permissions} = this.props
    const { loading, hasFiles, projects } = this.state
    if (permissions){
      return (
        <div className={classes.root}>
          <Responsive
            medium={
              <>
                <WelcomeCards loading={loading} hasFiles={hasFiles}  />
                {!loading &&
                  <>
                    <ProjectCards projects={projects} />
                  </>
                }
              </>
            }
          />
        </div>
      );
    }
    else{
      return (<>{`Loading...`}</>)
    }
  }
}

export default withStyles(styles)(Dashboard);
