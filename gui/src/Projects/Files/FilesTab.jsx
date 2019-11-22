//FilesTab.jsx
import React, { useState, useEffect } from 'react';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Pagination, translate } from 'react-admin';
import Constants from '../../_constants/index';
import FileList from '../../_components/files/FileList';
import { Search } from '@material-ui/icons';

import { Select, MenuItem, TextField, Divider } from '@material-ui/core';
import { getProjectData } from '../../_tools/funcs';

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
  loading: {
    textAlign: "left",
  }
});
//TODO: indexed_date is currently the default display method, but should be passed into the files display as a parameter if coming from the button on the front page.
function FilesTab({ projectID, classes, translate, ...props }) {
  const [status, setStatus] = useState({ loading: true });
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
    e.preventDefault()
    setSearch(e.target.elements.search.value)
  };

  let _isMounted = false

  useEffect(() => {
    _isMounted = true
    const params = {
      q: search,
      id: projectID,
      pagination: { page: page, perPage: perPage },
      sort: { field: sort, order: order },
    };

    getProjectData(params).then(data => {
      if (_isMounted){
        setData(data)
        setStatus({loading: false})
      }
    }).catch(err => {
      setStatus({loading: false, error: err})
    })

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
    
  }, [search, page, perPage, sort, order]);

  //TODO: this is a mess - is there a way to slim this down?  I hate it.
  return (
    <div className={classes.main}>
      {data && data.files && (
        <form className={classes.flex} onSubmit={handleSubmit}>
          <TextField
            id={Constants.paths.SEARCH}
            name={Constants.paths.SEARCH}
            type={Constants.paths.SEARCH}
            className={classes.textField}
            defaultValue={search || ''}
            placeholder={`Search Files`}
          />
          <Search className={classes.searchIcon} />
          <Select
            id={'sort-select'}
            label={`Sort By`}
            className={classes.sortSelect}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {/* TODO: Translate has troubles with this component.  How to fix?  Probably through HOC*/}
            <MenuItem value={Constants.model_fields.INDEXED_DATE}>Indexed On</MenuItem>
            <MenuItem value={Constants.model_fields.LAST_MODIFIED}>Last Modified</MenuItem>
            <MenuItem value={Constants.model_fields.FILESIZE}>Filesize</MenuItem>
            <MenuItem value={Constants.model_fields.LAST_ACCESS}>Last Accessed</MenuItem>
          </Select>
        </form>
      )}
      <Divider />

      {status && status.loading ? (
        <Typography className={classes.loading}>{translate('en.loading')}</Typography>
      ) : status.error ? (
        <div className={classes.loading}>
        <Typography>{translate('en.loadingError')}</Typography>
        <Typography>{`${status.error}`}</Typography>
        </div>
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
      ) : !status.loading && search && data && data.files.length === 0 ? 
      <Typography className={classes.loading}>
        {`No Files were found matching Search String: ${search}`}
      </Typography>: null}
    </div>
  );
}

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(withRouter(FilesTab));
