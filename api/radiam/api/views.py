from rest_framework.parsers import JSONParser

# from django.contrib.auth.models import User, Group
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action, permission_classes

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import api_settings

from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from dry_rest_permissions.generics import (
    DRYPermissions, DRYGlobalPermissions, DRYObjectPermissions )

from radiam.api.serializers import (
    UserSerializer, SuperuserUserSerializer, PasswordSerializer,
    UserAgentSerializer, ResearchGroupSerializer,
    GroupRoleSerializer, GroupMemberSerializer, GroupViewGrantSerializer,
    LocationSerializer, LocationTypeSerializer, ProjectSerializer, ProjectAvatarSerializer,
    DatasetSerializer, ESDatasetSerializer, ProjectStatisticsSerializer,
    DatasetDataCollectionMethodSerializer, DataCollectionStatusSerializer,
    DataCollectionMethodSerializer, DistributionRestrictionSerializer,
    SensitivityLevelSerializer,DatasetSensitivitySerializer, GeoDataSerializer,
    ProjectUserAgentSerializer
)

# from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

from radiam.api.filters import *

from .models import (
    User, UserAgent, ResearchGroup, GroupRole, GroupMember, GroupViewGrant,
    Location, LocationType, Project, Dataset, ProjectAvatar, SensitivityLevel, DatasetSensitivity,
    DataCollectionMethod, DatasetDataCollectionMethod, DistributionRestriction,
    DataCollectionStatus, ProjectStatistics, GeoData
)
from .signals import radiam_user_created, radiam_project_created, radiam_project_deleted

from radiam.api.search.documents import ESDataset
from .exceptions import BadRequestException, ProjectNotFoundException, \
    ProjectNotCreatedException, ElasticSearchRequestError
from .permissions import IsSuperuserOrSelf

from .search import RadiamService, _SearchService, _IndexService
from .search.pagination import PageNumberPagination
# from .search.filters import ActiveModelFilter

from rest_framework import pagination

from rest_framework.exceptions import APIException
from rest_framework import status


# Imports for django_rest_passwordreset override until open issue is resolved
from django_rest_passwordreset.views import ResetPasswordRequestToken

from datetime import timedelta
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
from rest_framework import exceptions
from rest_framework.response import Response


from django_rest_passwordreset.serializers import EmailSerializer, PasswordTokenSerializer
from django_rest_passwordreset.models import ResetPasswordToken, clear_expired, get_password_reset_token_expiry_time
from django_rest_passwordreset.signals import reset_password_token_created, pre_password_reset, post_password_reset
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


class RadiamOrderingFilter(OrderingFilter):
    """
    get_replacements expects a list of tuples of ('rest_parameter', ['replaced_by']) where
    rest_parameter is the string value of the query string parameter to replace and
    replaced_by can be a list of query string parameters to add to the ordering instead
    """
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
       DjangoFilterBackend,
       RadiamAuthUserFilter,
       OrderingFilter,
    )
    filter_fields = ('username','first_name','last_name', 'id', 'email')
    ordering_fields = ('username','first_name','last_name', 'email', 'date_created', 'date_updated', 'notes')
    ordering = ('last_name', 'first_name', 'username', )
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
       UserAgentOrderingFilter,
    )


class ResearchGroupOrderingFilter(RadiamOrderingFilter):
    def get_replacements(self):
        parent_group = ('parent_group', ['parent_group__name'])
        return [parent_group]


class ResearchGroupViewSet(RadiamViewSet):
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
    filter_fields = ('id', 'name', 'description', 'parent_group')
    ordering_fields = ('name', 'description', 'date_created', 'date_updated', 'parent_group')

    filter_backends = (
        DjangoFilterBackend,
        ActiveModelFilter,
        RadiamAuthResearchGroupFilter,
        ResearchGroupOrderingFilter,
    )


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
        ActiveModelFilter,
        RadiamAuthGroupMemberFilter,
        GroupMemberOrderingFilter,
    )

    filter_fields=('group', 'group_role', 'user', 'date_expires')
    ordering_fields=('group', 'group_role', 'user', 'date_expires', 'date_created', 'date_updated')
    permission_classes = (IsAuthenticated, DRYPermissions,)


class DatasetOrderingFilter(RadiamOrderingFilter):
    def get_replacements(self):
        project = ('project', ['project__name'])
        return [project]


class DatasetViewSet(RadiamViewSet):
    """
    API endpoint that allows datasets to be viewed or edited.
    """
    queryset = Dataset.objects.all().order_by('date_updated')
    serializer_class = DatasetSerializer

    filter_backends = (
        DjangoFilterBackend,
        RadiamAuthDatasetFilter,
        DatasetOrderingFilter,
    )
    filter_fields=('title', 'study_site', 'project', 'id')
    ordering_fields=('title', 'study_site', 'project', 'date_created', 'date_updated')
    ordering = ('title', )
    permission_classes = (IsAuthenticated, DRYPermissions,)


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
        DjangoFilterBackend,
        RadiamAuthGroupViewGrantFilter,
        GroupViewGrantOrderingFilter,
    )

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
        DjangoFilterBackend,
        ActiveModelFilter,
        LocationOrderingFilter,
    )

    filter_fields=('display_name', 'host_name', 'location_type')
    ordering_fields=('display_name', 'host_name', 'location_type', 'date_created', 'date_updated', 'globus_endpoint', 'globus_path', 'portal_url', 'osf_project', 'notes')


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


class ProjectViewSet(RadiamViewSet):
    """
    API endpoint that allows projects to be viewed or edited.
    """
    queryset = Project.objects.all().order_by('date_updated')
    serializer_class = ProjectSerializer

    filter_backends = (
        DjangoFilterBackend,
        RadiamAuthProjectFilter,
        ProjectOrderingFilter,
    )
    filter_fields=('name', 'number', 'keywords', 'group', 'id')
    ordering_fields=('name', 'number', 'keywords', 'group', 'primary_contact_user', 'date_created', 'date_updated')
    ordering = ('name', )
    permission_classes = (IsAuthenticated, DRYPermissions,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            self.perform_create(serializer)
        except ElasticSearchRequestError as error:
            raise ProjectNotCreatedException(detail=error.info['error']['root_cause'][0]['reason'])
        else:
            #success
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

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


class ProjectAvatarViewSet(RadiamViewSet):
    """
    API endpoint that allows project avatars to be viewed or edited.
    """
    queryset = ProjectAvatar.objects.all()
    serializer_class = ProjectAvatarSerializer

    permission_classes = (IsAuthenticated, DRYPermissions,)

class SearchViewSet(viewsets.GenericViewSet):
    """
    Elasticsearch Search
    """

    serializer_class = ESDatasetSerializer
    pagination_class = PageNumberPagination

    def list(self, request, project_id):
        """
        Test some basic ES search
        """
        # any more validation that needs to be done?
        project = Project.objects.get(id=project_id)

        radiam_service = RadiamService(str(project.id))

        sort = None
        order = None

        for key,value in request.query_params.items():
            if key in ['page_size','page']:
                continue
            elif key == 'ordering':
                sort = value
            elif key != 'q':
                # squeeze Windows double-backslashes in path/path_parent
                if key in ['path', 'path_parent']:
                    value = value.replace("\\\\", "\\")

                radiam_service.add_match(key, value)
            else:
                radiam_service.add_generic_search(value)

        self.queryset = radiam_service.get_search()

        if not sort:
            self.queryset = self.queryset.sort()
        else:
            self.queryset = self.queryset.sort(sort)

        page = self.paginate_queryset(self.queryset)
        serializer = self.get_serializer(page, many=True)

        return self.get_paginated_response(serializer.data)


class ProjectSearchViewSet(viewsets.ViewSet):
    """
    CRUD operations on an ES index
    """

    def list(self, request, project_id):
        """
        List documents in an ES index
        """

        radiam_service = RadiamService(project_id)

        if radiam_service.index_exists(project_id):
            # TODO: Do any queries need to be added here for auth?

            rawresponse = radiam_service.execute()
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
            doc = ESDataset(**data)

            result = radiam_service.create_single_doc(project_id, doc)

            return Response(result)

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

    def update(self, request, project_id, pk):
        """
        Update a document in an index
        """
        parser_classes = (JSONParser,)

        radiam_service = RadiamService(project_id)

        # Update the doc
        updated_doc = self.request.data
        result = radiam_service.update_doc(project_id, pk, updated_doc)

        return Response(result)

    def partial_update(self, request, project_id, pk):
        """
        Update part of a document
        """
        parser_classes = (JSONParser,)

        radiam_service = RadiamService(project_id)

        # Get a document by ID
        ESDataset.init(index=project_id)
        doc = ESDataset.get(index=project_id, id=pk)

        doc_updates = self.request.data
        result = radiam_service.update_doc_partial(project_id, pk, doc_updates)

        return Response(result)

    def destroy(self, request, project_id, pk):
        """
        Delete a Document from a given index
        """
        # ES Python clients don't actually return anything on delete,
        # API calls right to ES would... is this a problem?

        radiam_service = RadiamService(project_id)

        result = radiam_service.delete_doc(project_id, pk)

        return Response(result)
