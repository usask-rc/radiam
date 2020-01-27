//Help.jsx
import React from 'react'
import { translate } from 'ra-core';
import { withStyles } from '@material-ui/styles';
import { connect } from "react-redux";
import { changeLocale } from "react-admin";
import compose from "recompose/compose";
import { changeTheme } from "./actions";
import Typography from "@material-ui/core/Typography"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import HelpOutline from '@material-ui/icons/HelpOutline';
import {RADIAMAGENTURL, SUPPORTEMAIL, USERMANUALFILENAME, USERMANUALPATH, RADIAMAGENTREADMEURL} from "../_constants/index";

const styles = {
    label: { width: "10em", display: "inline-block" },
    button: { margin: "1em" },
    link: {
        marginLeft: "0.5em",
    },
    titleIcon: {
        marginRight: '8px',
        marginBottom: '-5px',
        height: "28px",
        width: "28px",
    },
    inlineText: {
        display: "flex",
        flexDirection: "row",
        marginBottom: "1em",
    },
    container: {
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
    <>
    <Card className={classes.container}>
        <CardContent>
            <Typography className={classes.headlineTop} variant="h5" component="h5">
                <HelpOutline className={classes.titleIcon} />
                {translate('en.help.title')}
            </Typography>
            <Typography className={classes.subheader} variant="p" component="p">
                {translate('en.help.agentinstallation')}
            </Typography>
            
            <div className={classes.inlineText}>
                <Typography className={classes.content} variant="p" component="p">
                    {translate('en.help.download.text')}
                </Typography>
                <Typography  className={classes.link} variant="a" component="a" href={RADIAMAGENTURL} target="_blank" rel="noopener noreferrer">
                    {RADIAMAGENTURL}
                </Typography>
            </div>

            <Typography className={classes.subheader} variant="p" component="p">
                {translate('en.help.email.title')}
            </Typography>
            
            <div className={classes.inlineText}>
                <Typography className={classes.content} variant="p" component="p">
                    {translate('en.help.email.text')}
                </Typography>
                <Typography  className={classes.link} variant="a" component="a" href={`mailto:${SUPPORTEMAIL}`} target="_blank" rel="noopener noreferrer" >
                    {SUPPORTEMAIL}
                </Typography>
            </div>
            
            <div className={classes.inlineText}>
                <Typography className={classes.subheader} variant="p" component="p">
                    {translate('en.help.usermanual.title')}
                </Typography>
                <a href={`..${USERMANUALPATH}`} className={classes.link} target="_blank" rel="noopener noreferrer" >
                    {`${USERMANUALFILENAME}`}
                </a>
            </div>

            <Typography className={classes.subheader} variant="p" component="p">
                {translate('en.help.developers.title')}
            </Typography>

            <div className={classes.inlineText}>
                <Typography className={classes.content} variant="p" component="p">
                    {translate('en.help.developers.text')}
                </Typography>

                <Typography  className={classes.link} variant="a" component="a" href={RADIAMAGENTREADMEURL} target="_blank" rel="noopener noreferrer" >
                    {RADIAMAGENTREADMEURL}
                </Typography>
            </div>

        </CardContent>
    </Card>
    </>
)
const mapStateToProps = state => ({
    theme: state.theme,
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
