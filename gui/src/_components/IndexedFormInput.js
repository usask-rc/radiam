import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withStyles, createStyles } from '@material-ui/core/styles';

import { Labeled } from 'react-admin';

import { Typography } from "@material-ui/core";

const sanitizeRestProps = ({ basePath, record, ...rest }) => rest;

const styles = theme =>
    createStyles({
        input: { width: theme.spacing.unit * 32 },
    });

export const IndexedFormInput = ({ classes, input, index, member, ...rest }) =>
    input ? (
        <div
            className={classnames(
                'ra-input',
                `ra-input-${input.props.source}`,
                input.props.formClassName
            )}
        >
            {input.props.addLabel ? (
                <Labeled
                    id={input.props.id || input.props.source}
                    {...input.props}
                    {...sanitizeRestProps(rest)}
                >
                    {React.cloneElement(input, {
                        className: classnames(
                            {
                                [classes.input]: !input.props.fullWidth,
                            },
                            input.props.className
                        ),
                        id: input.props.id || input.props.source,
                        ...rest,
                    })}
                </Labeled>
            ) : (
                React.cloneElement(input, {
                    className: classnames(
                        {
                            [classes.input]: !input.props.fullWidth,
                        },
                        input.props.className
                    ),
                    id: input.props.id || input.props.source,
                    ...rest,
                })
            )}
        </div>
    ) : null;

IndexedFormInput.propTypes = {
    className: PropTypes.string,
    classes: PropTypes.object,
    input: PropTypes.object,
};

// wat? TypeScript looses the displayName if we don't set it explicitly
IndexedFormInput.displayName = 'IndexedFormInput';

export default withStyles(styles)(IndexedFormInput);
