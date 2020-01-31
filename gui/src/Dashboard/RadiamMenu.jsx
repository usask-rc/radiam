import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import inflection from 'inflection';
import compose from 'recompose/compose';
import { withStyles, createStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import { getResources, translate } from 'ra-core';
import DefaultIcon from '@material-ui/icons/ViewList';

import CustomDashboardMenuItem from "./CustomDashboardMenuItem"
import {MenuItemLink, Responsive} from "react-admin"

const styles = createStyles({
    main: {
        marginTop: "0.5em",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
});

const translatedResourceName = (resource, translate) =>
    translate(`resources.${resource.name}.name`, {
        smart_count: 2,
        _:
            resource.options && resource.options.label
                ? translate(resource.options.label, {
                    smart_count: 2,
                    _: resource.options.label,
                })
                : inflection.humanize(inflection.pluralize(resource.name)),
    });

const RadiamMenu = ({
    classes,
    className,
    dense,
    hasDashboard,
    onMenuClick,
    open,
    pathname,
    resources,
    translate,
    logout,
    ...rest
}) => {
    console.log("radiammenu ...rest is: ", rest)
    return(
    <div className={classnames(classes.main)} {...rest}>
        <CustomDashboardMenuItem onClick={onMenuClick} />
        {resources
            .filter(r => r.hasList)
            .map(resource => (
                <MenuItemLink
                    key={resource.name}
                    to={`/${resource.name}`}
                    primaryText={translatedResourceName(resource, translate)}
                    leftIcon={
                        resource.icon ? <resource.icon /> : <DefaultIcon />
                    }
                    onClick={onMenuClick}
                    dense={dense}
                />
            ))}
        <Responsive xsmall={logout} medium={null} />
    </div>
)};

RadiamMenu.propTypes = {
    classes: PropTypes.object,
    className: PropTypes.string,
    dense: PropTypes.bool,
    hasDashboard: PropTypes.bool,
    logout: PropTypes.element,
    onMenuClick: PropTypes.func,
    open: PropTypes.bool,
    pathname: PropTypes.string,
    resources: PropTypes.array.isRequired,
    translate: PropTypes.func.isRequired,
};

RadiamMenu.defaultProps = {
    onMenuClick: () => null,
};

const mapStateToProps = state => ({
    open: state.admin.ui.sidebarOpen,
    resources: getResources(state),
    pathname: state.router.location.pathname, // used to force redraw on navigation
});

const enhance = compose(
    translate,
    connect(
        mapStateToProps,
        {}, // Avoid connect passing dispatch in props,
        null,
        {
            areStatePropsEqual: (prev, next) =>
                prev.resources.every(
                    (value, index) => value === next.resources[index] // shallow compare resources
                ) &&
                prev.pathname === next.pathname &&
                prev.open === next.open,
        }
    ),
    withStyles(styles)
);

export default enhance(RadiamMenu);