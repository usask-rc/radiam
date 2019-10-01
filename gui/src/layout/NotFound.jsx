// in src/NotFound.js
import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { Typography } from '@material-ui/core';

export default () => (
    <Card>
        <Title title="Not Found" />
        <CardContent>
            <Typography>404: Page not found</Typography>
        </CardContent>
    </Card>
);