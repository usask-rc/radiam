//Dashboard.jsx
import React, { PureComponent } from 'react';
import { getRecentProjects } from '../_tools/funcs';
import { Responsive } from 'react-admin';
import ProjectCards from "./ProjectCards/ProjectCards"
import WelcomeCards from './Welcome/WelcomeCards';
import { withStyles } from '@material-ui/styles';


const styles = theme => ({
  root: {
    marginTop: "1em",
  }
})

class Dashboard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { loading: true, hasFiles: false, managedGroups:{} };
  }

  //when component mounts, get the data we need to display on the front page.
  componentDidMount() {
    this.onMountAndRefresh()
  }

  onMountAndRefresh(){
    getRecentProjects().then(data => {
      this.setState(data)
      return data
    })
    .catch(err => {
      console.error("Error in getRecentProjects: ", err)
    })
  }

  componentDidUpdate(prevProps) {
    console.log("prev, cur props: ", prevProps, this.props)
    /*if (prevProps.views !== this.props.views) {
      this.onMountAndRefresh();
    }
    */
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
