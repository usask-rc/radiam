import React, { Component } from 'react';
import { Pagination } from "react-admin";

const FilePagination = props => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />
