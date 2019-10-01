module.exports = Object.freeze({
  ROLE_ANONYMOUS: "anonymous",
  ROLE_DATA_MANAGER: "c4e21cc8-a446-4b38-9879-f2af71c227c3",
  ROLE_GROUP_ADMIN: "a59be619-fd9b-462b-8643-486e68f38613",
  ROLE_MEMBER: "bb7792ee-c7f6-4815-ae24-506fc00d3169",
  ROLE_USER: "user",
  WEBTOKEN: "token",
  API_PORT: "8100",
  API_ENDPOINT: "/api",
  I18N_TLE: "en", //NOTE: this should be your i18n top level element if you want translations to work.
  AVATAR_HEIGHT: "36px",
  VERSION: "1.0.8", //NOTE: this must be updated with every merge to master.
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
  //
  models: {
    GROUPS: "researchgroups",
    DATA_COLLECTION_STATUS: "datacollectionstatus",
    DATA_COLLECTION_METHOD: "datacollectionmethod",
    DATASETS: "datasets",
    DISTRIBUTION_RESTRICTION: "distributionrestriction",
    SENSITIVITY_LEVEL: "sensitivitylevel",
    PROJECTSENSITIVITY: "projectsensitivity",
    PROJECTDATACOLLECTIONMETHOD: "projectdatacollectionmethod",
    AGENTS: "useragents",
    GROUPMEMBERS: "groupmembers",
    GRANTS: "groupviewgrants",
    LOCATIONS: "locations",
    LOCATIONTYPES: "locationtypes",
    PROJECTS: "projects",
    ROLES: "grouproles",
    USERS: "users"
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
    FIRST_NAME: "first_name",
    GROUP: "group",
    HOST_NAME: "host_name",
    ID: "id",
    INDEXED_DATE: "indexed_date",
    KEYWORDS: "keywords",
    LABEL: "label",
    TRANSLATENAME: "translatename",
    LAST_NAME: "last_name",
    LOCATION: "location",
    LOCATION_TYPE: "location_type",
    NAME: "name",
    NOTES: "notes",
    PRIMARY_CONTACT_USER: "primary_contact_user",
    PROJECT: "project",
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
  }
});
