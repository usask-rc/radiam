import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
//import { useDispatch } from 'react-redux';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import HideOnScroll from "./HideOnScroll.tsx"
import { CustomUserMenu } from './RadiamAppBar';
import RadiamLogo from './RadiamLogo';

const useStyles = makeStyles(
    theme => ({
        appBar: {
            height: "5em",
        },
        logo: {
        },
        toolbar: {
            paddingRight: 24,
        },
        menuButton: {
            marginLeft: '0.5em',
            marginRight: '0.5em',
        },
        menuButtonIconClosed: {
            transition: theme.transitions.create(['transform'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            transform: 'rotate(0deg)',
        },
        menuButtonIconOpen: {
            transition: theme.transitions.create(['transform'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            transform: 'rotate(180deg)',
        },
        title: {
            flex: 1,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
    }),
    { name: 'RaAppBar' }
);

const AppBar = ({
    children,
    classes: classesOverride,
    className,
    logo,
    logout,
    open,
    title,
    userMenu,
    ...rest
}) => {
    const classes = useStyles({ classes: classesOverride });
    //const dispatch = useDispatch();
    const isXSmall = useMediaQuery(theme => theme.breakpoints.down('xs'));

    return (
        <HideOnScroll>
            <MuiAppBar >
                <RadiamLogo className={classes.logo} />

                <Toolbar
                    disableGutters
                    variant={isXSmall ? 'regular' : 'dense'}
                    className={classes.toolbar}
                >
                    {Children.count(children) === 0 ? (
                        <Typography
                            variant="h6"
                            color="inherit"
                            className={classes.title}
                            id="react-admin-title"
                        />
                    ) : (
                        children
                    )}
                    {cloneElement(userMenu, { logout })}
                </Toolbar>
            </MuiAppBar>
        </HideOnScroll>
    );
};

AppBar.propTypes = {
    children: PropTypes.node,
    classes: PropTypes.object,
    className: PropTypes.string,
    logout: PropTypes.element,
    open: PropTypes.bool,
    userMenu: PropTypes.element,
};

AppBar.defaultProps = {
    userMenu: <CustomUserMenu />,
};

export default AppBar;