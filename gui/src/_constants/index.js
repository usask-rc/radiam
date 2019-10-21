module.exports = Object.freeze({
  API_ENDPOINT: "api",
  API_PORT: "8100",
  AVATAR_HEIGHT: "36px",
  I18N_TLE: "en", //TODO: modularize this or remove it.
  ROLE_ANONYMOUS: "anonymous",
  ROLE_DATA_MANAGER: "c4e21cc8-a446-4b38-9879-f2af71c227c3",
  ROLE_GROUP_ADMIN: "a59be619-fd9b-462b-8643-486e68f38613",
  ROLE_MEMBER: "bb7792ee-c7f6-4815-ae24-506fc00d3169",
  LOCATIONTYPE_OSF: "6ebfd637-c40b-4486-9cf5-b0b976f51de5",
  ROLE_USER: "user",
  OSMTILEURL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  WEBTOKEN: "token",
  fields: {
    PASSWORD: "password",
    SUBMIT: "submit"
  },
  methods: {
    POST: "POST",
    GET: "GET",
    PUT: "PUT",
    DELETE: "DELETE",
  },
  resource_operations: {
    SHOW: "show",
    LIST: "list",
    EDIT: "edit"
  },
  login_details: {
    USERNAME: "username",
    EMAIL: "email",
    PASSWORD: "password",
    PASSWORD_CONFIRM: "confirmPassword"
  },
  password_change: {
    PASSWORD_OLD: "old_password",
    PASSWORD_CONFIRM: "confirm_password",
    PASSWORD_NEW: "new_password"
  },
  paths:{
    SET_PASSWORD: "set_password",
    SEARCH: "search",
  },
  models: {
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
  model_fk_fields: {
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
  fk_fields: {
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
  model_fields: {
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
  //the place to put these is probably in en.js - however, I'm not too keen on having to import translate into more places.
  //these are error / warning messages for form or api failures.
  warnings: {
    TOO_MANY_ROLES: "This user is already assigned a role in this group. Only one role is allowed per group.",
    UNSAVED_CHANGES: "This form contains unsaved changes.  Leave without saving?",
    NO_AUTH_TOKEN: "No authentication token detected.  Please return to the login page, then return here and try again.",
    NO_CONNECTION: "Could not connect to the API.  Please refresh the page and try again.",
  }
});
