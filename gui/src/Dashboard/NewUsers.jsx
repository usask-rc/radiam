import React from 'react';
import compose from 'recompose/compose';
import Card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { Link } from 'react-router-dom';
import { translate } from 'react-admin';
import UserIcon from "@material-ui/icons/PersonAdd";
import CardIcon from "./CardIcon";
import {MODELS, RESOURCE_OPERATIONS} from "../_constants/index"

const styles = theme => ({
    main: {
        flex: '1',
        marginLeft: '1em',
        marginTop: 20,
    },
    card: {
        padding: '16px 0',
        overflow: 'inherit',
        textAlign: 'right',
    },
    title: {
        padding: '0 16px',
    },
    value: {
        padding: '0 16px',
        minHeight: 48,
    },
    listItemText: {
        paddingRight: 0,
    },
});

const NewUsers = ({ users = [], nb, translate, classes }) => (
    <div className={classes.main}>
        <CardIcon Icon={UserIcon} bgColor="#4caf50" />
        <Card className={classes.card}>
            <Typography className={classes.title} color="textSecondary">
                {translate("en.dashboard.new_users")}
            </Typography>
            <Typography variant="h2" component="h2" className={classes.value}>
                {nb}
            </Typography>
            <Divider />
            <List>
                {users.map(user => (
                    <ListItem
                        button
                        to={`/${MODELS.USERS}/${user.id}/${RESOURCE_OPERATIONS.SHOW}`}
                        component={Link}
                        key={user.id}
                    >
                        <ListItemText
                            primary={`${user.username} - ${user.email}`}
                            className={classes.listItemText}
                        />
                    </ListItem>
                ))}
            </List>
        </Card>
    </div>
);

const enhance = compose(
    withStyles(styles),
    translate
);

export default enhance(NewUsers);