import React, { Component } from 'react'
import { translate } from 'ra-core';
import { withStyles } from '@material-ui/styles';
import { connect } from "react-redux";
import { changeLocale, Title } from "react-admin";
import compose from "recompose/compose";
import { changeTheme } from "./actions";
import { Typography, Card, CardContent, Divider } from '@material-ui/core';
import { HelpOutline } from '@material-ui/icons';



const styles = {
    label: { width: "10em", display: "inline-block" },
    button: { margin: "1em" },
    link: {
        marginLeft: "0.5em",
    },
    titleIcon: {
        marginRight: '8px',
        marginBottom: '-5px',
        height: "30px",
        width: "30px",
      },
    inlineText: {
        display: "flex",
        flexDirection: "row",
        marginBottom: "1em",
    },
    container: {
        margin: '1em',
        textAlign: 'left',
        minWidth: "20em",
      },
      subheader: {
          fontWeight: "bold"
      },
      content: {

      },
      headlineTop: {
          display: "flex",
        backgroundColor: '#688db2',
        color: 'white',
        marginLeft: '-24px',
        marginRight: '-24px',
        marginTop: '-16px !important;',
        marginBottom: '16px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingTop: '16px',
        paddingBottom: '16px',
      },
  };
  

const Help = ({ classes, translate }) => (
    <Card className={classes.container}>
        <CardContent>

            <Typography className={classes.headlineTop} variant="h5" component="h5">
                <HelpOutline className={classes.titleIcon} />
                {`Radiam Help`}
            </Typography>
            <Typography className={classes.subheader} variant="p" component="p">
                Agent Installation
            </Typography>
            
            <div className={classes.inlineText}>
                <Typography className={classes.content} variant="p" component="p">
                    {`The downloads for the Radiam agent are here: `}
                </Typography>
                <Typography  className={classes.link} variant="a" component="a" href="https://github.com/usask-rc/radiam-agent-releases" >
                {`https://github.com/usask-rc/radiam-agent-releases`}
                </Typography>
            </div>

            <Typography className={classes.subheader} variant="p" component="p">
                Email Support
            </Typography>
            
            <div className={classes.inlineText}>
                <Typography className={classes.content} variant="p" component="p">
                    {`For assistance using this specific installation of Radiam, please email: `}
                </Typography>
                <Typography  className={classes.link} variant="a" component="a" href="mailto:support@radiam.ca">
                    {`support@radiam.ca`}
                </Typography>
            </div>
            
            <div className={classes.inlineText}>
                <Typography className={classes.subheader} variant="p" component="p">
                    {`User Manual: `}
                </Typography>
                <Typography  className={classes.link} variant="a" component="a" href="../staticfiles/Radiam_user_manual.pdf">
                    {`Radiam_User_Manual.pdf`}
                </Typography>
            </div>

            <Typography className={classes.subheader} variant="p" component="p">
                {`Developer Resources`}
            </Typography>

            <div className={classes.inlineText}>
                <Typography className={classes.content} variant="p" component="p">
                    {`Developers can consult the Readme file located in the source repository: `}
                </Typography>

                <Typography  className={classes.link} variant="a" component="a" href="https://gitlab.com/usask-rc/radiam">
                    {`https://gitlab.com/usask-rc/radiam`}
                </Typography>
            </div>

        </CardContent>
    </Card>
)
const mapStateToProps = state => ({
    theme: state.theme,
    locale: state.i18n.locale
  });
  
  const enhance = compose(
    connect(
      mapStateToProps,
      {
        changeLocale,
        changeTheme
      }
    ),
    translate,
    withStyles(styles)
  );
  
  export default enhance(Help);
  