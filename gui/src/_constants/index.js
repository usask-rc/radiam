module.exports = Object.freeze({
  API_ENDPOINT: "api",
  API_PORT: "8100",
  AVATAR_HEIGHT: "36px",
  I18N_TLE: "en", //TODO: modularize this or remove it.
  RECENTFILESLIMIT: 30, //This is the amount of days within which we should display uploaded files.
  ROLE_ANONYMOUS: "anonymous",
  ROLE_DATA_MANAGER: "c4e21cc8-a446-4b38-9879-f2af71c227c3",
  ROLE_GROUP_ADMIN: "a59be619-fd9b-462b-8643-486e68f38613",
  ROLE_MEMBER: "bb7792ee-c7f6-4815-ae24-506fc00d3169",
  LOCATIONTYPE_OSF: "6ebfd637-c40b-4486-9cf5-b0b976f51de5",
  ROLE_USER: "user",
  OSMTILEURL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  RADIAMAGENTURL: "https://github.com/usask-rc/radiam-agent-releases",
  RADIAMAGENTREADMEURL: "https://github.com/usask-rc/radiam",
  WEBTOKEN: "token",
  SUPPORTEMAIL: "support@radiam.ca",
  USERMANUALPATH: "/staticfiles/Radiam_user_manual.pdf",
  USERMANUALFILENAME: "Radiam_user_manual.pdf",
  FIELDS: {
    PASSWORD: "password",
    SUBMIT: "submit"
  },
  METHODS: {
    POST: "POST",
    GET: "GET",
    PUT: "PUT",
    DELETE: "DELETE",
  },
  RESOURCE_OPERATIONS: {
    SHOW: "show",
    LIST: "list",
    EDIT: "edit"
  },
  LOGIN_DETAILS: {
    USERNAME: "username",
    EMAIL: "email",
    PASSWORD: "password",
    PASSWORD_CONFIRM: "confirmPassword"
  },
  PASSWORD_CHANGE: {
    PASSWORD_OLD: "old_password",
    PASSWORD_CONFIRM: "confirm_password",
    PASSWORD_NEW: "new_password"
  },
  PATHS:{
    SET_PASSWORD: "set_password",
    SEARCH: "search",
  },
  MODELS: {
    AGENTS: "useragents",
    DATA_COLLECTION_METHOD: "datacollectionmethod",
    DATA_COLLECTION_STATUS: "datacollectionstatus",
    DATASETS: "datasets",
    DISTRIBUTION_RESTRICTION: "distributionrestriction",
    GRANTS: "groupviewgrants",
    GROUPMEMBERS: "groupmembers",
    GROUPS: "researchgroups",
    LOCATIONS: "locations",
    LOCATIONTYPES: "locationtypes",
    PROJECTSENSITIVITY: "projectsensitivity",
    PROJECTDATACOLLECTIONMETHOD: "projectdatacollectionmethod",
    PROJECTAVATARS: "projectavatars",
    PROJECTS: "projects",
    ROLES: "grouproles",
    SENSITIVITY_LEVEL: "sensitivitylevel",
    USERS: "users",
  },
  //this exists to help turn foreign key references into their model endpoint counterparts.
  MODEL_FK_FIELDS: {
    AGENT: "agent",
    DATA_COLLECTION_STATUS: "data_collection_status",
    DATA_COLLECTION_METHOD: "data_collection_method",
    DATASET: "dataset",
    DISTRIBUTION_RESTRICTION: "distribution_restriction",
    GROUP_ROLE: "group_role",
    GROUP: "group",
    LOCATION: "location",
    LOCATION_TYPE: "location_type",
    PARENT_GROUP: "parent_group",
    PRIMARY_CONTACT_USER: "primary_contact_user",
    PROJECT: "project",
    USER: "user",
    SENSITIVITY: "sensitivity",
  },
  //this needs renaming but I can't quite figure what it should be called.  This dict is for getting all foreign key labels in a given model.
  FK_FIELDS: {
    RESEARCHGROUPS: ["parent_group"],
    USERAGENTS: ["user", "location"],
    GROUPMEMBERS: ["user", "group", "group_role"],
    GROUPVIEWGRANTS: ["group", "project"],
    LOCATIONS: ["location_type"],
    PROJECTS: [
      "group",
      "primary_contact_user",
      "data_collection_status",
      "distribution_restriction"
    ],
    PROJECTSENSITIVITY: [
      "project", "sensitivity"
    ],
    PROJECTDATACOLLECTIONMETHOD: [
      "project", "datacollectionmethod"
    ]
  },
  //storage for individual reference fields for data models.
  MODEL_FIELDS: {
    ABSTRACT: "abstract",
    ACTIVE: "is_active",
    AVATAR: "avatar",
    AVATAR_IMAGE: "avatar_image",
    CREATED_AT: "date_created",
    DATA_COLLECTION_METHOD: "data_collection_method",
    DATA_COLLECTION_STATUS: "data_collection_status",
    DATE_EXPIRES: "date_expires",
    DATE_STARTS: "date_starts",
    DATE_UPDATED: "date_updated",
    DESCRIPTION: "description",
    DISPLAY_NAME: "display_name",
    DISTRIBUTION_RESTRICTION: "distribution_restriction",
    EMAIL: "email",
    FIELDS: "fields",
    FILES: "files",
    FILESIZE: "filesize",
    FIRST_NAME: "first_name",
    GROUP: "group",
    HOST_NAME: "host_name",
    ID: "id",
    INDEXED_DATE: "indexed_date",
    KEYWORDS: "keywords",
    LABEL: "label",
    LAST_ACCESS:"last_access",
    LAST_MODIFIED: "last_modified",
    TRANSLATENAME: "translatename",
    LAST_NAME: "last_name",
    LOCATION: "location",
    LOCATION_TYPE: "location_type",
    NAME: "name",
    NOTES: "notes",
    ORCID_ID: "user_orcid_id",
    PRIMARY_CONTACT_USER: "primary_contact_user",
    PROJECT: "project",
    PROJECT_CONFIG_LIST: "project_config_list",
    REMOTE_USER: "remote_user",
    SENSITIVITY_LEVEL: "sensitivity_level",
    STUDY_SITE: "study_site",
    TITLE: "title",
    USERNAME: "username",
  },
  SORT_FIELDS: {
    ASCENDING: "ASC",
    DESCENDING: "DESC",
  },
  ROLE_LABELS: {
    ADMIN: "Group Admin",
    DATA_MANAGER: "Data Manager",
    MEMBER: "Member",
    UNKNOWN: "Unknown"
  },
  //the place to put these is probably in en.js - however, I'm not too keen on having to import translate into more places.
  //these are error / warning messages for form or api failures.
  WARNINGS: {
    TOO_MANY_ROLES: "This user is already assigned a role in this group. Only one role is allowed per group.",
    UNSAVED_CHANGES: "This form contains unsaved changes.  Leave without saving?",
    NO_AUTH_TOKEN: "No authentication token detected.  Returning to the login page.  Please login and try again.",
    NO_CONNECTION: "Could not connect to the API.  Please refresh the page and try again.",
  }
});
