# Radiam Web GUI

The Administration GUI for viewing and updating Project metadata, configuring user and group access, creating and editing project and dataset details, and editing ISO metadata fields.

## Compatible Browsers

This Web GUI has been tested with and is functional with Safari, Chrome, Chromium browsers, and Firefox.

## Administration Functionality 

### Permissions / Visibility Access Overview

Unless you are a Superuser, you do not have visibility on the entirety of application data.

View Access in the Radiam GUI is extended only as far as a user's relation to their assigned groups, as determined in the `Group Memberships` table, plus whatever `Datasets` they have been granted access to via the `Group View Grants` table.

A user who is a Group Admin, Data Manager, or Member of some group as assigned in the Group Memberships table has visibility on that Group's Project data.  Group Admins and Data Managers have differing sets to permissions on different models, while the `Member` role exists as an additional configurable role to be set by the end user.

The permissions for Group Admins and Data Managers can be seen [Here](https://docs.google.com/document/d/1YELWSqKO60drenHRVY3HGH8hvYlZA5N3a90txVYCM_Q/edit?usp=sharing)

###Note - this link above is temporary until it is converted into markdown.


### Order of operations for first-time use:

//TODO

## Non-Administration Functionality

### Geolocation View (Projects / Datasets / Groups)

The GeoJSON view is built on [Leaflet.js](https://leafletjs.com/) and allows you to associate some GeoJSON-compliant data with a Project, Dataset, or Group.  This can include a polygon of a region of study, key value pairs, timestamps.  It does not currently contain the ability to enter nested JSON.

The ability to enter JSON into a map / data model directly via a text field was previously implemented but removed functionality.  It can be seen [here](https://github.com/usask-rc/radiam/commit/f40a8606269c1932ebeca1287ed6bd524aafca14)

The Map View's Tile Set can be changed as well - read the Leaflet documentation to learn more about this.


### Files View (Projects)

The Files view is built with two assumptions made of the API.

1. Each record crawled by the `Radiam Agent` contains correct `path_parent`, `location`, and `type` data.

2. Records at the root directory contain a `path_parent` value of `.`.

With these two assumptions, we can build our directory structure level by level by querying ElasticSearch for files matching `path_parent` and `location`, so long as we maintain an API connection (something which React-Admin requires).  Text in the Search bar is thrown into this ElasticSearch query to request a fulltext search.

### Files View (Datasets)

The above assumptions made in Projects fall apart in the Datasets view, as a Dataset is a subset of some project's files at some location.  Since the typical use of a Dataset is as a sub-folder of some Project, we cannot make the same assumption that the value of `path_parent` is going to be `.`, nor can we know what Location the user wants to query at as this is (sadly) not a record stored in the Datasets table.

Instead, we have the `search_model` field.  this field contains the ElasticSearch query that was used to generate this dataset, the one you would see at `/api/datasets/${DATASET_ID}/search`.  This query should for the most part, contain the values of `path_parent` and `location` that we want, so our assumptions for Datasets are:

1. The `search_model` field is valid JSON that at minimum contains some values `path_parent` and `location` in the expected format below: (Note that upon clicking the `Create New Dataset` button in the Files view, this information will automatically be filled in to the Search Model field)

```
search_model = {
    "bool" : {
      "must" : {
        "wildcard" : { "path_parent.keyword" : "/some_directory*" }
      },
      "filter": {
        "term" : { "location.keyword" : "SOME_LOCATION_ID" }
      }
    }
  }
}
```

2. The Project that this Dataset is a subset of follows rules 1 and 2 in the previous section.

3. The Dataset files contained in said query exist in a contiguous tree structure (ie, there must be a traceable path_parent record between all files in this Dataset).  This is not a worry if the user is not entering custom data into the `search_model` field.


If these requirements are satisfied, the root of the file metadata shown in the Dataset's Files page will be rooted at the value of `path_parent` and only show items from the appropriate `Location` value, and the query for said data will run akin to how Projects are queried.

If these requirements are not satisfied, but the JSON in `search_model` is indeed valid and files do exist in the dataset's `/search` endpoint, the root folder will still be visible and all files will still be searchable - it will simply query all files in the dataset and determine the root of said dataset.  This is a much lengthier and resource heavy operation than above, especially with many files.


### Outstanding Issues

-Firefox users may experience memory leaks - I have not experienced this lately, but it has not been knowingly resolved.

-Being logged in to the Django Web Interface (seen at `https://YOUR_RADIAM_INSTANCE.ca/api`) as well as the Radiam GUI simultaneously will cause authentication issues when attempting to POST or GET certain items.

-If you are hosting an instance of Radiam on your local machine (ex - at `https://localhost:8100/api`) and you attempt to send a password reset query, it will not work - however, your token will print out in your server log, and you will be able to enter it at `https://YOUR_RADIAM_INSTANCE.ca/reset/YOUR_TOKEN/` to reset your password.

## GUI Core Dependencies

The Radiam Web GUI is built in [React 16.9](https://github.com/facebook/react/blob/master/CHANGELOG.md#1690-august-8-2019) on top of a Framework called [React-Admin](https://marmelab.com/react-admin/Readme.html).  

### React-Admin

React-Admin takes responsibility for much of the data storage and update hooks used throughout the application, which are (mostly) routed through either `radiamRestProvider.js` or `authProvider.js`.  The former assists with translating GET/POST queries into a format readable by the API and formatting the downstream data.  The latter is largely used for authentication purposes.  Both contain a reference to `httpClient.jsx` which is where the authentication function is sourced.

React-Admin demands a strict format in `App.jsx` and has trouble rendering pages without authentication (ex: the Password Reset / and First-time Password Set pages).  It does not provide an easy way to force display or suppression of a warning message, hence the package `react-toastify` also being used.

In return, React-Admin provides enforced JWT authentication, a nice-looking page outline, can predict model forms based on provided JSON, provides a theming template and a translation model using `i18n`, and is based on React 16 and as such supports React 16 features such as `Hooks`.  Its form functionality is based upon React Final Form, formerly known as Redux-Form.  You can read more about React-Admin Tags and their usage in the link above. 

### [Leaflet](https://leafletjs.com/) / [React-Leaflet](https://react-leaflet.js.org/) / [React-Leaflet-Draw](https://github.com/alex3165/react-leaflet-draw)

Leaflet is used to populate and enter Geolocation data on the Location, Project, and Dataset forms.  The Geolocation data these plugins provide is optional in said forms (however, valid JSON is required on PUT to said endpoints)

React-Leaflet is a bit finnicky in a few ways.  The only data display and entry types available to us are Points, LineStrings, and Polygons.  This is a limitation of React-Leaflet that likely could be danced around if you were to use pure Leaflet.js.  Rendering data of type MultiPoint, MultiLineString, or MultiPolygon will work (provided you provide the proper display type to it), but React-Leaflet (and by extension React-Leaflet-Draw) does not have the capability to properly edit these data types.

Leaflet maps also repeat longitudinally, and use what you might think would be a flipped coordinate system, but validly conforms to [RFC7946](https://tools.ietf.org/html/rfc7946)

### Others

Most other core packages are either fairly standard in React (material-ui, moment, jest, lodash, webpack) or are used in ways that their functionality is explicitly clear.  Also note that it's likely that there are packages in `package.json` that are no longer required - I haven't quite gone through it with a fine tooth comb.

