//App.jsx
import React from 'react';
import { Admin, Resource } from 'react-admin';
import AddLocation from "@material-ui/icons/AddLocation"
import AvTimer from "@material-ui/icons/AvTimer"
import Fingerprint from "@material-ui/icons/Fingerprint"
import FlipToFront from "@material-ui/icons/FlipToFront"
import Group from "@material-ui/icons/Group"
import GroupAdd from "@material-ui/icons/GroupAdd"
import InsertChart from "@material-ui/icons/InsertChart"
import Person from "@material-ui/icons/Person"
import PersonOutline from "@material-ui/icons/PersonOutline"
import Layers from "@material-ui/icons/Layers"
import LocationCity from "@material-ui/icons/LocationCity"
import Search from "@material-ui/icons/Search"
import Visibility from "@material-ui/icons/Visibility"
import VisibilityOff from "@material-ui/icons/VisibilityOff"
import VpnKey from "@material-ui/icons/VpnKey"
import authProvider from '../_tools/authProvider';
import radiamRestProvider from '../_tools/radiamRestProvider';
import { getAPIEndpoint } from '../_tools/funcs';
import {
  DataCollectionMethodList,
  DataCollectionMethodShow,
  DataCollectionMethodCreate,
  DataCollectionMethodEdit,
} from '../DataCollectionMethod/DataCollectionMethod';
import {
  DataCollectionStatusList,
  DataCollectionStatusShow,
  DataCollectionStatusCreate,
  DataCollectionStatusEdit,
} from '../DataCollectionStatus/DataCollectionStatus';
import {
  DistributionRestrictionList,
  DistributionRestrictionShow,
  DistributionRestrictionCreate,
  DistributionRestrictionEdit,
} from '../DistributionRestriction/DistributionRestriction';
import { GroupList, GroupCreate, GroupEdit, GroupShow } from '../Groups/Groups';
import {
  GroupMemberList,
  GroupMemberShow,
  GroupMemberEdit,
  GroupMemberCreate,
} from '../GroupMembers/GroupMembers';
import {
  GroupRoleList,
  GroupRoleShow,
  GroupRoleEdit,
  GroupRoleCreate,
} from '../GroupRoles/GroupRoles';
import {
  GroupViewGrantList,
  GroupViewGrantShow,
  GroupViewGrantEdit,
  GroupViewGrantCreate,
} from '../GroupViewGrants/GroupViewGrants';
import {
  LocationTypeList,
  LocationTypeShow,
  LocationTypeCreate,
  LocationTypeEdit,
} from '../LocationTypes/LocationTypes';
import {
  ProjectList,
  ProjectShow,
  ProjectEdit,
  ProjectCreate,
  ProjectCreateForm,
} from '../Projects/Projects';
import {
  SensitivityLevelList,
  SensitivityLevelShow,
  SensitivityLevelCreate,
  SensitivityLevelEdit,
} from '../SensitivityLevel/SensitivityLevel';
import {
  UserList,
  UserCreate,
  UserShow,
  UserEditWithDeletion,
} from '../Users/Users';
import {
  UserAgentList,
  UserAgentShow,
  UserAgentEdit,
  UserAgentCreate,
} from '../UserAgents/UserAgents';
import {Layout} from "../layout/index"
import { httpClient } from '../_tools/httpClient';
import englishMessages from '../_constants/i18n/en';
import { MODELS } from '../_constants/index';
import customRoutes from '../_tools/customRoutes';
import Login from '../layout/Login.jsx';
import 'moment-timezone';
import { ToastContainer } from 'react-toastify';
import datasets from "../Datasets"
import Dashboard from '../Dashboard/Dashboard';
import RadiamMenu from '../Dashboard/RadiamMenu';
import { ProjectAvatarsList, ProjectAvatarsShow, ProjectAvatarsCreate, ProjectAvatarsEdit } from '../ProjectAvatars/ProjectAvatars';
import { LocationList, LocationCreate, LocationEdit, LocationDisplay } from '../Locations/Locations';
import polyglotI18nProvider from "ra-i18n-polyglot";
import { DatasetList } from '../Datasets/DatasetList';
import { DatasetShow, DatasetCreate, DatasetEdit, DatasetModalShow } from '../Datasets/Datasets';


const messages = {
  en: englishMessages,
}

const i18nProvider = polyglotI18nProvider((locale) => messages[locale], 'en');

const styles = {
  div: {
    backgroundColor: 'red',
  },
};

const App = props => {
  return (
    <>
      <Admin
        loginPage={Login}
        customRoutes={customRoutes}
        dashboard={Dashboard}
        menu={RadiamMenu}
        styles={styles}
        authProvider={authProvider}
        dataProvider={radiamRestProvider(getAPIEndpoint(), httpClient)}
        layout={Layout}
        i18nProvider={i18nProvider}
      >
        {permissions => { 
          return [
            <Resource
              name={MODELS.USERS}
              icon={Person}
              options={{ label: 'en.sidebar.users' }}
              list={UserList}
              show={UserShow}
              create={
                permissions.is_admin || permissions.is_group_admin
                  ? UserCreate
                  : null
              }
              edit={
                permissions.is_admin
                  ? UserEditWithDeletion
                  : null
              }
            />,

          <Resource
            name={MODELS.GROUPS}
            icon={Group}
            options={{ label: 'en.sidebar.groups' }}
            list={GroupList}
            show={GroupShow}
            edit={
              permissions.is_admin || permissions.is_group_admin
                ? GroupEdit
                : null
            }
            create={
              permissions.is_admin || permissions.is_group_admin 
              ? GroupCreate 
              : null
            }
          />,

          //groupRoles are visible to all but only modifiable by admins.
          <Resource
            name={MODELS.ROLES}
            icon={PersonOutline}
            options={{ label: 'en.sidebar.roles' }}
            list={permissions.is_admin ? GroupRoleList : null}
            show={permissions.is_admin ? GroupRoleShow : null}
            create={permissions.is_admin ? GroupRoleCreate : null}
            edit={permissions.is_admin ? GroupRoleEdit : null}
          />,

          <Resource
            name={MODELS.GROUPMEMBERS}
            icon={GroupAdd}
            options={{ label: 'en.sidebar.groupmembers' }}
            list={GroupMemberList}
            show={GroupMemberShow}
            create={
              permissions.is_admin || permissions.is_group_admin
                ? GroupMemberCreate
                : null
            }
            edit={
              permissions.is_admin || permissions.is_group_admin
                ? GroupMemberEdit
                : null
            }
          />,

          <Resource
            name={MODELS.LOCATIONTYPES}
            icon={LocationCity}
            options={{ label: 'en.sidebar.locationtypes' }}
            list={permissions.is_admin ? LocationTypeList : null}
            show={permissions.is_admin ? LocationTypeShow : null}
            create={permissions.is_admin ? LocationTypeCreate : null}
            edit={permissions.is_admin ? LocationTypeEdit: null}
          />,

          <Resource
            name={MODELS.LOCATIONS}
            icon={AddLocation}
            options={{ label: 'en.sidebar.locations' }}
            list={LocationList}
            show={LocationDisplay}
            create={LocationCreate}
            edit={permissions.is_admin ? LocationEdit : null} //Security states only SU may update locations
          />,
          
          <Resource
            name={MODELS.PROJECTS}
            icon={Layers}
            options={{ label: 'en.sidebar.projects' }}
            list={ProjectList}
            show={ProjectShow}
            create={
              permissions.is_admin || permissions.is_group_admin
                ? ProjectCreate
                : null
            }
            edit={
              permissions.is_admin || permissions.is_group_admin
                ? ProjectEdit
                : null
            }
          />,

          //TODO: what are the access permissions for datasets?
          <Resource
            name={'datasets'}
            icon={InsertChart}
            options={{ label: 'en.sidebar.datasets' }}
            list={DatasetList}
            show={ permissions.is_admin || permissions.is_group_admin || permissions.is_data_manager ? DatasetShow : DatasetModalShow}
            create={permissions.is_admin || permissions.is_group_admin ? DatasetCreate : null}
            edit={permissions.is_admin || permissions.is_group_admin ? DatasetEdit : null}
          />,

          <Resource
            name={MODELS.PROJECTAVATARS}
            icon={FlipToFront}
            options={{ label: 'en.sidebar.projectavatars' }}
            list={permissions.is_admin ? ProjectAvatarsList : null}
            show={permissions.is_admin ? ProjectAvatarsShow : null}
            create={permissions.is_admin ? ProjectAvatarsCreate : null}
            edit={permissions.is_admin ? ProjectAvatarsEdit : null}
          />,

          <Resource
            name={MODELS.DATA_COLLECTION_METHOD}
            icon={Search}
            options={{ label: 'en.sidebar.data_collection_method' }}
            list={permissions.is_admin ? DataCollectionMethodList : null}
            show={permissions.is_admin ? DataCollectionMethodShow : null}
            create={permissions.is_admin ? DataCollectionMethodCreate : null}
            edit={permissions.is_admin ? DataCollectionMethodEdit : null}
          />,

          <Resource
            name={MODELS.DATA_COLLECTION_STATUS}
            icon={AvTimer}
            options={{ label: 'en.sidebar.data_collection_status' }}
            list={permissions.is_admin ? DataCollectionStatusList : null}
            show={permissions.is_admin ? DataCollectionStatusShow : null}
            create={permissions.is_admin ? DataCollectionStatusCreate : null}
            edit={permissions.is_admin ? DataCollectionStatusEdit : null}
          />,

          <Resource
            name={MODELS.DISTRIBUTION_RESTRICTION}
            icon={VpnKey}
            options={{ label: 'en.sidebar.distribution_restriction' }}
            list={permissions.is_admin ? DistributionRestrictionList : null}
            show={permissions.is_admin ? DistributionRestrictionShow : null}
            create={permissions.is_admin ? DistributionRestrictionCreate : null}
            edit={permissions.is_admin ? DistributionRestrictionEdit : null}
          />,

          <Resource
            name={MODELS.SENSITIVITY_LEVEL}
            icon={VisibilityOff}
            options={{ label: 'en.sidebar.sensitivity_level' }}
            list={permissions.is_admin ? SensitivityLevelList : null}
            show={permissions.is_admin ? SensitivityLevelShow : null}
            create={permissions.is_admin ? SensitivityLevelCreate : null}
            edit={permissions.is_admin ? SensitivityLevelEdit : null}
          />,
          
          <Resource
            name={MODELS.GRANTS}
            icon={Visibility}
            options={{ label: 'en.sidebar.grants' }}
            list={
              permissions.is_admin || permissions.is_group_admin
                ? GroupViewGrantList
                : null
            }
            show={
              permissions.is_admin || permissions.is_group_admin
                ? GroupViewGrantShow
                : null
            }
            create={
              permissions.is_admin || permissions.is_group_admin
                ? GroupViewGrantCreate
                : null
            }
            edit={
              permissions.is_admin || permissions.is_group_admin
                ? GroupViewGrantEdit
                : null
            }
          />,

          <Resource
            name={MODELS.AGENTS}
            icon={Fingerprint}
            options={{ label: 'en.sidebar.agents' }}
            list={UserAgentList}
            show={UserAgentShow}
            create={UserAgentCreate}
            edit={permissions.is_admin || permissions.is_group_admin ? UserAgentEdit : null} //users can only edit if they can also delete.
          />,

          <Resource name={MODELS.PROJECTDATACOLLECTIONMETHOD} />,
          <Resource name={MODELS.PROJECTSENSITIVITY} />,
          <Resource name={MODELS.PROJECTSTATISTICS} />,
        ]}}
      </Admin>
      <ToastContainer />
    </>
  );
};

export default App;
