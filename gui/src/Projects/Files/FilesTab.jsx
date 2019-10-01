import React, { useState, useEffect } from 'react';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Pagination, translate, GET_LIST } from 'react-admin';
import { radiamRestProvider, getAPIEndpoint, httpClient } from '../../_tools';
import Constants from '../../_constants/index';
import FileList from '../../_components/files/FileList';
import { Search } from '@material-ui/icons';

import { Select, MenuItem, TextField, Divider } from '@material-ui/core';

const styles = theme => ({
  main: {
    flex: '1',
    marginLeft: '2em',
    marginRight: '2em',
    marginTop: 20,
    textAlign: 'right',
  },
  sortSelect: {
    textAlign: 'right',
  },
  flex: {
    display: 'flex',
    alignItems: 'flex-end',
  },
});
//TODO: indexed_date is currently the default display method, but should be passed into the files display as a parameter if coming from the button on the front page.
function FilesTab({ projectID, classes, ...props }) {
  const [status, setStatus] = useState({ loading: true });
  const [searchField, setSearchField] = useState('');
  const [data, setData] = useState({ files: [] });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [order, setOrder] = useState('DESC'); //in case we ever want to be able to toggle asc/desc sorted values
  const [search, setSearch] = useState(
    (props &&
      props.location &&
      props.location.state &&
      props.location.state.search) ||
    null
  );
  const [sort, setSort] = useState(
    (props &&
      props.location &&
      props.location.state &&
      props.location.state.sortType) ||
    'last_modified'
  );

  const handleSubmit = e => {
    setSearch(searchField);
  };

  const handleChange = e => {
    setSearchField(e.target.value);
  };

  const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

  useEffect(() => {
    const params = {
      q: search,
      id: projectID,
      pagination: { page: page, perPage: perPage },
      sort: { field: sort, order: order },
    };

    const fetchData = async () => {
      await dataProvider(
        GET_LIST,
        Constants.models.PROJECTS + '/' + projectID + '/search',
        params
      )
        .then(response => {
          setData({ files: response.data, nbFiles: response.total });
          setStatus({ loading: false });
        })
        .catch(error => {
          setStatus({ loading: false, error: error });
        });
    };
    fetchData();
  }, [search, page, sort, order]);

  return (
    <div className={classes.main}>
      {data && data.files && (
        <form className={classes.flex} onSubmit={handleSubmit}>
          <React.Fragment>
            <TextField
              id={'search'}
              type={'search'}
              className={classes.textField}
              defaultValue={search || ''}
              placeholder={`Search Files`}
              onChange={handleChange}
            />
            <Search className={classes.searchIcon} />
          </React.Fragment>
          <Select
            id={'sort-select'}
            label={`Sort By`}
            className={classes.sortSelect}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {/* TODO: Translate has troubles with this component.  How to fix?  Probably through HOC*/}
            <MenuItem value="indexed_date">Indexed On</MenuItem>
            <MenuItem value="last_modified">Last Modified</MenuItem>
            <MenuItem value="filesize">Filesize</MenuItem>
            <MenuItem value="last_access">Last Accessed</MenuItem>
          </Select>
        </form>
      )}
      <Divider />

      {status && status.loading ? (
        <Typography>{`Loading File Data...`}</Typography>
      ) : status.error ? (
        <Typography>{`Error loading information: ${status.error}`}</Typography>
      ) : data && data.files && data.files.length > 0 ? (
        <React.Fragment>
          <FileList data={data.files} />
          <Pagination
            page={page}
            perPage={perPage}
            setPage={setPage}
            setPerPage={setPerPage}
            rowsPerPageOptions={[25, 50, 100]}
            total={data.nbFiles}
          />
        </React.Fragment>
      ) : null}
    </div>
  );
}

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(withRouter(FilesTab));
