from elasticsearch import exceptions as es_exceptions
import memcache

from elasticsearch_dsl import Search
from elasticsearch_dsl import Q as ES_Q
from rest_framework.parsers import JSONParser

# from django.contrib.auth.models import User, Group
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action, permission_classes

from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.settings import api_settings, settings

from rest_framework.filters import OrderingFilter
from django.db.models.functions import Lower
from django.db.models.expressions import F, OrderBy
from django_filters.rest_framework import DjangoFilterBackend

from dry_rest_permissions.generics import (
    DRYPermissions, DRYGlobalPermissions, DRYObjectPermissions )

from radiam.api.serializers import (
    ChoiceListSerializer,
    ChoiceListValueSerializer,
    DataCollectionMethodSerializer,
    DataCollectionStatusSerializer,
    DatasetSensitivitySerializer,
    DatasetSerializer,
    DatasetDataCollectionMethodSerializer,
    DistributionRestrictionSerializer,
    ESDatasetSerializer,
    EntitySerializer,
    EntitySchemaFieldSerializer,
    ExportRequestSerializer,
    FieldSerializer,
    GeoDataSerializer,
    GroupMemberSerializer,
    GroupRoleSerializer,
    GroupViewGrantSerializer,
    LocationSerializer,
    LocationProjectSerializer,
    LocationTypeSerializer,
    MetadataUITypeSerializer,
    MetadataValueTypeSerializer,
    PasswordSerializer,
    ProjectSerializer,
    ProjectAvatarSerializer,
    ProjectStatisticsSerializer,
    ProjectUserAgentSerializer,
    ResearchGroupSerializer,
    SchemaSerializer,
    SearchModelSerializer,
    SelectedFieldSerializer,
    SelectedSchemaSerializer,
    SensitivityLevelSerializer,
    SuperuserUserSerializer,
    UserSerializer,
    UserAgentSerializer,)

# from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

from radiam.api.filters import *

from .models import (
    ChoiceList,
    ChoiceListValue,
    DataCollectionMethod,
    DataCollectionStatus,
    Dataset,
    DatasetSensitivity,
    DatasetDataCollectionMethod,
    DistributionRestriction,
    Entity,
    ExportRequest,
    Field,
    GeoData,
    GroupMember,
    GroupRole,
    GroupViewGrant,
    Location,
    LocationProject,
    LocationType,
    MetadataUIType,
    MetadataValueType,
    Project,
    ProjectAvatar,
    ProjectStatistics,
    ResearchGroup,
    Schema,
    SearchModel,
    SelectedField,
    SelectedSchema,
    SensitivityLevel,
    User,
    UserAgent,
    UserAgentProjectConfig)

from .signals import radiam_user_created, radiam_project_created, radiam_project_deleted



from radiam.api.documents import DatasetMetadataDoc
from radiam.api.documents import ProjectMetadataDoc
from radiam.api.documents import ResearchGroupMetadataDoc
from radiam.api.search.documents import ESDataset
from .exceptions import BadRequestException, InternalErrorException, ProjectNotFoundException, \
    ItemNotCreatedException, ElasticSearchRequestError
from .permissions import IsSuperuserOrSelf

from .services import SearchService, GeoSearchService

from .search import RadiamService, _SearchService, _IndexService
from .search.pagination import PageNumberPagination
# from .search.filters import ActiveModelFilter

from rest_framework import pagination

from rest_framework.exceptions import APIException
from rest_framework import status
from rest_framework import filters


# Imports for django_rest_passwordreset override until open issue is resolved
from django_rest_passwordreset.views import ResetPasswordRequestToken

from datetime import timedelta
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
from django.db import connection
from rest_framework import exceptions
from rest_framework.response import Response


from django_rest_passwordreset.serializers import EmailSerializer, PasswordTokenSerializer
from django_rest_passwordreset.models import ResetPasswordToken, clear_expired, get_password_reset_token_expiry_time
from django_rest_passwordreset.signals import reset_password_token_created, pre_password_reset, post_password_reset

from django.http import HttpResponse

from io import BytesIO
from zipfile import ZipFile
import hashlib
from datetime import datetime
from itertools import chain
# end


def appendCorsHeader(response, model):

    if response.get('Access-Control-Expose-Headers', None):
        response['Access-Control-Expose-Headers'].append("X-Total-Count")
    else:
        response['Access-Control-Expose-Headers'] = ["X-Total-Count"]

    response['X-Total-Count'] = model.objects.all().count()


class PageSizePagination(pagination.PageNumberPagination):
    """
    Define a standard page query parameter and maximum page size for the endpoints.
    """
    page_size_query_param = "page_size"
    max_page_size = 1000


class RadiamViewSet(viewsets.ModelViewSet):
    """
    Parent class to most endpoints that defines the way to list items including paging
    or referring to items by their ids. Give a basic ordering as well.
    """
    # Properties that need to be overridden
    filter_fields = None
    ordering_fields = None
    queryset = None

    pagination_class = PageSizePagination

    filter_backends = (
       DjangoFilterBackend,
       OrderingFilter,
    )

    def list(self, request, *args, **kwargs):
        # Check if this request is for a list of particular items
        ids = request.query_params.get('ids')
        if ids:
            ids = [request_id.strip() for request_id in ids.split(',')]
            queryset = self.filter_queryset(self.get_queryset()).filter(pk__in=ids)
            serializer = self.get_serializer(queryset, many=True)
            response = Response(serializer.data)
        else:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response = self.get_paginated_response(serializer.data)
            else:
                serializer = self.get_serializer(queryset, many=True)
                response = Response(serializer.data)

        appendCorsHeader(response, ResearchGroup)
        return response

class MetadataViewset():
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            instance = serializer.save()
            doc = self.MetadataDoc.get(instance.id)
            fields = dict()
            if 'metadata' in request.data.keys() and request.data['metadata'] is not None:
                fields['metadata'] = request.data['metadata']
            else:
                fields['metadata'] = {}
            doc.update(**fields)
        except ElasticSearchRequestError as error:
            raise ItemNotCreatedException(detail=error.info['error']['root_cause'][0]['reason'])
        except Exception as error:
            if hasattr(error, 'info') and \
                hasattr(error.info, 'error') and \
                hasattr(error.info['error'], 'root_cause') and \
                hasattr(error.info['error']['root_cause'].length > 0) and \
                hasattr(error.info['error']['root_cause'][0], 'reason'):
                raise InternalErrorException(detail=error.info['error']['root_cause'][0]['reason'])
            else:
                raise InternalErrorException(detail=error)

        else:
            #success
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def sanitize_empty_values(self, metadata):
        """
        Prevent errors with elastic search for empty string values.
        When an empty string is passed to a date or number type it causes an error instead of removing the data.
        This function trims strings down to an empty string and then replace them with None.
        """
        if isinstance(metadata, dict):
            sanitized = dict()
            for key, value in metadata.items():
                if isinstance(value, dict):
                    sanitized[key] = self.sanitize_empty_values(value)
                elif key == 'value' and isinstance(value, str) and value.strip() == "":
                    sanitized[key] = None
                else:
                    sanitized[key] = value
            return sanitized
        else:
            print("Passed a non dictionary to sanitize_empty_values which seems wrong. Returning " + str(metadata))
            return metadata

    def update(self, request, pk, **kwargs):
        if pk is not None and self.request.data is not None:
            metadata = self.request.data.get("metadata")
            if metadata is None:
                return None
            metadata = self.sanitize_empty_values(metadata)
            parser_classes = (JSONParser,)
            try:
                try:
                    doc = self.MetadataDoc.get(pk)
                    fields = dict()
                    fields['metadata'] = metadata
                    doc.update(**fields)
                except es_exceptions.NotFoundError:
                    fields = dict()
                    fields['meta'] = { 'id': pk }
                    fields['metadata'] = metadata

                doc = self.MetadataDoc(**fields)

                doc.save()
            except Exception as error:
                raise InternalErrorException(detail=error.info['error']['root_cause'][0]['reason'])

            return None

    def partial_update(self, request, pk, **kwargs):
        return MetadataViewset.update(self, request, pk, **kwargs)

class RadiamOrderingFilter(OrderingFilter):
    """
    get_replacements expects a list of tuples of ('rest_parameter', ['replaced_by']) where
    rest_parameter is the string value of the query string parameter to replace and
    replaced_by can be a list of query string parameters to add to the ordering instead
    """
    STRING_ORDERING_FIELDS = ['name', 'display_name', '-name', '-display_name']

    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)
        if ordering:
            case_insensitive_ordering = []

            for field in ordering:
                if field not in self.STRING_ORDERING_FIELDS:
                    if field.startswith('-'):
                        case_insensitive_ordering.append(F(field[1:]).desc())
                    else:
                        case_insensitive_ordering.append(F(field).asc())
                elif field.startswith('-'):
                    case_insensitive_ordering.append(Lower(field[1:]).desc())
                else:
                    case_insensitive_ordering.append(Lower(field).asc())
            queryset = queryset.order_by(*case_insensitive_ordering)


        return queryset

    def get_replacements(self):
        raise NotImplementedError(".get_replacements() must be overridden.")

    def get_ordering(self, request, queryset, view):
        params = request.query_params.get(self.ordering_param)
        if params:
            fields = [param.strip() for param in params.split(',')]
            ordering = self.remove_invalid_fields(queryset, fields, view, request)
            if ordering:
                for param, replacement in self.get_replacements():
                    try:
                        index = ordering.index(param)
                        ordering[index:index+1] = replacement
                    except ValueError:
                        try:
                            index = ordering.index("-" + param)
                            negativeReplacement = ['-' + replacementValue for replacementValue in replacement]
                            ordering[index:index+1] = negativeReplacement
                        except ValueError:
                            pass
                return ordering

        # No ordering was included, or all the ordering fields were invalid
        return self.get_default_ordering(view)

class CaseInsensitiveOrderingFilter(OrderingFilter):
    STRING_ORDERING_FIELDS = [ 'first_name', 'last_name', '-first_name', '-last_name']

    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)
        if ordering:
            case_insensitive_ordering = []

            for field in ordering:
                if field not in self.STRING_ORDERING_FIELDS:
                    if field.startswith('-'):
                        case_insensitive_ordering.append(F(field[1:]).desc())
                    else:
                        case_insensitive_ordering.append(F(field).asc())
                elif field.startswith('-'):
                    case_insensitive_ordering.append(Lower(field[1:]).desc())
                else:
                    case_insensitive_ordering.append(Lower(field).asc())
            queryset = queryset.order_by(*case_insensitive_ordering)


        return queryset


class GeoSearchMixin(object):
    """
    Mixin that contains Application-side join search for geo-queries.

    Provides a /search action on a ViewSet that will accept a search query for
    index 'self.search_index', and a geoquery to be run on 'geodata'. An
    'Application-side join' is performed by filtering the search_query results
    by the id's returned in geoquery.

    request.data =
    {
        "search_query":{
            ... (valid Elasticsearch query)
        },
        "geoquery": {
            ... (valid Elasticsearch query with a geoquery filter context
        }
    }
    """

    @action(methods=['get'],
            detail=False,
            url_name='search')
    def search(self, request):
        self.geo_query_key = 'geo_query'

        if self.geo_query_key in request.data:
            geosearch_service = GeoSearchService(
                self.search_index,
                'query',
                'geo_query',
                'geodata'
            )
            results = geosearch_service.search(request.data)
        else:
            search_service = SearchService(
                self.search_index,
                'query'
            )
            results = search_service.search(request.data)

        self.queryset = self.filter_queryset_by_ids(
            self.get_queryset(),
            results
        )

        page = self.paginate_queryset(self.queryset)
        serializer = self.get_serializer(page, many=True)

        return self.get_paginated_response(serializer.data)

    def filter_queryset_by_ids(self, queryset, results):
        ids = [r.meta.id for r in results.hits]
        return queryset.filter(id__in=ids)

        return queryset
    # def _perform_search(self, data):
    #     """
    #     Perform the search without a geoquery filter.
    #     """
    #     search = Search.from_dict(data.pop('query'))
    #     search = search.index(self.search_index)
    #
    #     return search.execute()

    # def _perform_geoquery_search(self, data):
    #     """
    #     Perform the search, filtering results by id's of 'hits' from the
    #     geoquery.
    #     """
    #     search = Search.from_dict(data.pop('query'))
    #     search = search.index(self.search_index)
    #
    #     geo_query = data.pop(self.geo_query_key)
    #     ids = self._get_ids_from_geoquery(geo_query)
    #
    #     search = search.filter("terms", _id=ids)
    #
    #     return search.execute()

    # def _get_ids_from_geoquery(self, geo_query):
    #     """
    #     Return a list of id's of 'hits' in the geoquery results.
    #     """
    #     # geo_search = Search()
    #     geo_search = self._get_search()
    #     geo_search = geo_search.from_dict(geo_query)
    #     geo_search = geo_search.index('geodata')
    #     geo_results = geo_search.execute()
    #
    #     print(geo_results)
    #     # print(geo_results.__class__)
    #
    #     ids = [ r.object_id for r in geo_results ]
    #
    #     return ids

    # def _get_search(self):
    #     return Search()


class UserViewSet(RadiamViewSet):
    """
    list:
    Return a list of all existing users.

    create:
    Create a new user.

    retrieve:
    Retrieve an existing user.

    update:
    Update an existing user.

    partial_update

    delete:
    Delete a given user.
    """
    queryset = User.objects.all().order_by('last_name', 'first_name', 'username')

    filter_backends = (
       filters.SearchFilter,
       DjangoFilterBackend,
       RadiamAuthUserFilter,
       CaseInsensitiveOrderingFilter,
    )
    search_fields = ['username', 'first_name', 'last_name', 'email']
    filter_fields = ('username','first_name','last_name', 'id', 'email')
    ordering_fields = ('username','first_name','last_name', 'email', 'date_created', 'date_updated', 'notes')
    ordering = ('first_name', 'last_name', 'username', )
    permission_classes = (IsAuthenticated, DRYPermissions,)

    # permission_classes = (IsSuperuserOrSelf,)
    #
    # def get_permissions(self):
    #     print(self.action)
    #     if self.action == 'set_password':
    #         permission_classes = [IsSuperuserOrSelf]
    #     else:
    #         pass
    #     print('get_permissions')
    #     return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.request.user.is_superuser:
            return SuperuserUserSerializer
        else:
            return UserSerializer

    @action(methods=['post'],
            detail=True,
            permission_classes=[IsSuperuserOrSelf,],
            url_name='set-password')
    def set_password(self, request, pk=None):
        """
        Change password endpoint for User model
        """

        self.permission_classes = (IsSuperuserOrSelf,)

        user = User.objects.get(id=pk)
        serializer = PasswordSerializer(data=request.data, context={'user': user})
        self.permission_classes = (IsSuperuserOrSelf,)

        if serializer.is_valid():
            user.set_password(serializer.data.get('new_password'))
            user.save()

            return Response('The password has been changed')

        else:
            raise APIException(serializer.errors)

    @action(methods=['get'],
            detail=False,
            url_name='current-user')
    def current(self, request):
        user = User.objects.get(username=request.user)
        serializer = self.get_serializer(user)

        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        self.filter_backends += (ActiveModelFilter,)

        return super().list(request, *args, **kwargs)


class UserAgentOrderingFilter(RadiamOrderingFilter):
    def get_replacements(self):
        location = ('location', ['location__display_name', 'location__host_name'])
        user = ('user', ['user__last_name', 'user__first_name', 'user__username'])
        return [location, user]


class SearchModelViewSet(RadiamViewSet):
    """
    SearchModel endpoint to define a dataset and a search query
    """
    queryset = SearchModel.objects.all().order_by('dataset')
    serializer_class = SearchModelSerializer

    filter_fields = ('dataset', 'id')
    ordering_fields = ('dataset',)
    ordering = ('dataset')
    permission_classes = (IsAuthenticated, DRYPermissions,)


class UserAgentViewSet(RadiamViewSet):
    """
    API endpoint that allows user agents to be viewed or edited
    """
    queryset = UserAgent.objects.all().order_by('user', 'location')
    serializer_class = UserAgentSerializer

    filter_fields = ('user','location','id')
    ordering_fields = ('user','location')

    filter_backends = (
       DjangoFilterBackend,
       RadiamAuthUseragentFilter,
       UserAgentOrderingFilter,
    )

    def get_project_filter(self):
        return self.request.query_params.get("project")

    def filter_queryset(self, queryset):
        project = self.get_project_filter()
        if project:
            configs = UserAgentProjectConfig.objects.all().filter(project=project)
            if configs.count() == 0:
                return UserAgentOrderingFilter.objects.none()
            agent_id_qs = Q()
            for config in configs:
                agent_id_qs = agent_id_qs | Q(id=config.agent.id)
            return super().filter_queryset(queryset).filter(agent_id_qs)
        else:
            return super().filter_queryset(queryset)

    @action(methods=['get'],
            detail=False,
            url_name='osf_configs',
            permission_classes=[AllowAny])
    def osf_configs(self, request):

        # Restricted to internal Docker network requests
        request_addr = request.META["REMOTE_ADDR"]
        if not (request_addr.startswith("172") or request_addr.startswith("192.168") or request_addr.startswith("10")):
            data = {"error": "401", "access_token": "", "refresh_token": "","host": request.META.get("REMOTE_ADDR")}       
        #if ('HTTP_X_FORWARDED_FOR' not in request.META) or (not request.META['HTTP_X_FORWARDED_FOR'].startswith("172") and not request.META['HTTP_X_FORWARDED_FOR'].startswith("192.168") and not request.META['HTTP_X_FORWARDED_FOR'].startswith("10")):
        #    data = {"error": "401", "access_token": "", "refresh_token": "","host": request.META.get("HTTP_X_FORWARDED_FOR")}
            return Response(data, status=status.HTTP_401_UNAUTHORIZED)

        resp = self.osf_agent_token_query()

        data = []
        for item in resp:
            result = {
                "user_agent_id": item[0],
                "remote_api_token": item[1],
                "loc_id": item[2],
                "osf_project": item[3],
                "project_id": item[4],
                "local_access_token": item[5],
                "local_refresh_token": item[6],
            }
            data.append(result)

        return Response(data)


    def osf_agent_token_query(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "select agents.id as user_agent_id, "
                        "agents.remote_api_token, "
                        "loc.id as loc_id, "
                        "loc.osf_project, "
                        "agent_config.project_id, "
                        "agents.local_access_token, "
                        "agents.local_refresh_token "
                "from rdm_locations loc "
                "join rdm_location_types loc_type on loc.location_type_id = loc_type.id "
                "join rdm_user_agents agents on agents.location_id = loc.id "
                "join rdm_user_agent_project_config agent_config on agent_config.agent_id = agents.id "
                "where loc_type.label = 'location.type.osf'")

            rows = cursor.fetchall()

        return rows

class ResearchGroupOrderingFilter(RadiamOrderingFilter):
    def get_replacements(self):
        parent_group = ('parent_group', ['parent_group__name'])
        return [parent_group]


class ResearchGroupViewSet(RadiamViewSet, MetadataViewset):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = ResearchGroup.objects.all().order_by('name')
    # queryset = ResearchGroup.objects.filter(
    #     groupmember__user=request.user
    # )

    serializer_class = ResearchGroupSerializer
    # Set the default ordering so that parent groups will be ordered properly
    ordering = ('name',)

    permission_classes = (IsAuthenticated, DRYPermissions,)
    search_fields = ['name', 'description']
    filter_fields = ('id', 'name', 'description', 'parent_group')
    ordering_fields = ('name', 'description', 'date_created', 'date_updated', 'parent_group')

    filter_backends = (
        filters.SearchFilter,
        DjangoFilterBackend,
        RadiamAuthResearchGroupFilter,
        ResearchGroupOrderingFilter,
    )

    MetadataDoc = ResearchGroupMetadataDoc

    def create(self, request, *args, **kwargs):
        return MetadataViewset.create(self, request, *args, **kwargs)

    def update(self, request, pk, **kwargs):
        response = MetadataViewset.update(self, request, pk)
        if response is not None:
            return response
        else:
            return super().update(request, pk, **kwargs)

    def partial_update(self, request, pk, **kwargs):
        kwargs['partial'] = True
        response = MetadataViewset.partial_update(self, request, pk)
        if response is not None:
            return response
        else:
            return super().partial_update(request, pk, **kwargs)

    def list(self, request, *args, **kwargs):
        self.filter_backends += (ActiveModelFilter,)

        return super().list(request, *args, **kwargs)


class GroupRoleViewSet(RadiamViewSet):
    """
    API endpoint that allows group roles to be viewed or edited.
    """
    queryset = GroupRole.objects.all().order_by('label')
    serializer_class = GroupRoleSerializer

    filter_fields=('label', 'description', 'id')
    ordering_fields=('label', 'description')
    ordering = ('label', )
    permission_classes = (IsAuthenticated, DRYPermissions,)


class GroupMemberOrderingFilter(RadiamOrderingFilter):
    def get_replacements(self):
        user = ('user', ['user__last_name', 'user__first_name', 'user__username'])
        group = ('group', ['group__name'])
        group_role = ('group_role', ['group_role__label'])
        return [user, group, group_role]


class GroupMemberViewSet(RadiamViewSet):
    """
    API endpoint that allows group members to be viewed or edited.
    """
    queryset = GroupMember.objects.all().order_by('group')
    serializer_class = GroupMemberSerializer

    filter_backends = (
        DjangoFilterBackend,
        RadiamAuthGroupMemberFilter,
        GroupMemberOrderingFilter,
    )

    filter_fields=('group', 'group_role', 'user', 'date_expires')
    ordering_fields=('group', 'group_role', 'user', 'date_expires', 'date_created', 'date_updated')
    permission_classes = (IsAuthenticated, DRYPermissions,)

    def list(self, request, *args, **kwargs):
        self.filter_backends += (ActiveModelFilter,)

        return super().list(request, *args, **kwargs)


class DatasetOrderingFilter(RadiamOrderingFilter):
    def get_replacements(self):
        project = ('project', ['project__name'])
        return [project]


class DatasetViewSet(RadiamViewSet, GeoSearchMixin, MetadataViewset):
    """
    API endpoint that allows datasets to be viewed or edited.
    """
    queryset = Dataset.objects.all().order_by('date_updated')
    serializer_class = DatasetSerializer

    search_index = 'dataset_metadata'

    filter_backends = (
        filters.SearchFilter,
        DjangoFilterBackend,
        RadiamAuthDatasetFilter,
        DatasetOrderingFilter,
    )
    search_fields = ['title', 'study_site']
    filter_fields=('title', 'study_site', 'project', 'id')
    ordering_fields=('title', 'study_site', 'project', 'date_created', 'date_updated')
    ordering = ('title', )
    permission_classes = (IsAuthenticated, DRYPermissions,)

    MetadataDoc = DatasetMetadataDoc

    def create(self, request, *args, **kwargs):
        return MetadataViewset.create(self, request, *args, **kwargs)

    def update(self, request, pk, **kwargs):
        response = MetadataViewset.update(self, request, pk)
        if response is not None:
            return response
        else:
            return super().update(request, pk)

    def partial_update(self, request, pk, **kwargs):
        kwargs['partial'] = True
        response = MetadataViewset.partial_update(self, request, pk, **kwargs)
        if response is not None:
            return response
        else:
            return super().update(request, pk, **kwargs)

    @action(methods=['post'],
            detail=True,
            url_name='search',
            permission_classes=(IsAuthenticated,))
    def search(self, request, pk=None):
        """
        Elasticsearch Search within a specific dataset's index
        """

        dataset_id = pk

        self.serializer_class = ESDatasetSerializer

        query = request.data

        # any more validation that needs to be done?
        dataset = Dataset.objects.get(id=dataset_id)

        # radiam_service = RadiamService(str(dataset.id))
        dataset = Dataset.objects.get(id=dataset_id)
        project = Project.objects.get(dataset__id=dataset_id)
        search_model = SearchModel.objects.get(dataset__id=dataset.id)

        search = Search.from_dict(query)
        search = search.index(str(project.id))

        # Are the Service classes needed anymore?
        search_service = _SearchService(search)

        sort = None
        order = None

        for key, value in request.query_params.items():
            if key in ['page_size', 'page']:
                continue
            elif key == 'ordering':
                sort = value
            # elif key != 'q':
            #     # squeeze Windows double-backslashes in path/path_parent
            #     if key in ['path', 'path_parent']:
            #         value = value.replace("\\\\", "\\")
            #
            #     search_service.add_match(key, value)
            else:
                pass

        # Is it possible for a Dataset to be the entire contents of a project index?
        # In that case, create another code path that doesn't apply a filter
        if search_model.search:
            search_service.search = search_service.search.query('bool', filter=[ES_Q(search_model.search)])

        self.queryset = search_service.search
        if not sort:
            self.queryset = self.queryset.sort()
        else:
            self.queryset = self.queryset.sort(sort)

        page = self.paginate_queryset(self.queryset)
        serializer = self.get_serializer(page, many=True)

        return self.get_paginated_response(serializer.data)

    def destroy(self, request, pk, *args, **kwargs):
        dataset = Dataset.objects.get(id=pk)
        # TODO Need to delete the elastic search record
        return super().destroy(request, pk, *args, **kwargs)

    # @action(methods=['get'],
    #         detail=False,
    #         url_name='search')
    # def search(self, request):
    #
    #     geo_query_key = 'geo_query'
    #
    #     query = request.data.pop('query')
    #
    #     search = Search.from_dict(query)
    #     search = search.index('dataset_metadata')
    #
    #     if geo_query_key in request.data:
    #         # if a geo_query is sent, restrict the doc query
    #         # by id's of geo-hits
    #         geo_query = request.data.pop(geo_query_key)
    #         ids = self._get_ids_from_geoquery(geo_query)
    #
    #         search = search.filter("terms", _id=ids)
    #
    #     results = search.execute()
    #
    #     project_ids = [ r.meta.id for r in results.hits ]
    #
    #     self.queryset = self.get_queryset().filter(id__in=project_ids)
    #
    #     page = self.paginate_queryset(self.queryset)
    #     serializer = self.get_serializer(page, many=True)
    #
    #     return self.get_paginated_response(serializer.data)


class DatasetExportViewSet(viewsets.GenericViewSet):
    """
    API endpoint for exporting metadata related to datasets
    """

    def list(self, request, dataset_id):
        export_request = ExportRequest.objects.create(status="In progress", export_reference=dataset_id)
        export_request.save()
        return Response(export_request.id)


class ExportRequestViewSet(RadiamViewSet):
    """
    API endpoint for request for exporting metadata
    """
    queryset = ExportRequest.objects.all().order_by('status')
    serializer_class = ExportRequestSerializer

    filter_backends = (
        filters.SearchFilter,
        DjangoFilterBackend,
        RadiamAuthDatasetDetailFilter,
    )

    search_fields = ['id', 'status', 'export_reference']
    permission_classes = (IsAuthenticated, DRYPermissions,)

    def get_bag_metadata(self, contact_name, contact_email, project_name, abstract, dataset_title, sensitivity_level,
                         restrictions, status, site, method):

        bag_metadata = "Contact-Name: " + contact_name + "\n" \
        + "Contact-Email: " + contact_email + "\n" \
        + "Bag-Software-Agent: Radiam" + "\n" \
        + "Package-Time: " + datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + "\n" \
        + "Contact-Organization: " + project_name + "\n" \
        + "External-Description: " + abstract + "\n" \
        + "External-Identifier: " + dataset_title + "\n" \
        + "Sensitivity-Level: " + sensitivity_level + "\n" \
        + "Dataset-Restrictions: " + restrictions + "\n" \
        + "Dataset-Status: " + status + "\n" \
        + "Dataset-Site: " + site + "\n" \
        + "Dataset-Method: " + method + "\n"

        return bag_metadata

    @action(methods=['get'],
            detail=True,
            url_name='download',
            permission_classes=(IsAuthenticated,))
    def download(self, request, pk=None):
        export = ExportRequest.objects.get(id=pk)
        if export.status == 'In progress' or export.status == 'Complete':
            # Fetch data from tables as strings
            user = User.objects.get(id=request.user.id)
            dataset = Dataset.objects.get(id=export.export_reference)
            sensitivity_levels = ""
            if dataset.get_sensitivity_levels():
                for s in dataset.get_sensitivity_levels():
                    sensitivity_levels += s.label + ", "
                sensitivity_levels = sensitivity_levels[:-2]
            collection_methods = ""
            if dataset.get_data_collection_methods():
                for m in dataset.get_data_collection_methods():
                    collection_methods += m.label + ", "
                collection_methods = collection_methods[:-2]
            ##

            in_memory = BytesIO()
            zip = ZipFile(in_memory, "a")

            # BagIt format
            # Bag Declaration
            bagit_name = "bagit.txt"
            bagit_content = "BagIt-Version: 1.0\nTag-File-Character-Encoding: UTF-8"
            zip.writestr(bagit_name, bagit_content)
            # Bag Metadata
            bagmeta_name = "bag-info.txt"
            bagmeta_content = self.get_bag_metadata(user.first_name + " " + user.last_name, user.email, dataset.project.name,
                                                    dataset.abstract, dataset.title, sensitivity_levels,
                                                    dataset.distribution_restriction.label, dataset.data_collection_status.label,
                                                    dataset.study_site, collection_methods)
            zip.writestr(bagmeta_name, bagmeta_content)

            # Payload Directory
            # TODO for every separated piece of metadata: add to data folder w/contents, add to manifest file w/ checksum, write to zipfile
            data_name = "data/metadata.txt"
            data_content = "project_name = " + str(dataset.project.name)
            zip.writestr(data_name, data_content)
            # Payload Manifest
            manifest_name = "manifest-sha256.txt"
            checksum = hashlib.sha256(data_content.encode('utf-8')).hexdigest()
            manifest_content = checksum + " " + data_name
            ##


            zip.writestr(manifest_name, manifest_content)
            # Tag Manifest
            tagman_name = "tagmanifest-sha256.txt"
            tagman_content = hashlib.sha256(bagit_content.encode('utf-8')).hexdigest() + " " + bagit_name + "\n" \
                        + hashlib.sha256(bagmeta_content.encode('utf-8')).hexdigest() + " " + bagmeta_name + "\n" \
                        + hashlib.sha256(manifest_content.encode('utf-8')).hexdigest() + " " + manifest_name
            zip.writestr(tagman_name, tagman_content)

            # read in Windows
            for file in zip.filelist:
                file.create_system = 0

            zip.close()

            zipfilename = str(dataset.project.id) + "_radiam_download.zip"
            response = HttpResponse(content_type="application/zip")
            response['Content-Disposition'] = 'attachment; filename={0}'.format(zipfilename)

            in_memory.seek(0)
            response.write(in_memory.read())

            return response

        else:
            return Response("Export request has unknown status")


class DatasetDataCollectionMethodViewSet(RadiamViewSet):
    """
    API endpoint that allows the association of datasets with multiple data collection methods.
    """
    queryset = DatasetDataCollectionMethod.objects.all().order_by('dataset')
    serializer_class = DatasetDataCollectionMethodSerializer

    filter_backends = (
        DjangoFilterBackend,
        RadiamAuthDatasetDetailFilter,
    )

    filter_fields=('dataset', 'data_collection_method')
    permission_classes = (IsAuthenticated, DRYPermissions,)


class DataCollectionMethodViewSet(RadiamViewSet):
    """
    API endpoint that allows the editing of data collection methods.
    """
    queryset = DataCollectionMethod.objects.all().order_by('label')
    serializer_class = DataCollectionMethodSerializer

    filter_fields=('label',) #trailing comma required for lists with only one member
    ordering_fields=('label',) #trailing comma required for lists with only one member
    permission_classes = (IsAuthenticated, DRYPermissions,)


class SensitivityLevelViewSet(RadiamViewSet):
    """
    API endpoint that allows the editing of sensitivity levels.
    """
    queryset = SensitivityLevel.objects.all().order_by('label')
    serializer_class = SensitivityLevelSerializer

    filter_fields=('label',) #trailing comma required for lists with only one member
    ordering_fields=('label',) #trailing comma required for lists with only one member
    permission_classes = (IsAuthenticated, DRYPermissions,)


class DatasetSensitivityViewSet(RadiamViewSet):
    """
    API endpoint that allows the association of datasets with multiple sensitivity levels.
    """
    queryset = DatasetSensitivity.objects.all().order_by('dataset')
    serializer_class = DatasetSensitivitySerializer

    filter_backends = (
        DjangoFilterBackend,
        RadiamAuthDatasetDetailFilter,
    )

    filter_fields=('dataset', 'sensitivity')
    permission_classes = (IsAuthenticated, DRYPermissions,)

class LocationProjectViewSet(RadiamViewSet):
    """
    API endpoint that allows the association of locations with multiple projects.
    """
    queryset = LocationProject.objects.all().order_by('location')
    serializer_class = LocationProjectSerializer

    filter_backends = (
        DjangoFilterBackend,

    )

    filter_fields=('location', 'project')
    permission_classes = (IsAuthenticated, DRYPermissions,)


class GroupViewGrantOrderingFilter(RadiamOrderingFilter):
    def get_replacements(self):
        group = ('group', ['group__name'])
        dataset = ('dataset', ['dataset__title'])
        return [group, dataset]


class GroupViewGrantViewSet(RadiamViewSet):
    """
    API endpoint that allows group view grants to be viewed or edited.
    """
    queryset = GroupViewGrant.objects.all().order_by('dataset')
    serializer_class = GroupViewGrantSerializer

    filter_backends = (
        filters.SearchFilter,
        DjangoFilterBackend,
        RadiamAuthGroupViewGrantFilter,
        GroupViewGrantOrderingFilter,
    )

    search_fields = ['fields']
    filter_fields = ('group', 'dataset', 'fields')
    ordering_fields = ('group', 'dataset', 'fields', 'date_created', 'date_updated', 'date_starts', 'date_expires')
    permission_classes = (IsAuthenticated, DRYPermissions,)


class LocationOrderingFilter(RadiamOrderingFilter):
    def get_replacements(self):
        return [('location_type', ['location_type__label'])]


class LocationViewSet(RadiamViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    queryset = Location.objects.all().order_by('display_name')
    serializer_class = LocationSerializer

    filter_backends = (
        filters.SearchFilter,
        DjangoFilterBackend,
        RadiamAuthLocationFilter,
        LocationOrderingFilter,
    )

    search_fields = ['display_name', 'host_name', 'locationproject__project__id', 'locationproject__project__name']
    filter_fields=('display_name', 'host_name', 'location_type')
    ordering_fields=('display_name', 'host_name', 'location_type', 'date_created', 'date_updated', 'globus_endpoint', 'globus_path', 'portal_url', 'osf_project', 'notes')
    ordering = ('display_name')

    def get_project_filter(self):
        return self.request.query_params.get("project")

    def filter_queryset(self, queryset):
        project = self.get_project_filter()
        if project:
            configs = UserAgentProjectConfig.objects.all().filter(project=project)
            if configs.count() == 0:
                return LocationOrderingFilter.objects.none()
            agent_id_qs = Q()
            for config in configs:
                agent_id_qs = agent_id_qs | Q(id=config.agent.id)
            agents = UserAgent.objects.all().filter(agent_id_qs)
            if agents.count() == 0:
                return LocationOrderingFilter.objects.none()
            location_id_qs = Q()
            for agent in agents:
                location_id_qs = location_id_qs | Q(id=agent.location.id)
            return super().filter_queryset(queryset).filter(location_id_qs)
        else:
            return super().filter_queryset(queryset)

    def list(self, request, *args, **kwargs):
        self.filter_backends += (ActiveModelFilter,)

        return super().list(request, *args, **kwargs)

class LocationTypeViewSet(RadiamViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    queryset = LocationType.objects.all().order_by('label')
    serializer_class = LocationTypeSerializer

    filter_fields=('label',) #trailing comma required for lists with only one member
    ordering_fields=('label',) #trailing comma required for lists with only one member
    permission_classes = (IsAuthenticated, DRYPermissions,)


class DistributionRestrictionViewSet(RadiamViewSet):
    """
    API endpoint that allows distribution restrictions to be viewed or edited.
    """
    queryset = DistributionRestriction.objects.all().order_by('label')
    serializer_class = DistributionRestrictionSerializer

    filter_fields=('label',) #trailing comma required for lists with only one member
    ordering_fields=('label',) #trailing comma required for lists with only one member
    permission_classes = (IsAuthenticated, DRYPermissions,)


class DataCollectionStatusViewSet(RadiamViewSet):
    """
    API endpoint that allows data collection statuses to be viewed or edited.
    """
    queryset = DataCollectionStatus.objects.all().order_by('label')
    serializer_class = DataCollectionStatusSerializer

    filter_fields=('label',) #trailing comma required for lists with only one member
    ordering_fields=('label',) #trailing comma required for lists with only one member
    permission_classes = (IsAuthenticated, DRYPermissions,)


class ProjectStatisticsViewSet(RadiamViewSet):
    """
    API endpoint that allows project statistics to be viewed or edited.
    """
    queryset = ProjectStatistics.objects.all().order_by('project')
    serializer_class = ProjectStatisticsSerializer

    filter_backends = (
        DjangoFilterBackend,
        RadiamAuthProjectStatisticsFilter,
        OrderingFilter,
    )

    filter_fields=('project','stat_key')
    ordering_fields=('stat_key', 'stat_date', 'stat_qualifier', 'stat_value')
    permission_classes = (IsAuthenticated, DRYPermissions,)


class ProjectOrderingFilter(RadiamOrderingFilter):
    def get_replacements(self):
        group = ('group', ['group__name'])
        primary_contact_user = ('primary_contact_user', ['primary_contact_user__last_name', 'primary_contact_user__first_name', 'primary_contact_user__username'])
        return [group, primary_contact_user]


class ProjectViewSet(RadiamViewSet, GeoSearchMixin, MetadataViewset):
    """
    API endpoint that allows projects to be viewed or edited.
    """
    queryset = Project.objects.all().order_by('date_updated')
    serializer_class = ProjectSerializer
    search_index = 'project_metadata'

    parser_classes = (JSONParser,)

    filter_backends = (
        filters.SearchFilter,
        DjangoFilterBackend,
        RadiamAuthProjectFilter,
        ProjectOrderingFilter,
    )
    search_fields = ['name', 'keywords']
    filter_fields=('name', 'number', 'keywords', 'group', 'id')
    ordering_fields=('name', 'number', 'keywords', 'group', 'primary_contact_user', 'date_created', 'date_updated')
    ordering = ('name', )
    permission_classes = (IsAuthenticated, DRYPermissions,)

    MetadataDoc = ProjectMetadataDoc

    def destroy(self, request, pk, *args, **kwargs):
        project = Project.objects.get(id=pk)
        radiam_project_deleted.send(sender=self.__class__,
                                    project=project,
                                    request=request)
        return super().destroy(request, pk, *args, **kwargs)

    @action(methods=['get'],
            detail=True,
            url_name='agents')
    def agents(self, request, pk=None):
        useragents = UserAgent.objects.filter(
            useragentprojectconfig__project__id=pk,
        )
        serializer = ProjectUserAgentSerializer(
            data=useragents, many=True, context={'request': request, 'view': self}
        )
        serializer.is_valid()

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        return MetadataViewset.create(self, request, *args, **kwargs)

    def update(self, request, pk):
        response = MetadataViewset.update(self, request, pk)
        if response is not None:
            return response
        else:
            return super().update(request, pk)

    def partial_update(self, request, pk, **kwargs):
        kwargs['partial'] = True
        response = MetadataViewset.partial_update(self, request, pk, **kwargs)
        if response is not None:
            return response
        else:
            return super().update(request, pk, **kwargs)

    @action(methods=['post'],
            detail=True,
            url_name='search',
            permission_classes=(IsAuthenticated,))
    def search(self, request, pk=None):
        """
        Elasticsearch Search within a specific project's index.
        """

        project_id = pk

        self.serializer_class = ESDatasetSerializer

        query = request.data

        # any more validation that needs to be done?
        project = Project.objects.get(id=project_id)

        search = Search.from_dict(query)
        search = search.index(str(project.id))

        search_service = _SearchService(search)

        sort = None
        order = None

        for key,value in request.query_params.items():
            if key in ['page_size','page']:
                continue
            elif key == 'ordering':
                sort = value
            # elif key != 'q':
            #     # squeeze Windows double-backslashes in path/path_parent
            #     if key in ['path', 'path_parent']:
            #         value = value.replace("\\\\", "\\")
            #
            #     radiam_service.add_match(key, value)
            else:
                pass

        # Check to see if there are no docs, we can't sort if there are no docs
        # as it causes a 500 error that we don't actually mind.
        if sort:
            if search_service.no_docs(project_id):
                empty = {}
                empty["count"] = 0
                empty["next"] = None
                empty["previous"] = None
                empty["results"] = []
                return Response(empty)

        self.queryset = search_service.search

        if sort:
            self.queryset = self.queryset.sort(sort)
        else:
            self.queryset = self.queryset.sort()

        page = self.paginate_queryset(self.queryset)
        serializer = self.get_serializer(page, many=True)

        return self.get_paginated_response(serializer.data)


class ProjectAvatarViewSet(RadiamViewSet):
    """
    API endpoint that allows project avatars to be viewed or edited.
    """
    queryset = ProjectAvatar.objects.all().order_by('?')
    serializer_class = ProjectAvatarSerializer

    permission_classes = (IsAuthenticated, DRYPermissions,)


class UserAgentTokenViewSet(viewsets.GenericViewSet):
    """
    Generate and return a new JWT access and refresh token set for this user agent
    """
    serializer_class = UserAgentSerializer
    permission_classes = [AllowAny]

    def list(self, request, useragent_id, action):
        # Restricted to internal Docker network requests
        request_addr = request.META.get("REMOTE_ADDR")
        if not (request_addr.startswith("172") or request_addr.startswith("192.168") or request_addr.startswith("10")):
            data = {"error": "401", "access_token": "", "refresh_token": "","host": request.META.get("REMOTE_ADDR")}       
            return Response(data, status=status.HTTP_401_UNAUTHORIZED)

        useragent = UserAgent.objects.get(id=useragent_id)

        if (action and action == "new") or (useragent.local_refresh_token is None):
            print("Generating new tokens for OSF agent")
            useragent.generate_tokens()
            useragent.save()
        else:
            print("Sending existing tokens to OSF agent")

        data = {
            "id": useragent_id,
            "user_id": useragent.user_id,
            "access_token": useragent.local_access_token,
            "refresh_token": useragent.local_refresh_token,
            "host": request.META.get('REMOTE_ADDR')
        }

        return Response(data)


# class OSFConfigsViewSet(viewsets.GenericViewSet):

#     def get_queryset(self):
#         pass

#     def list(self, request):
#         # Restricted to internal Docker network requests
#         #if ('HTTP_X_FORWARDED_FOR' not in request.META) or (request.get_host() is not "osfconnector"):
#         # if ('HTTP_X_FORWARDED_FOR' not in request.META) or (not request.META['HTTP_X_FORWARDED_FOR'].startswith("172") and not request.META['HTTP_X_FORWARDED_FOR'].startswith("192.168")):
#         #     data = {"error": "401", "access_token": "", "refresh_token": "","host": request.META.get("HTTP_X_FORWARDED_FOR")}
#         #     return Response(data, status=status.HTTP_401_UNAUTHORIZED)

#         resp = self.osf_agent_token_query()

#         data = []
#         for item in resp:
#             result = {
#                 "user_agent_id": item[0],
#                 "remote_api_token": item[1],
#                 "loc_id": item[2],
#                 "osf_project": item[3],
#                 "project_id": item[4],
#                 "local_access_token": item[5],
#                 "local_refresh_token": item[6],
#             }
#             data.append(result)

#         return Response(data)


#     def osf_agent_token_query(self):
#         with connection.cursor() as cursor:
#             cursor.execute(
#                 "select agents.id as user_agent_id, "
#                         "agents.remote_api_token, "
#                         "loc.id as loc_id, "
#                         "loc.osf_project, "
#                         "agent_config.project_id, "
#                         "agents.local_access_token, "
#                         "agents.local_refresh_token "
#                 "from rdm_locations loc "
#                 "join rdm_location_types loc_type on loc.location_type_id = loc_type.id "
#                 "join rdm_user_agents agents on agents.location_id = loc.id "
#                 "join rdm_user_agent_project_config agent_config on agent_config.agent_id = agents.id "
#                 "where loc_type.label = 'location.type.osf'")

#             rows = cursor.fetchall()

#         return rows


# class SearchViewSet(viewsets.GenericViewSet):
#     """
#     Elasticsearch Search
#     """
#
#     serializer_class = ESDatasetSerializer
#     pagination_class = PageNumberPagination
#
#     def list(self, request, project_id):
#         """
#         Test some basic ES search
#         """
#
#         print(dir(self))
#
#         query = request.data
#
#         # any more validation that needs to be done?
#         project = Project.objects.get(id=project_id)
#
#         search = Search.from_dict(query)
#         search = search.index(str(project.id))
#
#         search_service = _SearchService(search)
#
#         sort = None
#         order = None
#
#         for key,value in request.query_params.items():
#             if key in ['page_size','page']:
#                 continue
#             elif key == 'ordering':
#                 sort = value
#             # elif key != 'q':
#             #     # squeeze Windows double-backslashes in path/path_parent
#             #     if key in ['path', 'path_parent']:
#             #         value = value.replace("\\\\", "\\")
#             #
#             #     radiam_service.add_match(key, value)
#             else:
#                 pass
#
#         # Check to see if there are no docs, we can't sort if there are no docs
#         # as it causes a 500 error that we don't actually mind.
#         if sort:
#             if search_service.no_docs(project_id):
#                 empty = {}
#                 empty["count"] = 0
#                 empty["next"] = None
#                 empty["previous"] = None
#                 empty["results"] = []
#                 return Response(empty)
#
#         self.queryset = search_service.search
#
#         if sort:
#             self.queryset = self.queryset.sort(sort)
#         else:
#             self.queryset = self.queryset.sort()
#
#         page = self.paginate_queryset(self.queryset)
#         serializer = self.get_serializer(page, many=True)
#
#         return self.get_paginated_response(serializer.data)


class ProjectSearchViewSet(viewsets.ViewSet):
    # memcache client used to track creation of file documents
    cache = memcache.Client([settings.MEMCACHE], debug=0)
    """
    CRUD operations on an ES index
    """

    def list(self, request, project_id):
        """
        List documents in an ES index
        """

        radiam_service = RadiamService(project_id)
        search = Search(index=project_id)
        search_service = _SearchService(search)

        if radiam_service.index_exists(project_id):
            # TODO: Do any queries need to be added here for auth?

            rawresponse = search_service.execute()
            data = rawresponse.to_dict()

            return Response(data)

        else:
            raise ProjectNotFoundException()

    def retrieve(self, request, project_id, pk):
        """
        Retrieve a single ES document by id
        """

        radiam_service = RadiamService(project_id)

        if radiam_service.index_exists(project_id):
            # TODO: Do any queries need to be added here for auth?

            radiam_service.add_search_id_match(pk)

            rawresponse = radiam_service.search_service.execute()
            data = rawresponse.to_dict()

            return Response(data)

        else:
            raise ProjectNotFoundException()

    def get_cache_key(self, project_id, location, agent, path):
        return "{}.{}.{}.{}".format(project_id, location, agent, path.replace(" ", "%20"))

    def create(self, request, project_id):
        """
        Create a document in an index
        """
        # Make a Document object out of the request body.
        # Pass the document object to the service class for inserting.

        # Handle the error cases
        # - no doc
        # - wrong doc shape/validation?
        # - required fields missing?

        parser_classes = (JSONParser,)

        radiam_service = RadiamService(project_id)

        data = self.request.data

        if len(data) == 0:
            raise BadRequestException("No request data found")

        if type(data).__name__ not in 'list':
            key = self.get_cache_key(project_id, data['location'], data['agent'], data['path'])
            while True:
                doc_id = self.cache.gets(key)
                if doc_id is None:
                    if self.cache.cas(key, "Caching"):
                        check_existing = RadiamService(project_id)
                        search = check_existing.get_search() \
                            .query('term', path__keyword=data['path']) \
                            .query('term', name__keyword=data['name']) \
                            .query('term', location__keyword=data['location']) \
                            .query('term', agent__keyword=data['agent']) \
                            .source(None)

                        if settings.TRACE:
                            print('curl -X GET "localhost:9200/' + project_id + '/_search?pretty" -H "Content-Type: application/json" -d\'' + str(search.to_dict()).replace("'", "\"") + "'")
                        response = search.execute()

                        if response.hits.total == 0:
                                if settings.DEBUG:
                                    print("New doc for " + data['path'] + " in location " + data['location'] + " from agent " + data['agent'] + " in project " + project_id)
                                doc = ESDataset(**data)
                                radiam_service.create_single_doc(project_id, doc)
                                id = doc.meta["id"]
                                self.cache.set(key, id)
                                serializer = ESDatasetSerializer()
                                response = Response(serializer.to_representation(doc))
                                break
                        elif response.hits.total == 1:
                            id = str(response.hits[0].meta.id)
                            if settings.DEBUG:
                                print("Updating " + data['path'] + " in location " + data['location'] + " from agent " + data['agent'] + " in project " + project_id + " with id " + id)
                            try:
                                response = self.update(request, project_id, id)
                                self.cache.set(key, id)
                                break;
                            except es_exceptions.NotFoundError as e:
                                self.cache.delete(key)
                            except Exception as e:
                                print("Unable to update " + data['path'] + " in location " + data['location'] + " from agent " + data['agent'] + " in project " + project_id + " with id " + id + " because " + str(e))
                        else:
                            if settings.DEBUG:
                                print("Updating and deleting " + data['path'] + " in location " + data['location'] + " from agent " + data['agent'] + " in project " + project_id + ", and need to delete the older entries. There were a total of " + str(response.hits.total) + " docs")
                            newest = response.hits[0]
                            for hit in response.hits:
                                if hit is not newest and hit.indexed_date > newest.indexed_date:
                                    newest = hit
                            for hit in response.hits:
                                if hit is not newest:
                                    self.perform_destroy(project_id, hit.meta.id)
                            response = self.update(request, project_id, newest.meta.id)
                            self.cache.set(key, newest.meta.id)
                    else:
                        if settings.TRACE:
                            print("Someone else has already started creating the document and there is no doc id, we'll try again")
                else:
                    if doc_id is not "Caching":
                        # The document was in the cache
                        if settings.DEBUG:
                            print("Updating using cache " + data['path'] + " in location " + data['location'] + " from agent " + data['agent'] + " in project " + project_id + " with doc id " + doc_id)
                        response = self.update(request, project_id, doc_id)
                        break
                    else:
                        if settings.TRACE:
                            print("Someone else has already started creating the document and our doc id is Caching, we'll try again")

            return response

        else:
            results = radiam_service.create_many_docs(project_id, data)

            return Response(results)

        # Should we try to return the created document instead?
        # ES-DSL library simply returns true or false.
        # result = services.create_doc(es_index, doc)

        # if result:
        #     return Response(result)
        # else:
        #     return Response("Creation failed")

    def perform_update(self, request, project_id, pk):
        serializer = ESDatasetSerializer()
        radiam_service = RadiamService(project_id)
        # Update the doc
        updated_doc = self.request.data
        result = radiam_service.update_doc(project_id, pk, updated_doc)
        result = serializer.to_representation(result)
        return Response(result)

    def update(self, request, project_id, pk):
        """
        Update a document in an index
        """
        parser_classes = (JSONParser,)
        return self.perform_update(request, project_id, pk)

    def partial_update(self, request, project_id, pk):
        """
        Update part of a document
        """
        parser_classes = (JSONParser,)

        radiam_service = RadiamService(project_id)

        # Get a document by ID
        doc = ESDataset.get(index=project_id, id=pk)

        doc_updates = self.request.data
        result = radiam_service.update_doc_partial(project_id, pk, doc_updates)

        serializer = ESDatasetSerializer()
        return Response(serializer.to_representation(result))

    def perform_destroy(self, project_id, pk):
        # ES Python clients don't actually return anything on delete,
        # API calls right to ES would... is this a problem?
        doc = ESDataset.get(index=project_id, id=pk)
        key = self.get_cache_key(project_id, doc.location, doc.agent, doc.path)
        self.cache.delete(key)
        radiam_service = RadiamService(project_id)
        result = radiam_service.delete_doc(project_id, pk)
        return Response(result)

    def destroy(self, request, project_id, pk):
        """
        Delete a Document from a given index
        """
        return self.perform_destroy(project_id, pk)


class DatasetDocsViewSet(viewsets.ViewSet):
    """
    Dataset search endpoint
    """

    def list(self, request, dataset_id):
        """
        List documents in an Index/Project filtered by Dataset query
        """

        radiam_service = RadiamService(dataset_id)

        # get the search object/query for this object and ensure it
        # is assigned to the project's index. Then execute search
        dataset = Dataset.objects.get(id=dataset_id)
        project = Project.objects.get(dataset__id=dataset_id)
        search_model = SearchModel.objects.get(dataset__id=dataset.id)

        search = Search()
        search = search.index(str(project.id))
        search_service = _SearchService(search)
        if search_model.search:
            search_service.search = search_service.search.query('bool', filter=[ES_Q(search_model.search)])
        rawresponse = search_service.execute()
        data = rawresponse.to_dict()
        return Response(data)


class DatasetSearchViewSet(viewsets.GenericViewSet):
    """
    Elasticsearch Search
    """

    serializer_class = ESDatasetSerializer
    pagination_class = PageNumberPagination

    def list(self, request, dataset_id):
        """
        Test some basic ES search
        """

        radiam_service = RadiamService(dataset_id)
        search = Search(index=dataset_id)
        search_service = _SearchService(search)

        if radiam_service.index_exists(dataset_id):
            # TODO: Do any queries need to be added here for auth?

            rawresponse = search_service.execute()
            data = rawresponse.to_dict()

            return Response(data)

        else:
            raise ProjectNotFoundException()


class MetadataUITypeViewSet(RadiamViewSet):
    queryset = MetadataUIType.objects.all().order_by('key')
    serializer_class = MetadataUITypeSerializer

    filter_fields=('label', 'key', 'id')
    ordering_fields=('label', 'key')
    ordering = ('key', 'label')
    permission_classes = (IsAuthenticated, DRYPermissions,)

class MetadataValueTypeViewSet(RadiamViewSet):
    queryset = MetadataValueType.objects.all().order_by('key')
    serializer_class = MetadataValueTypeSerializer

    filter_fields=('label', 'key', 'id')
    ordering_fields=('label', 'key')
    ordering = ('key', 'label')
    permission_classes = (IsAuthenticated, DRYPermissions,)

class ChoiceListValueViewSet(RadiamViewSet):
    queryset = ChoiceListValue.objects.all().order_by('label')
    serializer_class = ChoiceListValueSerializer

    filter_fields=('label', 'value', 'list', 'id')
    ordering_fields=('label', 'value', 'list')
    ordering = ('list', 'value', 'label')
    permission_classes = (IsAuthenticated, DRYPermissions,)

class ChoiceListViewSet(RadiamViewSet):
    queryset = ChoiceList.objects.all().order_by('label')
    serializer_class = ChoiceListSerializer

    filter_fields=('label', 'id')
    ordering_fields=('label', )
    ordering = ('label')
    permission_classes = (IsAuthenticated, DRYPermissions,)

class SchemaViewSet(RadiamViewSet):
    queryset = Schema.objects.all().order_by('label')
    serializer_class = SchemaSerializer

    filter_fields=('label', 'id')
    ordering_fields=('label', )
    ordering = ('label', )
    permission_classes = (IsAuthenticated, DRYPermissions,)

class FieldViewSet(RadiamViewSet):
    queryset = Field.objects.all().order_by('schema', 'label')
    serializer_class = FieldSerializer

    filter_fields=('label', 'schema', 'parent', 'metadata_ui_type', 'metadata_value_type', 'many_values', 'choice_list', 'default_choice', 'default_value',)
    ordering_fields=('label', 'schema', 'parent', 'metadata_ui_type', 'metadata_value_type', 'many_values', 'choice_list', 'default_order', 'default_choice', 'default_value', )
    ordering = ('schema', 'label', )

    permission_classes = (IsAuthenticated, DRYPermissions,)

class EntityViewSet(RadiamViewSet):
    queryset = Entity.objects.all()
    serializer_class = EntitySerializer

    filter_fields=('group', 'project', 'dataset', 'file', 'folder', )
    ordering_fields=('group', 'project', 'dataset', 'file', 'folder', )

    permission_classes = (IsAuthenticated, DRYPermissions,)

class SelectedSchemaViewSet(RadiamViewSet):
    queryset = SelectedSchema.objects.all()
    serializer_class = SelectedSchemaSerializer

    filter_fields=('entity', 'schema', )
    ordering_fields=('entity', 'schema', )

    permission_classes = (IsAuthenticated, DRYPermissions,)

class SelectedFieldViewSet(RadiamViewSet):
    queryset = SelectedField.objects.all()
    serializer_class = SelectedFieldSerializer

    filter_fields=('entity', 'field', 'default', 'required', 'visible', 'order', )
    ordering_fields=('entity', 'field', 'default', 'required', 'visible', 'order', )

    permission_classes = (IsAuthenticated, DRYPermissions,)

class EntitySchemaFieldViewSet(RadiamViewSet):
    queryset = Entity.objects.all()
    serializer_class = EntitySchemaFieldSerializer

    filter_fields=('group', 'project', 'dataset', 'file', 'folder', )
    ordering_fields=('group', 'project', 'dataset', 'file', 'folder', )

    permission_classes = (IsAuthenticated, DRYPermissions,)
