
from django.db.models import Q

from rest_framework.filters import BaseFilterBackend
from .models import Project, Dataset, ResearchGroup, GroupMember, GroupViewGrant, ProjectStatistics

from rest_framework.exceptions import APIException


class ActiveModelFilter(BaseFilterBackend):
    """
    Filter the Queryset to show 'is_active' models only by default.
    This Filter can be applied to any model that has a field called
    'is_active'.
    """

    def get_is_active_query_param(self, request):
        """Get the 'is_active' parameter value from the request object

        :param request:
        :return:
        """
        query_params = request.query_params.copy()
        is_active_list = query_params.getlist('is_active', [])

        if len(is_active_list) == 0:
            return None
        elif len(is_active_list) > 1:
            raise APIException("'is_active' parameter appears more than once")
        else:
            return is_active_list[0]

    def filter_queryset(self, request, queryset, view):
        """Apply a filter the queryset based on the value of 'is_active'

        :param request:
        :param queryset:
        :param view:
        :return:
        """
        is_active = self.get_is_active_query_param(request)

        if is_active is None or is_active.lower() == "true":
            return queryset.filter(is_active=True)
        elif is_active.lower() == 'all':
            return queryset
        elif is_active.lower() == "false":
            return queryset.filter(is_active=False)
        else:
            raise APIException("Invalid value supplied for 'is_active'")


class RadiamAuthUserFilter(BaseFilterBackend):
    """
    Filter the User queryset to only those that the current user has
    access to
    """

    def filter_queryset(self, request, users_queryset, view):
        """Return the queryset if superuser, filter otherwise according to
        group membership
        """
        user = request.user

        if not user.is_superuser:
            admingroups = user.get_admin_groups()
            users = users_queryset.filter(
                Q(groupmember__group__in=admingroups) | Q(id=user.id)
            ).distinct()
            return users
        else:
            return users_queryset


class RadiamAuthProjectFilter(BaseFilterBackend):
    """
    Filter the Projects queryset to only those that the current user has
    access to
    """

    def filter_queryset(self, request, projects_queryset, view):
        """Return the queryset if superuser, filter otherwise according to
        group membership
        """
        user = request.user

        if not user.is_superuser:
            projects = projects_queryset.filter(
                group__in=request.user.get_groups()
            )

            return projects

        else:
            return projects_queryset


class RadiamAuthDatasetFilter(BaseFilterBackend):
    """
    Filter the queryset to only those Datasets that the current user has access to
    """

    def filter_queryset(self, request, datasets_queryset, view):
        """Return the queryset if superuser, filter otherwise according to
        group membership
        """
        user = request.user

        if not user.is_superuser:
            filtered = datasets_queryset.filter(
                id__in=request.user.get_datasets()
            )

            return filtered

        else:
            return datasets_queryset


class RadiamAuthDatasetDetailFilter(BaseFilterBackend):
    """
    Filter the queryset to only those Datasets that the current user has access to
    """

    def filter_queryset(self, request, datasets_queryset, view):
        """Return the queryset if superuser, filter otherwise according to
        group membership
        """
        user = request.user

        if not user.is_superuser:
            filtered = datasets_queryset.filter(
                dataset__in=request.user.get_datasets()
            )

            return filtered

        else:
            return datasets_queryset


class RadiamAuthGroupMemberFilter(BaseFilterBackend):
    """
    Filter the GroupMember queryset to only those that the current user has
    access to
    """

    def filter_queryset(self, request, groupmember_queryset, view):
        """Return the queryset if superuser, filter otherwise according to
        group membership
        """
        user = request.user

        if not user.is_superuser:
            admingroups = user.get_admin_groups()

            query = Q(group__in=admingroups) | Q(user=request.user)
            group_memberships = groupmember_queryset.filter(
                query
            )

            return group_memberships

        else:
            return groupmember_queryset


class RadiamAuthProjectDetailFilter(BaseFilterBackend):
    """
    Filter the queryset to only the Project details that the current user has access to
    """

    def filter_queryset(self, request, projectdetail_queryset, view):
        """Return the queryset if superuser, filter otherwise according to
        group membership
        """
        user = request.user

        if not user.is_superuser:
            groups = user.get_groups()
            projectdetails = projectdetail_queryset.filter(project__group__in=groups)

            return projectdetails

        else:
            return projectdetail_queryset

class RadiamAuthResearchGroupFilter(BaseFilterBackend):
    """
    Filter the queryset to only the current user's direct groups or their
    inherited groups.
    """

    def filter_queryset(self, request, researchgroups_queryset, view):
        """Return all groups if superuser, filter groups according to
        membership and group hierarchy if not.
        """
        user = request.user

        if not user.is_superuser:

            user_groups = ResearchGroup.objects.filter(groupmember__user=request.user)\
                .order_by('date_updated').distinct()
            group_queryset = ResearchGroup.objects.none()

            for g in user_groups:
                group_queryset |= g.get_descendants(include_self=True)

            return group_queryset

        else:
            return researchgroups_queryset.distinct()


class RadiamAuthGroupViewGrantFilter(BaseFilterBackend):
    """
    Filter the queryset to only the current user's viewgrants from direct
    memberships or ....(what about inherited groups)
    """

    def filter_queryset(self, request, groupviewgrant_queryset, view):

        user = request.user

        if not user.is_superuser:

            # return the groups that this user is a member of
            datasets = user.get_datasets()
            groupviewgrants = GroupViewGrant.objects.filter(dataset__in=datasets).order_by('date_updated')
            return groupviewgrants
        else:
            return groupviewgrant_queryset


class RadiamAuthProjectStatisticsFilter(BaseFilterBackend):
    """
    Return the queryset if superuser, filter the statistics according to
    group membership otherwise.
    """

    def filter_queryset(self, request, projectsstatistics_queryset, view):

        user = request.user

        if not user.is_superuser:
            groups = user.get_groups()
            projectstatistics = ProjectStatistics.objects.filter(project__group__in=groups).order_by('stat_date')
            return projectstatistics
        else:
            return projectsstatistics_queryset