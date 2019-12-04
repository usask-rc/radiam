//App.jsx
import React from 'react';
import { Admin, Resource } from 'react-admin';
import {
  AddLocation,
  AvTimer,
  Fingerprint,
  FlipToFront,
  Group,
  GroupAdd,
  InsertChart,
  Person,
  PersonOutline,
  Layers,
  LocationCity,
  Search,
  Visibility,
  VisibilityOff,
  VpnKey,
} from '@material-ui/icons';
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
  UserEdit,
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
import * as Constants from '../_constants/index';
import customRoutes from '../_tools/customRoutes';
import Login from '../layout/Login';
import 'moment-timezone';
import { ToastContainer } from 'react-toastify';
import datasets from "../Datasets"
import locations from "../Locations"
import projectavatars from "../ProjectAvatars"
import Dashboard from '../Dashboard/Dashboard';
import RadiamMenu from '../Dashboard/RadiamMenu';
import { ProjectAvatarsList, ProjectAvatarsShow, ProjectAvatarsCreate, ProjectAvatarsEdit } from '../ProjectAvatars/ProjectAvatars';
import { LocationList, LocationCreate, LocationEdit } from '../Locations/Locations';
import { LocationShow } from '../_components/_fields/LocationShow';

const i18nProvider = locale => {
  return englishMessages;
};

const styles = {
  div: {
    backgroundColor: 'red',
  },
};

function canDoThing(permissions, record, rest){
  console.log("permissions: ", permissions, record, rest)
  if (permissions.is_admin || permissions.is_group_admin || permissions.is_data_manager)
  {
    return true
  }
  return false
}

//TODO: NOTE:
//Front-end Permissions will operate as follows as of 12/3/2019
//If a certain level of user can in any case have access to a page, we check to see if the user fulfills that level across any portion of the app, and if so, allow them access
//if they shouldn't ultimately have access to a specific instance, we can control this by limiting access to the page (Likely the Edit page) from the previous page (likely the Show page).
//ultimately, if a user shouldn't have access to something, it's the server's job to not provide access to said thing.  This will result in some errors if the user accesses values
//via the URL instead of navigating by page buttons, but that's OK.  Users know what they're getting into when they do that.
const App = props => {
  return (
    <React.Fragment>
      <Admin
        loginPage={Login}
        customRoutes={customRoutes}
        dashboard={Dashboard}
        menu={RadiamMenu}
        styles={styles}
        authProvider={authProvider}
        dataProvider={radiamRestProvider(getAPIEndpoint(), httpClient)}
        appLayout={Layout}
        i18nProvider={i18nProvider}
      >
        {permissions => { 
          return [
            <Resource
            name={Constants.models.USERS}
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
            name={Constants.models.GROUPS}
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
            name={Constants.models.ROLES}
            icon={PersonOutline}
            options={{ label: 'en.sidebar.roles' }}
            list={permissions.is_admin ? GroupRoleList : null}
            show={permissions.is_admin ? GroupRoleShow : null}
            create={permissions.is_admin ? GroupRoleCreate : null}
            edit={permissions.is_admin ? GroupRoleEdit : null}
          />,

          <Resource
            name={Constants.models.GROUPMEMBERS}
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
            name={Constants.models.LOCATIONTYPES}
            icon={LocationCity}
            options={{ label: 'en.sidebar.locationtypes' }}
            list={permissions.is_admin ? LocationTypeList : null}
            show={permissions.is_admin ? LocationTypeShow : null}
            create={permissions.is_admin ? LocationTypeCreate : null}
            edit={permissions.is_admin? LocationTypeEdit: null}
          />,

          <Resource
            name={Constants.models.LOCATIONS}
            icon={AddLocation}
            options={{ label: 'en.sidebar.locations' }}
            list={LocationList}
            show={LocationShow}
            create={LocationCreate}
            edit={permissions.is_admin ? LocationEdit : null}
          />,
          
          <Resource
            name={Constants.models.PROJECTS}
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
            {...datasets}
          />,

          <Resource
            name={Constants.models.PROJECTAVATARS}
            icon={FlipToFront}
            options={{ label: 'en.sidebar.projectavatars' }}
            list={permissions.is_admin ? ProjectAvatarsList : null}
            show={permissions.is_admin ? ProjectAvatarsShow : null}
            create={permissions.is_admin ? ProjectAvatarsCreate : null}
            edit={permissions.is_admin ? ProjectAvatarsEdit : null}
          />,

          <Resource
            name={Constants.models.DATA_COLLECTION_METHOD}
            icon={Search}
            options={{ label: 'en.sidebar.data_collection_method' }}
            list={permissions.is_admin ? DataCollectionMethodList : null}
            show={permissions.is_admin ? DataCollectionMethodShow : null}
            create={permissions.is_admin ? DataCollectionMethodCreate : null}
            edit={permissions.is_admin ? DataCollectionMethodEdit : null}
          />,

          <Resource
            name={Constants.models.DATA_COLLECTION_STATUS}
            icon={AvTimer}
            options={{ label: 'en.sidebar.data_collection_status' }}
            list={permissions.is_admin ? DataCollectionStatusList : null}
            show={permissions.is_admin ? DataCollectionStatusShow : null}
            create={permissions.is_admin ? DataCollectionStatusCreate : null}
            edit={permissions.is_admin ? DataCollectionStatusEdit : null}
          />,

          <Resource
            name={Constants.models.DISTRIBUTION_RESTRICTION}
            icon={VpnKey}
            options={{ label: 'en.sidebar.distribution_restriction' }}
            list={permissions.is_admin ? DistributionRestrictionList : null}
            show={permissions.is_admin ? DistributionRestrictionShow : null}
            create={permissions.is_admin ? DistributionRestrictionCreate : null}
            edit={permissions.is_admin ? DistributionRestrictionEdit : null}
          />,

          <Resource
            name={Constants.models.SENSITIVITY_LEVEL}
            icon={VisibilityOff}
            options={{ label: 'en.sidebar.sensitivity_level' }}
            list={permissions.is_admin ? SensitivityLevelList : null}
            show={permissions.is_admin ? SensitivityLevelShow : null}
            create={permissions.is_admin ? SensitivityLevelCreate : null}
            edit={permissions.is_admin ? SensitivityLevelEdit : null}
          />,
          
          <Resource
            name={Constants.models.GRANTS}
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
            name={Constants.models.AGENTS}
            icon={Fingerprint}
            options={{ label: 'en.sidebar.agents' }}
            list={UserAgentList}
            show={UserAgentShow}
            create={UserAgentCreate}
            edit={permissions.is_admin || permissions.is_group_admin ? UserAgentEdit : null} //users can only edit if they can also delete.
          />,

          <Resource name={Constants.models.PROJECTDATACOLLECTIONMETHOD} />,
          <Resource name={Constants.models.PROJECTSENSITIVITY} />,
          <Resource name={Constants.models.PROJECTSTATISTICS} />,
        ]}}
      </Admin>
      <ToastContainer />
    </React.Fragment>
  );
};

export default App;
