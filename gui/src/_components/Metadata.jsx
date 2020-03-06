//Metadata.jsx
import { Typography } from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import React, { Component, useCallback, useState } from "react";
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import RelatedUsers from "../Groups/RelatedUsers";
import {
  ArrayInput,
  BooleanField,
  TopToolbar,
  CREATE,
  DateField,
  DateInput,
  DELETE,
  email,
  EmailField,
  GET_LIST,
  GET_ONE,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  RefreshButton,
  required,
  SaveButton,
  ShowButton,
  TextField,
  TextInput,
  Toolbar,
  translate,
  UPDATE,
  UrlField,
} from "react-admin";
import { radiamRestProvider, getAPIEndpoint, httpClient } from "../_tools";
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Input from '@material-ui/core/Input';
import LinearProgress from '@material-ui/core/LinearProgress';
import Switch from '@material-ui/core/Switch';
import { withStyles } from "@material-ui/core/styles";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import compose from "recompose/compose";
import PropTypes from 'prop-types';
import {MODEL_FK_FIELDS, MODELS, MODEL_FIELDS} from "../_constants/index";
import SettingsIcon from '@material-ui/icons/Settings';
import IndexedSimpleFormIterator from "./IndexedSimpleFormIterator.js"
import get from 'lodash/get';
import { getGroupMembers } from "../_tools/funcs";
import Cancel from "@material-ui/icons/Cancel";
import { useFormState } from 'react-final-form';

const configStyles = {
  root: {
  },
  container: {
    marginLeft: "30px"
  },
  field: {
    paddingRight: "10px",
    fontSize: "1.20rem",
  },
  input: {
    marginRight: "10px"
  },
  orderButtonGroup: {
    marginRight: "15px"
  },
  schema: {
    paddingRight: "10px"
  },
  section: {
    marginTop: "25px",
    marginLeft: "25px"
  },
  subsection: {
    marginTop: "25px",
    marginBottom: "64px",
  },
  toolbar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    zIndex: 3000,
    marginRight: "30px",
    width: "100%",
    height: "64px",
  },
  toolbarButton: {
    marginLeft: "10px",
    marginRight: "10px",
  },
};

const editStyles = {
  root: {
  },
  container: {
  },
  invisible:{
    display: "none",
  },
  section: {
    marginTop: "25px",
  },
  subsection: {
    marginTop: "25px"
  },
};

const showStyles = {
  root: {
  },
  container: {
    marginTop: '16px',
    marginBottom: "8px",
  },
  field: {
    marginRight: "15px",
  },
  indexSpacer: {
    marginBottom: "16px",
  },
  index: {
    width: '3em',
    marginRight: "1em",
    fontSize: "1.75em",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif;',
    lineHeight: "1",
  },
  label: {
    color: "rgba(0, 0, 0, 0.54)",
    fontSize: "1rem",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: "1",
    marginRight: '1em',
  },
  multifield: {
    display: "flex",
    flexDirection: "column"
  },
  section: {
    marginTop: "25px",
  },
  subfield:{
    marginTop: "5px",
    display: "flex"
  },
  subsection: {
    marginTop: "25px"
  },
};

const ConfigMetadataToolbar = translate(({ classes, onUpdate, onReset, onCancel, translate, submitOnEnter, ...others }) => (
  <Toolbar className={classes.toolbar}>
    <Button className={classes.toolbarButton} variant="contained" color="primary" onClick={onUpdate} {...others}>Update</Button>
    <Button className={classes.toolbarButton} variant="contained" color="secondary" onClick={onReset} {...others}>Reset to Parent</Button>
    <Button className={classes.toolbarButton} onClick={onCancel} {...others}>{translate('ra.action.cancel')}</Button>
  </Toolbar>
));

/** A super class containing the shared logic for editing and configuring metadata **/
class MetadataComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: false,
      entity: {},
      error: null,
      fields: [],
      fromParent: false,
      isLoaded: false,
      schemas: [],
    };
    drawerState.register(this, this.setConfig);
  }

  setConfig(config) {
    this.setState({ config: config});
  };

  componentDidMount() {
    const { id, record, type } = this.props;
    if (id) {
      this.getEntitySchemasFields(id, type, false);
    } else if (record) {
      this.getEntitySchemasFields(record.id, type, false);
    } else {
        console.error("No record or id specified for this metadata component");
    }
  };

  componentWillUnmount() {
    drawerState.unregister(this, this.setConfig);
  };

  getEntitySchemasFields = (id, type, fromParent) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    if (type && id) {
      let params = {
        pagination : {
          page: 1,
          perPage: 1000
        },
        sort: {
          field: 'order',
          order: "ASC"
        }
      };
      params['query'] = {};
      params['query'][type] = id;
      const fetchData = async () => {
        await dataProvider(
          GET_LIST,
          "entityschemafields",
          params
        ).then(response => {
          if (!fromParent && response && response.data && response.data.length === 0) {
            // Don't create this entity if we are just checking if a parent exists.
            this.createEntity(fromParent);
          } else {
            this.parseEntitySchemasFields(response, id, type, fromParent);
          }
        }).catch(error => {
          console.error(error);
          this.setState({ error: error});
        });

      }
      fetchData();
    }
  };

  parseEntitySchemasFields = (response, id, type, fromParent) => {
    var entity = {
      fields: [],
      schemas: [],
      selected_fields: [],
      selected_schemas: []
    };
    if (response && response.data && response.data.length > 0) {
      entity = response.data[0];
    } else {
      return;
    }
    var schemas = {};
    var hasSelected = false;
    if (entity.schemas) {
      entity.schemas.map((schema) => {
        schemas[schema.id] = schema;
        schemas[schema.id].selected = false;
        schemas[schema.id].was_selected = false;
        entity.selected_schemas.map((selected) => {
          if(selected.schema === schema.id) {
            schemas[schema.id].selected = true;
            if (!fromParent) {
              schemas[schema.id].was_selected = true;
            }
            hasSelected = true;
          }
          return selected
        });
        return schema
      });
    }

    if (hasSelected && fromParent) {
      // Make sure we save all instead of just the changed ones.
      this.setState({ fromParent: true });
    }

    var uiTypes = {};
    if (entity.metadata_ui_types) {
      entity.metadata_ui_types.map((type) => {
        uiTypes[type.id] = type;
        return type
      });
    }
    var valueTypes = {};
    if (entity.metadata_value_types) {
      entity.metadata_value_types.map((value) => {
        valueTypes[value.id] = value;
        return value
      });
    }
    var choiceLists = {};
    if (entity.choice_lists) {
      entity.choice_lists.map((choiceList) => {
        choiceList.choices = [];
        choiceLists[choiceList.id] = choiceList;
        return choiceList
      });
    }
    var choiceListValues = {};
    if (entity.choice_list_values) {
      entity.choice_list_values.map((choiceListValue) => {
        choiceListValues[choiceListValue.id] = choiceListValue;
        choiceLists[choiceListValue.list].choices.push(choiceListValue);
        return choiceListValue
      });
    }

    var fields = {};
    var rootFields = [];
    if (entity.fields) {
      entity.fields.map((field) => {
        fields[field.id] = field;
        fields[field.id].selected = false;
        fields[field.id].changed = false;
        fields[field.id].children = [];
        fields[field.id].was_selected = false;
        fields[field.id].visible = true;
        fields[field.id].required = false;
        fields[field.id].selected = false;
        fields[field.id].order = field.default_order
        fields[field.id].schema = schemas[fields[field.id].schema];
        if (uiTypes[field.metadata_ui_type]) {
          field.metadata_ui_type = uiTypes[field.metadata_ui_type];
        }
        if (valueTypes[field.metadata_value_type]) {
          field.metadata_value_type = valueTypes[field.metadata_value_type];
        }
        if (!field.parent) {
          rootFields.push(field);
        }
        entity.selected_fields.map((selected) => {
          if(selected.field === field.id) {
            fields[field.id].selected = true;
            if (!fromParent) {
              fields[field.id].was_selected = true;
            }
            fields[field.id].default = selected.default;
            fields[field.id].visible = selected.visible;
            fields[field.id].required = selected.required;
            fields[field.id].order = selected.order;
            hasSelected = true;
          }
          return selected
        });
        return field;
      });
    }

    // Add the children for each field
    Object.values(fields).map((field) => {
      if (field.parent) {
        fields[field.parent].children.push(field);
      }
      return field
    });

    // Sort the children for each field
    Object.values(fields).map((field) => {
      if (field.children.length > 0) {
        field.children.sort(this.orderField);
      }
      return field
    });


    if (!fromParent) {
      this.setState({entity : entity});
    }

    rootFields.sort(this.orderField);

    this.setState(data => ({
      choiceLists: choiceLists,
      choiceListValues: choiceListValues,
      fields: fields,
      rootFields: rootFields,
      schemas: schemas,
      uiTypes: uiTypes,
      valueTypes: valueTypes,
      isLoaded: true }));

    if (!hasSelected) {
      // The current item has no selected schemas so we should start looking at parents for inherited.
      this.getParentEntitySchemasFields(id, type);
    }

  };

  fieldEnabled = (field) => {
    const { fields} = this.state
    return fields[field.id].selected
      && this.fieldSchemaEnabled(field)
      && this.fieldParentsEnabled(field);
  };

  fieldSchemaEnabled = (field) => {
    const { schemas } = this.state
    return field.schema.id && schemas[field.schema.id].selected;
  };

  fieldParentsEnabled = (field) => {
    const { fields } = this.state;
    if (field.parent) {
      // Check to see if the parents are enabled
      var parentField = fields[field.parent];
      if (!parentField.selected) {
        return false;
      } else if (parentField.parent) {
        // Check the grandparent of this field.
        return this.fieldParentsEnabled(parentField);
      } else {
        // All the parents are selected so this field is ready to go.
        return true;
      }
    } else {
      // No parents, so the parent is enabled.
      return true;
    }
  }

  orderField = (a, b) => {
    return a.order - b.order;
  };

  renderChildren = (classes, translate, parentField, depth, parentPath) => {
    var that = this;
    return parentField.children.map((field) => {
      return that.renderField(classes, translate, field, depth, parentPath);
    });
  };

  getParentEntitySchemasFields = (id, type) => {
    if (type && id) {
      switch (type) {
        case MODEL_FK_FIELDS.GROUP:
          this.getGroupParentEntitySchemaFields(id);
          break;
        case MODEL_FK_FIELDS.PROJECT:
          this.getProjectParentEntitySchemaFields(id);
          break;
        case MODEL_FK_FIELDS.DATASET:
          this.getDatasetParentEntitySchemaFields(id);
          break;
        case MODEL_FK_FIELDS.FILE:
          this.getFileParentEntitySchemaFields(id);
          break;
        default:
          console.log("Unhandled parents for type " + type);
      }
    }
  };

  getGroupParentEntitySchemaFields = (id) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    let params = {
      id: id,
    };

    const fetchData = async () => {
      await dataProvider(
        GET_ONE,
        MODELS.GROUPS,
        params
      ).then(response => {
        if (response && response.data && response.data.parent_group) {
          this.getEntitySchemasFields(response.data.parent_group, MODEL_FK_FIELDS.GROUP, true);
        } else {
          // There are no more parents to check.
          return;
        }
      }).catch(error => {
        console.error(error);
        this.setState({ error: error});
      });
    }
    fetchData();
  };

  getProjectParentEntitySchemaFields = (id) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    let params = {
      id: id,
    };

    const fetchData = async () => {
      await dataProvider(
        GET_ONE,
        MODELS.PROJECTS,
        params
      ).then(response => {
        if (response && response.data && response.data.group) {
          this.getEntitySchemasFields(response.data.group, MODEL_FK_FIELDS.GROUP, true);
        } else {
          // There are no more parents to check.
          console.error("Every project should have a group, how did we not find one?");
        }
      }).catch(error => {
        console.error(error);
        this.setState({ error: error});
      });
    }
    fetchData();
  };

  getDatasetParentEntitySchemaFields = (id) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    let params = {
      id: id,
    };

    const fetchData = async () => {
      await dataProvider(
        GET_ONE,
        MODELS.DATASETS,
        params
      ).then(response => {
        if (response && response.data && response.data.project) {
          this.getEntitySchemasFields(response.data.project, MODEL_FK_FIELDS.PROJECT, true);
        } else {
          // There are no more parents to check.
          console.error("Every dataset should have a project, how did we not find one with " + id);
        }
      }).catch(error => {
        console.error(error);
        this.setState({ error: error});
      });
    }
    fetchData();
  };

  getFileParentEntitySchemaFields = (id) => {
      return;
      /**
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    const { projectID } = this.props;
    if (!projectID)
    {
      return;
    }
    let params = {
      id: projectID,
    };
    const fetchData = async () => {
      await dataProvider(
        GET_ONE,
        MODELS.PROJECTS,
        params
      ).then(response => {
        if (response && response.data && response.data.project) {
          this.getEntitySchemasFields(response.data, MODEL_FK_FIELDS.PROJECT, true);
        } else {
          // There are no more parents to check.
          console.error("Every file should have a project, how did we not find one with " + projectID);
        }
      }).catch(error => {
        console.error(error);
        this.setState({ error: error});
      });
    }
    fetchData();
    **/
  }

  createEntity = (fromParent) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    const { id, type } = this.props;

    if (type && id) {
      let params = {
        data: {
          group: null,
          project: null,
          dataset: null,
          file: null,
          folder: null
        }
      };
      params['data'][type] = id;
      const sendData = async () => {
        await dataProvider(
          CREATE,
          "entities",
          params
        ).then(response => {
          this.getEntitySchemasFields(id, type, fromParent);
          return response
        }).catch(error => {
          console.error(error);
          if (error.status === 400 &&
              error.message === "Bad Request" &&
              Array.isArray(error.body[type]) &&
              error.body[type].includes("There is already an entity with this group.")) {
            // Handling already created entity
            this.getEntitySchemasFields(id, type, fromParent);
            return;
          } else {
            this.setState({ error: error});
          }
        });

      }
      sendData();
    }
  }
};

class BaseConfigMetadata extends MetadataComponent {
  constructor(props) {
    super(props);
    this.state = {config: false}
  }

  handleSchemaChange = name => event => {
    const { schemas } = this.state
    schemas[name].selected = event.target.checked;
    this.setState({schemas})
  };

  handleFieldChange = name => event => {
    const { fields } = this.state
    fields[name].selected = event.target.checked;
    this.setState({fields})
  };

  schemasHasChanged = () => {
    const { schemas } = this.state;
    var hasChanged = false;
    Object.keys(schemas).map((schemaKey) => {
      let schema = schemas[schemaKey];
      if (schema.selected && !schema.was_selected) {
        hasChanged = true;
      } else if (!schema.selected && schema.was_selected) {
        hasChanged = true;
      }
      return schemaKey
    });
    return hasChanged;
  };

  fieldsHasChanged = () => {
    const { fields } = this.state;
    var hasChanged = false;
    Object.keys(fields).map((fieldKey) => {
      let field = fields[fieldKey];
      if (field.changed) {
        hasChanged = true;
      } else if (field.selected && !field.was_selected) {
        hasChanged = true;
      } else if (!field.selected && field.was_selected) {
        hasChanged = true;
      }
      return fieldKey
    });
    return hasChanged;
  };

  metadataHasChanged = () => {
    var schemaChanged = this.schemasHasChanged();
    var fieldsChanged = this.fieldsHasChanged();
    return schemaChanged || fieldsChanged;
  };

  saveSchemas = () => {
    const { entity, fromParent, schemas } = this.state;
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    var selectedSchemas = [];
    var deletedSchemas = [];

    if (!fromParent) {
      Object.keys(schemas).map((schemaKey, index) => {
        let schema = schemas[schemaKey];
        if (schema.selected && !schema.was_selected) {
          selectedSchemas.push(schema);
        } else if (!schema.selected && schema.was_selected) {
          deletedSchemas.push(schema);
        }
        return (schemaKey, index)
      });
    } else {
      if (this.metadataHasChanged()) {
        Object.keys(schemas).map((schemaKey) => {
          let schema = schemas[schemaKey];
          if (schema.selected) {
            selectedSchemas.push(schema);
          } else if (!schema.selected) {
            deletedSchemas.push(schema);
          }
          return schemaKey
        });
      }
      else {
        selectedSchemas = [];
        deletedSchemas = [];
      }
    }

    var promises = selectedSchemas.map((schema) => {
      let params = { data: { schema: schema.id, entity: entity.id } };
      const fetchData = async () => {
        await dataProvider(
          CREATE,
          "selectedschemas",
          params
        ).then(response => {
          schema.was_selected = true;
        })
      };
      return fetchData();
    });

    return promises.concat(this.deleteSchemas(deletedSchemas, entity));
  };

  saveFields = () => {
    const { entity, fields } = this.state;

    console.log("saveFields entity, fields: ", entity, fields)

    var createdFields = Object.values(fields).filter(field => field.selected && !field.was_selected);
    var updatedFields = Object.values(fields).filter(field => field.selected && field.was_selected && field.changed);
    var deletedFields = Object.values(fields).filter(field => !field.selected && field.was_selected);

    var promises = this.updateFields(updatedFields, entity);
    promises = promises.concat(this.createFields(createdFields, entity));
    promises = promises.concat(this.deleteFields(deletedFields, entity));
    return promises;
  };

  updateFields = (fields, entity) => {
    return fields.map((field, index) => {
      return this.updateField(field, entity);
    });
  };

  updateField = (field, entity) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    let params = {
      pagination : {
        page: 1, perPage: 1000
      },
      query : {
        field: field.id,
        entity: entity.id
      }
    };
    const findField = async () => {
        await dataProvider(
        GET_LIST,
        "selectedfields",
        params
      ).then(response => {
        if (response && response.data && response.data.length === 0) {
          // Can't do the update so we will create it instead.
          return this.createField(field, entity);
        } else if (response && response.data && response.data.length > 0) {
          response.data.map((selectedfield, index) => {
            let params = {
              id: selectedfield.id,
              data: {
                field: field.id,
                default: field.default,
                required: field.required,
                visible: field.visible,
                order: field.order,
                entity: entity.id
              }
            };
            const updateFieldWithPut = async () => {
              await dataProvider(
                UPDATE,
                "selectedfields",
                params
              ).then(response => {
                field.was_selected = true;
                return response
              });
            };
            return updateFieldWithPut();
          });
        }
        // TODO Handle no response and errors.
      });
    };
    return findField();
  };

  createFields = (fields, entity) => {
    return fields.map((field) => {
      return this.createField(field, entity);
    });
  };

  createField = (field, entity) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    let params = {
      data: {
        field: field.id,
        default: field.default,
        required: field.required,
        visible: field.visible,
        order: field.order,
        entity: entity.id
      }
    };
    const fetchData = async () => {
      await dataProvider(
        CREATE,
        "selectedfields",
        params
      ).then((response) => {
        field.was_selected = true;
        return response
      })
    };
    return fetchData();
  };

  deleteSchemas = (schemas, entity) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    return schemas.map((schema, index) => {
      let params = {
          pagination : {
          page: 1, perPage: 1000
        },
        query : {
          schema: schema.id,
          entity: entity.id
        }
      };
      const fetchData = async () => {
        await dataProvider(
          GET_LIST,
          "selectedschemas",
          params
        ).then(response => {
          if (response && response.data && response.data.length === 0) {
            // It must have already been deleted
          } else if (response && response.data && response.data.length === 1) {
            let params = { id: response.data[0].id};
            const deleteSchema = async () => await dataProvider(
              DELETE,
              "selectedschemas",
              params
            ).then(response => {
              schema.was_selected = false;
            });
            deleteSchema();
          }
        })
      };
      return fetchData();
    });
  };

  deleteFields = (fields, entity) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    return fields.map((field, index) => {
      let params = {
        pagination : {
          page: 1, perPage: 1000
        },
        query : {
          field: field.id,
          entity: entity.id
        }
      };
      const fetchData = async () => {
        await dataProvider(
          GET_LIST,
          "selectedfields",
          params
        ).then(response => {
          if (response && response.data && response.data.length === 0) {
            // It must have already been deleted
          } else if (response && response.data) {
            response.data.map((key, index) => {
              let params = { id: response.data[index].id};
              const deleteField = async () => await dataProvider(
                DELETE,
                "selectedfields",
                params
              ).then(response => {
                field.was_selected = false;
              });
              deleteField();
              return (key, index)
            });
          }
        }).catch(error => {
          console.error(error);
        });
      };
      return fetchData();
    });
  };

  onReset = () => {
    const { id, type } = this.props;
    var that = this;
    var promises = this.resetSchemas();
    promises = promises.concat(this.resetFields());
    Promise.all(promises).then(function(){
      drawerState.close();
      drawerState.changed()
      that.getEntitySchemasFields(id, type, false);
    });
  };

  onClose = () => {
    drawerState.close();
  };

  resetSchemas = () => {
    const { schemas, entity } = this.state
    return this.deleteSchemas(Object.values(schemas), entity);
  };

  resetFields = () => {
    const { fields, entity } = this.state
    return this.deleteFields(Object.values(fields), entity);
  };

  onUpdate = () => {
    var promises = this.saveSchemas();
    promises = promises.concat(this.saveFields());
    this.setState({ config: false});
    Promise.all(promises).then(function(){
      drawerState.close();
      drawerState.changed()
    });
  };

  shiftField = (array, index, up) => {
    if (up && index === 0) {
      // Can't shift the first element any more.
      return array;
    }
    var field = array.splice(index, 1).pop();
    if (up) {
      array.splice(index - 1, 0, field);
    } else {
      array.splice(index + 1, 0, field);
    }
    array.forEach((current, index) => {
      current.order = index;
    });
    return array;
  };

  changeOrder = (id, up) => {
    const { fields, rootFields } = this.state
    var field = fields[id];
    field.changed = true;
    if (!field.parent) {
      var rootFieldsArray = [];
      Object.values(rootFields).map((rootField, index) => {
        rootFieldsArray.push(rootField);
        return (rootField, index)
      });
      var currentIndex = rootFieldsArray.indexOf(field);
      rootFieldsArray = this.shiftField(rootFieldsArray, currentIndex, up);
      this.setState(data => ({
        fields: fields,
        rootFields: rootFieldsArray
      }));
    } else {
      // Sort the children for each fellow child.
      var parentField = fields[field.parent];
      var shiftedChildren = this.shiftField(parentField.children, parentField.children.indexOf(field), up);
      parentField.children = shiftedChildren;
      this.setState({fields});
    }
  };

  changeDefault = id => event => {
    const { fields } = this.state
    fields[id].default = event.target.value;
    fields[id].changed = true;
    this.setState({fields});
  };

  changeRequired = id => event => {
    const { fields } = this.state
    fields[id].required = event.target.checked;
    fields[id].changed = true;
    this.setState({fields});
  };

  changeVisible = id => event => {    
    const { fields } = this.state
    fields[id].visible = event.target.checked;
    fields[id].changed = true;
    this.setState({fields});
  };

  isFirstField = field => {
    const { fields, rootFields} = this.state;
    if (field.parent) {
      const parentField = fields[field.parent];
      if (parentField.children.indexOf(field) === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      if (rootFields.indexOf(field) === 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  isLastField = field => {
    const { fields, rootFields} = this.state;
    if (field.parent) {
      const parentField = fields[field.parent];
      if (parentField.children.indexOf(field) === parentField.children.length - 1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (rootFields.indexOf(field) === (rootFields.length - 1)) {
        return true;
      } else {
        return false;
      }
    }
  }

  renderContainer = (classes, translate, field, depth) => {
    return <div className={classes.container} key={"container" + field.id}>

      <FormControlLabel
        control={
          <Switch
            disabled={!this.fieldSchemaEnabled(field)
              || !this.fieldParentsEnabled(field)}
            checked={this.fieldEnabled(field)}
            color="primary"
            component="span"
            onChange={this.handleFieldChange(field.id)}
            value={field.id}
          />
        }
        label={this.fieldEnabled(field) ? translate("en.metadata.on") : translate("en.metadata.off")}
      />

      <Typography
        className={classes.schema}
        variant="body1"
        component="span">
          {translate(field.schema.label + ".short")}
      </Typography>

      <Typography
        className={classes.field}
        variant="body2"
        component="span">
          {translate(field.label + ".label")}
      </Typography>

      <ButtonGroup disabled={!this.fieldEnabled(field)} className={classes.orderButtonGroup} variant="contained" size="small" color="primary">
        <Button disabled={this.isFirstField(field)} onClick={(e) => this.changeOrder(field.id, true)}><ArrowUpwardIcon/></Button>
        <Button disabled={this.isLastField(field)} onClick={(e) => this.changeOrder(field.id, false)}><ArrowDownwardIcon/></Button>
      </ButtonGroup>

      { this.fieldEnabled(field) &&
        <FormControlLabel
          control={
            <Switch
              checked={field.visible}
              color="primary"
              component="span"
              onChange={this.changeVisible(field.id)}
            />
          }
          label={translate("en.metadata.visible")}
        />
      }

      {this.renderChildren(classes, translate, field, depth + 1)}

    </div>
  };

  renderField = (classes, translate, field, depth) => {
    if (field.metadata_ui_type.key === "container") {
      return this.renderContainer(classes, translate, field, depth);
    } else {
      return <div key={"input-" + field.id} className={classes.container}>

        <FormControlLabel control={
          <Switch
            disabled={!this.fieldSchemaEnabled(field)
              || !this.fieldParentsEnabled(field)}
            checked={this.fieldEnabled(field)}
            color="primary"
            component="span"
            onChange={this.handleFieldChange(field.id)}
            value={field.id} />}
            label={this.fieldEnabled(field) ? translate("en.metadata.on") : translate("en.metadata.off")}
          />

        <Typography
          className={classes.schema}
          variant="body1"
          component="span">
            {translate(field.schema.label + ".short")}
        </Typography>

        <Typography
          className={classes.field}
          variant="body2"
          component="span">
            {translate(field.label + ".label")}
        </Typography>

        <ButtonGroup disabled={!this.fieldEnabled(field)} className={classes.orderButtonGroup} variant="contained" size="small" color="primary">
          <Button disabled={this.isFirstField(field)} onClick={(e) => this.changeOrder(field.id, true)}><ArrowUpwardIcon/></Button>
          <Button disabled={this.isLastField(field)} onClick={(e) => this.changeOrder(field.id, false)}><ArrowDownwardIcon/></Button>
        </ButtonGroup>

        { this.fieldEnabled(field) &&
          <Input
            placeholder={translate("en.metadata.default")}
            className={classes.input}
            inputProps={{ 'aria-label': 'Description', }}
            onChange={this.changeDefault(field.id)}
          />
        }

        { this.fieldEnabled(field) &&
          <FormControlLabel
            control={
              <Switch
                checked={field.required}
                color="primary"
                component="span"
                onChange={this.changeRequired(field.id)}
              />
            }
            label={translate("en.metadata.required")}/>
        }

        { this.fieldEnabled(field) &&
          <FormControlLabel
            control={
              <Switch
                checked={field.visible}
                color="primary"
                component="span"
                onChange={this.changeVisible(field.id)}
              />
            }
            label={translate("en.metadata.visible")}
          />
        }

        {this.renderChildren(classes, translate, field, depth + 1)}
      </div>
    }
  };

  renderBody() {
    const { entity, error, isLoaded, rootFields, schemas } = this.state;
    const { classes, id, translate } = this.props;
    if (error) {
      return <div>There was an error loading additional metadata: {error.message} </div>
    } else if (!id || !isLoaded){
      return <div>{translate("en.metadata.loading")}<LinearProgress /></div>
    } else if (entity){
      return <div className={classes.section}>
        <Typography variant="h4">{translate("en.metadata.config.title")}</Typography>
        <Typography variant="h5">{translate("en.metadata.schemas")}</Typography>
        <div>
          {entity.schemas.map((schema) => {
            return <div key={schema.id} >
              <Switch checked={schemas[schema.id].selected} color="primary" component="span" onChange={this.handleSchemaChange(schema.id)} value={schema.id} />
              <Typography variant="body1" component="span">{translate(schema.label + ".label")}</Typography>
              <ExpandMoreIcon component="span" />
            </div>
          })}
        </div>
        <div className={classes.subsection}>
          <Typography variant="h5">{translate("en.metadata.fields")}</Typography>
          {rootFields.map((field, index) => {
            return this.renderField(classes, translate, field, 0);
          })}
        </div>
        <ConfigMetadataToolbar classes={ classes } onUpdate={this.onUpdate} onReset={this.onReset} onCancel={this.onClose}/>
      </div>
    } else {
      return <div>{translate("en.metadata.no")}</div>;
    }
  };

  render() {
    const { classes, close, id, type, translate, ...others } = this.props;
    const { config } = this.state

    return <Drawer anchor="bottom" open={config} onClose={() => drawerState.close()} {...others}>
      <>
        { this.renderBody() }
      </>
    </Drawer>;
  };
}

const enhanceConfig = compose(
  translate,
  withStyles(configStyles),
);

BaseConfigMetadata.propTypes = {
  translate: PropTypes.func.isRequired,
};

const validateEmail = email();
const validateRequired = [required()];
const validateRequiredEmail = [required(), email()];
const validateRequiredURL = [required()];
const validateURL = [];
// const validateRequiredURL = [required(), regex(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)];
// const validateURL = regex(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);


class BaseEditMetadata extends MetadataComponent {
  constructor (props) {
    super(props);
    drawerState.registerFull(this, this.update);
    this.state = {values: props.values} //values being the pre-existing metadata values.  This is only used for filling defaults.
  }

  componentWillUnmount() {
    drawerState.unregisterFull(this, this.setConfig);
  }

  update() {
    const { id, type } = this.props;
    var entity = {
      fields: [],
      schemas: [],
      selected_fields: [],
      selected_schemas: []
    };
    this.setState( { entity : entity });
    this.getEntitySchemasFields(id, type, false);
  };

  changeValue = id => event => {
    const { fields } = this.state
    fields[id].value = event.target.value;
    fields[id].changed = true;
    this.setState({fields});
  };

  getSource = (field, parentPath) => {
    return parentPath + "." + field.id + ".value";
  };

  renderField = (classes, translate, field, values, depth, parentPath) => {
    var type = get(field, "metadata_ui_type.key", null);
    if (type === "boolean" ||
        type ==="container" ||
        type ==="date" ||
        type ==="dateYear" ||
        type === MODEL_FIELDS.EMAIL ||
        type ==="float" ||
        type ==="integer" ||
        type ==="text" ||
        type ==="url") {
      console.log("field being rendered: ", field, values)
      return <div className={classes.container} key={"text-container-" + field.id}>
        { field.many_values &&
          <ArrayInput label={field.label + ".label"} source={`${parentPath}.${field.id}`}
          defaultValue={values}>
            <IndexedSimpleFormIterator
              childClasses={classes}
              field={field}
              depth={depth}
              renderChildren={this.renderChildren}
              parentPath={parentPath}
            >
            { type === "boolean" ?
                  <NullableBooleanInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    defaultValue={field.default}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type === "container" ?
                  <></>

              : type === "date" ?
                  <DateInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    defaultValue={field.default}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type === "dateYear" ?
                  <DateInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    defaultValue={field.default}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type === MODEL_FIELDS.EMAIL ?
                  <TextInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    defaultValue={field.default}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequiredEmail : validateEmail }
                  />

              : type === "float" ?
                  <NumberInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    defaultValue={field.default}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type === "integer" ?
                  <NumberInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    defaultValue={field.default}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type === "text" ?
                  <TextInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    defaultValue={field.default}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type === "url" ?
                  <TextInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    defaultValue={field.default}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequiredURL : validateURL }
                  />

              : null }

            </IndexedSimpleFormIterator>
          </ArrayInput>
        }

        { !field.many_values &&
          <>
            {   type ==="boolean" ?
                  <NullableBooleanInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type ==="date" ?
                  <DateInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type ==="dateYear" ?
                  <DateInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />
              : type === MODEL_FIELDS.EMAIL ?
                  <TextInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequiredEmail : validateEmail }
                  />

              : type ==="float" ?
                  <NumberInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type ==="integer" ?
                  <NumberInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type === "text" ?
                  <TextInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequired : null }
                  />

              : type ==="url" ?
                  <TextInput
                    key={"text-input-" + field.id}
                    label={translate(field.label + ".label")}
                    source={field.id}
                    className={ field.visible ? null : classes.invisible }
                    validate={ field.required ? validateRequiredURL : validateURL }
                  />


              : null }
              { this.renderChildren(classes, translate, field, depth + 1, parentPath + "." + field.id) }
          </>
        }

      </div>
    } else {
      if (!type) {
        console.error("Unknown metadata ui type with no key.");
        console.error(field.metadata_ui_type.key);
        return null;
      } else {
        console.error("Unknown metadata ui type " + field.metadata_ui_type.key);
        return null;
      }
    }
  };

  render() {
    const { entity, error, isLoaded, rootFields } = this.state;
    const { addSave, classes, id, record, translate } = this.props;

    if (error) {
      return <div className={classes.section}>
          <Typography variant="h5">{translate("en.metadata.edit.title")}</Typography>
          <div>There was an error loading additional metadata: {error.message} </div>
        </div>;
    } else if (!id || !isLoaded){
      return <div className={classes.section}>
          <Typography variant="h5">{translate("en.metadata.edit.title")}</Typography>
          <div>{translate("en.metadata.loading")} <LinearProgress /></div>
        </div>;
    } else if (entity) {
      return <div className={classes.section}>
        <Typography variant="h5">{translate("en.metadata.edit.title")}</Typography>
          <div className={classes.subsection}>
            {rootFields.map((field, index) => { //should have the defaulted values here as well
              if (field.selected) { //then there is some record of this in `values`
                return this.renderField(classes, translate, field, this.state.values ? this.state.values[field.id] : null, 0, "metadata");
              }
              return null
            })}
          </div>
          { addSave ?
              <SaveButton />
              :
              null
          }
        </div>;
    } else {
      return <div>{translate("en.metadata.no")}</div>;
    }
  }
};

const enhanceEdit = compose(
  translate,
  withStyles(editStyles),
);

const enhanceShow = compose(
  translate,
  withStyles(showStyles),
);

class BaseMetadataEditActions extends Component {
  state = {}
  constructor (props) {
    super(props);
    drawerState.register(this, this.setConfig);
  }

  componentDidMount(){
    const {id, showRelatedUsers} = this.props
    if (showRelatedUsers){

      if (id) {
        const params={id: id, is_active: true}
        getGroupMembers(params).then((data) => {
        console.log("getGroupMembers returned data: ", data)
        this.setState({groupMembers: data})
        return data
      }).catch(err => console.error("err: ", err))
      }
    }
  }

  componentWillUnmount() {
    drawerState.unregister(this, this.setConfig);
  }

  setConfig(config) {
    this.setState({ config: config});
  };
  
  render() {
    const { basePath, bulkActions, cancel, data, displayedFilters, filters, filterValues, onUnselectItems, record, resource, selectedIds, showFilter, showRelatedUsers, translate } = this.props;
    const { groupMembers } = this.state
    let cancelButton = null;
    if (cancel) {
      cancelButton = cancel;
    } else if (data && !cancel) {
      cancelButton = <ShowButton basePath={basePath} label="Cancel" icon={<Cancel/>} record={data} />
    }
    return <TopToolbar>
        {bulkActions && React.cloneElement(bulkActions, {
            basePath,
            filterValues,
            resource,
            selectedIds,
            onUnselectItems,
        })}
        {filters && React.cloneElement(filters, {
            resource,
            showFilter,
            displayedFilters,
            filterValues,
            context: 'button',
        }) }
        { showRelatedUsers && groupMembers &&
          <RelatedUsers groupMembers={groupMembers} />
        }
        { cancelButton }
        <Button color="primary" onClick={(e) => drawerState.open(e)}><SettingsIcon/>{translate("en.metadata.configure")}</Button>
    </TopToolbar>
  }
};

var drawerState = {
  drawerOpen:  false,
  updates: [],
  full: [],

  close: function () {
    var that = this;
    this.drawerOpen = false;
    this.updates.forEach(function(update, index) {
      update.callback.call(update.that, that.drawerOpen);
    });
  },

  isOpen: function() {
    return this.drawerOpen;
  },

  open: function () {
    var that = this;
    this.drawerOpen = true;
    this.updates.forEach(function(update, index) {
      update.callback.call(update.that, that.drawerOpen);
    });
  },

  toggle: function(event) {
    var that = this;
    this.drawerOpen = !this.drawerOpen;
    this.updates.forEach(function(update, index) {
      update.callback.call(update.that, that.drawerOpen);
    });
  },

  register: function(that, callback) {
    if (callback && that) {
      this.updates.push({ that: that, callback: callback });
    } else {
      console.error("Unable to register the update callback as it was null.");
    }
  },

  registerFull: function(that, callback) {
    if (callback && that) {
      this.full.push({ callback: callback, that: that });
    }
  },

  unregister: function(that, callback) {
    this.updates.filter(function(value, index, arr) {
      return value.that === that && value.callback === callback;
    });
  },

  unregisterFull: function(that, callback) {
    this.updates.filter(function(value, index, arr) {
      return value.that === that && value.callback === callback;
    });
  },

  changed: function() {
    this.drawerOpen = false;
    this.full.forEach(function(update, index) {
      update.callback.call(update.that);
    });
  },

};


class BaseShowMetadata extends MetadataComponent {
  update() {
    const { id, type } = this.props;
    var entity = {
      fields: [],
      schemas: [],
      selected_fields: [],
      selected_schemas: []
    };
    this.setState( { entity : entity });
    this.getEntitySchemasFields(id, type, false);
  };

  getSource = (field, parentPath) => {
    return parentPath + "." + field.id + ".value";
  };

  renderField = (classes, translate, field, depth, parentPath) => {
    const { record } = this.props
    if (field.selected) {
      var type = get(field, "metadata_ui_type.key", null);
      if (type === "boolean" ||
          type ==="container" ||
          type ==="date" ||
          type ==="dateYear" ||
          type === MODEL_FIELDS.EMAIL ||
          type ==="float" ||
          type ==="integer" ||
          type ==="text" ||
          type ==="url") {
        var current = get(record, parentPath + "." + field.id);
        if (!current || (Array.isArray(current) && current.length === 0)) {
          return null;
        }
        if (field.many_values)
        {
          var fields = [];
          fields.push(<Typography className={classes.label}>{translate(field.label + ".label")}</Typography>);

          for (var index = 0; index < current.length; index++) {
            var fieldClass = classes.field;
            if (index === current.length - 1) {
              fieldClass = classes.lastField;
            }
            fields.push(
              <div className={classes.subfield}>
                <div className={classes.index}>&nbsp;</div>
                <div>
                  { type ==="boolean" ?
                        <div>
                          <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
                          <BooleanField
                            className={fieldClass}
                            key={"text-input-" + field.id}
                            label={translate(field.label + ".label")}
                            record={record}
                            source={parentPath + "." + field.id + "[" + index + "].value"}
                            validate={ field.required ? validateRequired : null }
                          />
                        </div>

                    : type === "container" ?
                        <div>
                          <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
                        </div>
                    : type ==="date" ?
                        <div>
                          <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
                          <DateField
                            className={fieldClass}
                            key={"text-input-" + field.id}
                            label={translate(field.label + ".label")}
                            record={record}
                            source={parentPath + "." + field.id + "[" + index + "].value"}
                            validate={ field.required ? validateRequired : null }
                          />
                        </div>

                    : type ==="dateYear" ?
                        <div>
                          <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
                          <DateField
                            className={fieldClass}
                            key={"text-input-" + field.id}
                            label={translate(field.label + ".label")}
                            record={record}
                            source={parentPath + "." + field.id + "[" + index + "].value"}
                          />
                        </div>

                    : type === MODEL_FIELDS.EMAIL ?
                        <div>
                          <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
                          <EmailField
                            className={fieldClass}
                            key={"text-input-" + field.id}
                            label={translate(field.label + ".label")}
                            record={record}
                            source={parentPath + "." + field.id + "[" + index + "].value"}
                            validate={ field.required ? validateRequiredEmail : validateEmail }
                          />
                        </div>

                    : type ==="float" ?
                        <div>
                          <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
                          <NumberField
                            className={fieldClass}
                            key={"text-input-" + field.id}
                            label={translate(field.label + ".label")}
                            record={record}
                            source={parentPath + "." + field.id + "[" + index + "].value"}
                            validate={ field.required ? validateRequired : null }
                          />
                        </div>

                    : type ==="integer" ?
                        <div>
                          <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
                          <NumberField
                            className={fieldClass}
                            key={"text-input-" + field.id}
                            label={translate(field.label + ".label")}
                            record={record}
                            source={parentPath + "." + field.id + "[" + index + "].value"}
                            validate={ field.required ? validateRequired : null }
                          />
                        </div>

                    : type ==="text" ?
                        <div>
                          <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
                          <TextField
                            className={fieldClass}
                            key={"text-input-" + field.id}
                            label={translate(field.label + ".label")}
                            record={record}
                            source={parentPath + "." + field.id + "[" + index + "].value"}
                          />
                        </div>
                    : type ==="url" ?
                        <div>
                          <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
                          <UrlField
                            className={fieldClass}
                            key={"text-input-" + field.id}
                            label={translate(field.label + ".label")}
                            record={record}
                            source={parentPath + "." + field.id + "[" + index + "].value"}
                            validate={ field.required ? validateRequiredURL : validateURL }
                          />
                        </div>

                    : null }
                { this.renderChildren(classes, translate, field, depth + 1, parentPath + "." + field.id + "[" + index + "]") }
              </div>
            </div>
            );
            fields.push(<Divider className={classes.indexSpacer}/>);
          }

          return (<div className={classes.container} key={"text-container-" + field.id}>
              {fields}
            </div>);
        } else {
            return (<div className={classes.container} key={"text-container-" + field.id}>
            <>
              { (type === "boolean" || type === "date" || type === "dateYear" || type === MODEL_FIELDS.EMAIL || type === "float" || type === "integer" || type === "text" || type === "url") &&
                <Typography className={classes.label}>{translate(field.label + ".label")}</Typography>
              }
              {   type ==="boolean" ?
                    <BooleanField
                      key={"text-input-" + field.id}
                      label={translate(field.label + ".label")}
                      source={this.getSource(field, parentPath)}
                      record={record}
                    />

                : type ==="date" ?
                    <DateField
                      key={"text-input-" + field.id}
                      label={translate(field.label + ".label")}
                      source={this.getSource(field, parentPath)}
                      record={record}
                    />

                : type ==="dateYear" ?
                    <DateField
                      key={"text-input-" + field.id}
                      label={translate(field.label + ".label")}
                      source={this.getSource(field, parentPath)}
                      record={record}
                    />
                : type === MODEL_FIELDS.EMAIL ?
                    <EmailField
                      key={"text-input-" + field.id}
                      label={translate(field.label + ".label")}
                      source={this.getSource(field, parentPath)}
                      record={record}
                    />

                : type ==="float" ?
                    <NumberField
                      key={"text-input-" + field.id}
                      label={translate(field.label + ".label")}
                      source={this.getSource(field, parentPath)}
                      record={record}
                    />

                : type ==="integer" ?
                    <NumberField
                      key={"text-input-" + field.id}
                      label={translate(field.label + ".label")}
                      source={this.getSource(field, parentPath)}
                      record={record}
                    />

                : type ==="text" ?
                    <TextField
                      key={"text-input-" + field.id}
                      label={translate(field.label + ".label")}
                      source={this.getSource(field, parentPath)}
                      record={record}
                    />

                : type ==="url" ?
                    <UrlField
                      key={"text-input-" + field.id}
                      label={translate(field.label + ".label")}
                      source={this.getSource(field, parentPath)}
                      record={record}
                    />


                : null }
              { this.renderChildren(classes, translate, field, depth + 1, parentPath + "." + field.id) }
            </>
            </div>);
          }
      } else {
        if (!type) {
          console.error("Unknown metadata ui type with no key.");
          console.error(field.metadata_ui_type.key);
          return null;
        } else {
          console.error("Unknown metadata ui type " + field.metadata_ui_type.key);
          return null;
        }
      }
    }
  };

  /**
   * Check if a record has any additional metadata to show
   */
  hasValues(record, fields, parentPath) {
    if (!fields || !record) {
      return false;
    }
    var hasValue = false;
    fields.map((field) => {
      if (!field.selected) {
        // This field isn't selected so it and its children don't count for a value to show
        return field;
      }
      if (Array.isArray(get(record, parentPath + "." + field.id, null)) &&
          get(record, parentPath + "." + field.id, null).length > 0) {
        // This field is an array, check all of them for a value.
        var array = get(record, parentPath + "." + field.id, null);
        array.map((subfield, index) => {
          if (get(subfield, "value", null)) {
            hasValue = true;
          } else {
            // This array didn't have any values, let's check its children.
            if (this.hasValues(record, field.children, parentPath + "." + field.id + "[" + index + "]")) {
              hasValue = true;
            }
          }
          return(subfield, index)
        });
      }
      else if (get(record, this.getSource(field, parentPath), null)) {
        // This field has a value so we have found one.
        hasValue = true;
      } else {
        // Check the children of this field for a value.
        if (this.hasValues(record, field.children, parentPath + "." + field.id)) {
          hasValue = true;
        }
      }
      return field
    });

    return hasValue;
  };

  render() {
    const { entity, error, isLoaded, rootFields } = this.state;
    const { classes, record, id, translate } = this.props;
    if (error) {
      return <div className={classes.section}>
          <Typography variant="h5">{translate("en.metadata.show.title")}</Typography>
          <div>There was an error loading additional metadata: {error.message} </div>
        </div>;
    } else if (!id || !isLoaded){
      return <div className={classes.section}>
          <Typography variant="h5">{translate("en.metadata.show.title")}</Typography>
          <div>{translate("en.metadata.loading")} <LinearProgress /></div>
        </div>;
    } else if (entity && this.hasValues(record, rootFields, "metadata")) {
      return <div className={classes.section}>
        <Typography variant="h5">{translate("en.metadata.show.title")}</Typography>
          <div className={classes.subsection}>
            {rootFields.map((field, index) => {
              return this.renderField(classes, translate, field, 0, "metadata");
            })}
          </div>
        </div>;
    } else {
      return <div>{translate("en.metadata.no")}</div>;
    }
  }
};


BaseShowMetadata.propTypes = {
  basePath: PropTypes.string,
  record: PropTypes.object,
  resource: PropTypes.string,
};

class BaseEditConfigMetadataForm extends Component {

  constructor (props) {
    super(props);
    this.state = {
    };
  }


  render() {
    const { id, doc, onCancel, onSave, projectID, record, translate } = this.props;
    return (
      <>
        <Form
          mutators={arrayMutators}
          onSubmit={() => {onSave()} }
          initialValues={record}
          render={({ handleSubmit, form, submitting, pristine, values }) => (
          <form>
          <React.Fragment>
            <EditMetadata
              type={MODEL_FK_FIELDS.FILE}
              translate={translate}
              id={id}
              record={record}
            />
            <SaveEditMetadataFormButton
                doc={doc}
                onCancel={onCancel}
                onSave={onSave}
                projectID={projectID}
            />
            <Button onClick={onCancel}>{translate('ra.action.cancel')}</Button>
            <ConfigMetadata
              type={MODEL_FK_FIELDS.FILE}
              translate={translate}
              id={id}
              record={record}
            />
          </React.Fragment>
          </form>
          )}/>
        </>
    );
  };
};

const SaveEditMetadataFormButton = ({doc, onSave, projectID, ...rest}) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    const formState = useFormState();
    const handleSaveClick = useCallback(() => {
        if (!formState.valid) {
            return;
        }
        let params = {
            id: doc,
            data: formState.values
        };
        const sendData = async () => {
            await dataProvider(
              UPDATE,
              "projects/" + projectID + "/docs",
              params
            ).then(response => {
              if (onSave) {
                  onSave();
              }
              return response
            }).catch(error => {
              console.error(error);
              return;
            });

        };
        sendData();
    }, [
        formState.valid,
        formState.values,
        /**
        create,
        notify,
        redirectTo,
        redirect,
        basePath,
        **/
    ]);

    return <SaveButton {...rest} handleSubmitWithRedirect={handleSaveClick} />
};


export const EditConfigMetadataForm = enhanceEdit(BaseEditConfigMetadataForm);
export const ConfigMetadata = enhanceConfig(BaseConfigMetadata);
export const EditMetadata = enhanceEdit(BaseEditMetadata);
export const MetadataEditActions = enhanceEdit(BaseMetadataEditActions);
export const ShowMetadata = enhanceShow(BaseShowMetadata);
