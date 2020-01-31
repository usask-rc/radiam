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
import GroupIcon from "@material-ui/icons/Group"
import CardIcon from "./CardIcon"
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

const NewGroups = ({ groups = [], nb, translate, classes }) => (
    <div className={classes.main}>
        <CardIcon Icon={GroupIcon} bgColor="cyan" />
        <Card className={classes.card}>
            <Typography className={classes.title} color="textSecondary">
                {translate("en.dashboard.new_groups")}
            </Typography>
            <Typography variant="h2" component="h2" className={classes.value}>
                {nb}
            </Typography>


            <Divider />
            <List>
                {groups.map(item => (
                    <ListItem
                        button
                        to={`/researchgroups/${item.id}/show`}
                        component={Link}
                        key={item.id}
                    >
                        <ListItemText
                            primary={`${item.name} - ${item.description}`}
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

export default enhance(NewGroups);