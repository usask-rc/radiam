import uuid
from django.db import models

from django.contrib.postgres.fields import JSONField

from django.contrib.auth.models import AbstractUser
from django.db.models import Q
from django.utils.timezone import now

from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType

from elasticsearch import exceptions as es_exceptions

# from . import services
from .search import RadiamService
from .exceptions import ElasticSearchRequestError
from .signals import (radiam_user_created, radiam_project_created,
    radiam_project_deleted)
from .documents import GeoDataDoc

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

from mptt.models import MPTTModel, TreeForeignKey

from .mixins import *

"""

This file contains all the Radiam Models


Notes:
    If necessary, this can be transformed into a separate module:

    /models
        __init.py
        User.py
        UserAgent.py
        ...
        DataIndex.py
"""


class User(AbstractUser, UserPermissionMixin):
    """
    User

    Extends the base Django user
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    user_orcid_id = models.CharField(max_length=50, null=True, blank=True, help_text="The users ORCID identifier")
    time_zone_id = models.CharField(max_length=50, null=True, blank=True, help_text="The users time zone identifier")
    date_created = models.DateTimeField(blank=True, null=False, default=now, help_text="The date this user object was created")
    date_updated = models.DateTimeField(blank=True, null=False, default=now, help_text="The date this user object was last updated")
    notes = models.CharField(max_length=5000, null=True, blank=True, help_text="Notes about this user")

    class Meta:
        db_table = "rdm_user"

    def is_admin(self):
        """
        If the user is admin status is any of their group memberships, return True
        """
        group_admin_memberships = GroupMember.objects.filter(group_role__label__contains='admin', user=self)
        if group_admin_memberships.count() > 0:
            return True
        else:
            return False

    def is_project_admin(self, project):
        """
        If the user is admin for the given project, return true
        """
        admin_projects = Project.objects.filter(group__in=self.get_admin_groups())
        if project in admin_projects:
            return True
        else:
            return False

    def is_project_member(self, project):
        """
        If the user is a member for the given project, return true
        """
        member_projects = Project.objects.filter(group__in=self.get_groups())
        if project in member_projects:
            return True
        else:
            return False

    def is_group_admin(self, group):
        """
        If the user is admin for the given group, return true
        """
        groups = group.get_ancestors(include_self=True)
        admin_group_membership = GroupMember.objects.filter(
            group__in=groups,
            group_role__label__contains='admin',
            user=self
        )
        if admin_group_membership.count() > 0:
            return True
        else:
            return False

    def get_groups(self):
        """
        Get the user's groups
        """
        user_groups = ResearchGroup.objects.filter(groupmember__user=self) \
            .order_by('date_updated').distinct()
        group_queryset = ResearchGroup.objects.none()

        for g in user_groups:
            group_queryset |= g.get_descendants(include_self=True)

        return group_queryset

    def get_projects(self):
        """
        Get the user's viewable projects
        """
        return Project.objects.filter(group__in=self.get_groups())

    def get_datasets(self):
        """
        Get the user's viewable datasets
        """
        return Dataset.objects.filter(project__in=self.get_projects())

    def get_admin_groups(self):
        """
        Get the groups that the user admins
        """
        admingroups = ResearchGroup.objects.filter(groupmember__group_role__label__contains="admin",
                                                   groupmember__user=self)
        group_queryset = ResearchGroup.objects.none()

        for g in admingroups:
            group_queryset |= g.get_descendants(include_self=True)

        return group_queryset

@receiver(reset_password_token_created)
def send_password_reset_email(sender, reset_password_token, *args, **kwargs):
    """
    When the password reset signal is triggered, send an email to the
    associated address with a password reset link.
    """

    user = reset_password_token.user
    request = kwargs['instance'].request

    context = {
        'user': user,
        'host': request.get_host(),
        'scheme': request.scheme,
        'reset_password_url': "{}{}".format(
            settings.CLIENT_APP_URLS.get('PASSWORD_RESET_BASE_URL'),
                                             reset_password_token.key),
    }
    password_reset_subj = 'Radiam Password Reset'

    if settings.DEBUG and hasattr(settings, 'DEV_EMAIL_ADDRESSES'):
        email_addresses = settings.DEV_EMAIL_ADDRESSES
    else:
        email_addresses = [user.email]

    if use_email():
        try:
            send_mail(password_reset_subj,
                      render_to_string('password_reset_email.txt',
                                       context=context,),
                      'noreply@radiam.ca',
                      email_addresses,
                      html_message=render_to_string('password_reset_email.html',
                                                    context=context)
                      )
        except:
            print(render_to_string('password_reset_email.html', context=context))
    else:
        print(render_to_string('password_reset_email.html', context=context))

def use_email():
    use_email = True
    try:
         use_email = getattr(settings, "SEND_EMAIL")
    except AttributeError:
        use_email = True

    return use_email

@receiver(radiam_user_created)
def send_user_welcome_email(sender, user, *args, **kwargs):
    """
    When a new user is created, send them a welcome email with instructions
    directing them to the password-reset function.
    """

    request = kwargs['request']

    context = {
        'user':user,
        'host': request.get_host(),
        'scheme': request.scheme,
        'login_url': settings.CLIENT_APP_URLS.get('LOGIN_URL')
    }

    user_welcome_subj = "Welcome to Radiam"


    if settings.DEBUG and hasattr(settings, 'DEV_EMAIL_ADDRESSES'):
        email_addresses = settings.DEV_EMAIL_ADDRESSES
    else:
        email_addresses = [user.email]

    if use_email():
        try:
            send_mail(user_welcome_subj,
                      render_to_string('user_welcome_email.txt',
                                       context=context, ),
                      'noreply@radiam.ca',
                      email_addresses,
                      html_message=render_to_string('user_welcome_email.html',
                                                    context=context)
                      )
        except:
            print(render_to_string('user_welcome_email.html', context=context))
    else:
        print(render_to_string('user_welcome_email.html', context=context))


class GeoData(models.Model):
    """
    GeoData

    Geographic (GIS) data for use via Generic Foreign Relationship with other models.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    geojson = JSONField(blank=True, null=True)

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.PROTECT,
    )
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        db_table = "rdm_geodata"

    def save(self, *args, **kwargs):
        """
        Create the GeoData model and Update or Create the corresponding GeoDataDoc
        """
        super().save(*args, **kwargs)
        self._save_geodata_doc()

    def delete(self, *args, **kwargs):
        self._delete_geodata_doc()
        super().delete(*args, **kwargs)

    def _save_geodata_doc(self):
        """
        Create or Update the GeoDataDoc
        """

        try:
            doc = GeoDataDoc.get(self.id)
            fields = {
                'model_id': self.id,
                'geojson': self.geojson['features'],
                'object_id': self.object_id,
                'content_type': self.content_type.model,
            }
            doc.update(**fields)

        except es_exceptions.NotFoundError:
            geodata_doc = GeoDataDoc(
                meta={
                    'id': self.id
                },
                model_id=self.id,
                geojson=self.geojson['features'],
                object_id=self.object_id,
                content_type=self.content_type.model
            )
            geodata_doc.save()

    def _delete_geodata_doc(self):
        """
        Delete the GeoDataDoc
        """
        try:
            doc = GeoDataDoc.get(self.id)
            doc.delete()

        except es_exceptions.NotFoundError:
            raise Exception('Deleting non-existent doc')


class UserAgent(models.Model):
    """
    UserAgent

    Represents a user agent running at a remote system
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('User', on_delete=models.PROTECT, help_text="The user this agent is running as")
    location = models.ForeignKey('Location', on_delete=models.PROTECT, help_text="The location where this agent is running")
    version = models.CharField(blank=False, null=False, max_length=20, help_text="The version of the Agent")
    date_created = models.DateTimeField(blank=True, null=False, default=now, help_text="The date this agent was installed")
    date_updated = models.DateTimeField(blank=True, null=False, default=now, help_text="The date this agent last checked in")
    remote_api_username = models.CharField(blank=True, null=True, max_length=120, help_text="The remote API username (if applicable)")
    remote_api_token = models.CharField(blank=True, null=True, max_length=200, help_text="The remote API token (if applicable)")
    crawl_minutes = models.IntegerField(blank=True, default=15, help_text="How many minutes between crawling (for remote API agents)")
    is_active = models.BooleanField(default=True, help_text="Whether this user agent is active")

    class Meta:
        db_table = "rdm_user_agents"

    def get_project_config_list(self):
        try:
            return UserAgentProjectConfig.objects.filter(agent=self)
        except UserAgentProjectConfig.DoesNotExist:
            return None

class UserAgentProjectConfig(models.Model):
    """
    UserAgentProjectConfig

    Stores configuration values to a UserAgent-Project relation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(UserAgent, on_delete=models.PROTECT, help_text="The User Agent")
    project = models.ForeignKey('Project', on_delete=models.PROTECT, help_text="The Project")
    config = JSONField(blank=True, null=True, help_text="JSON configuration for this project - key/value pairs")

    class Meta:
        db_table = "rdm_user_agent_project_config"
        constraints = [
            models.UniqueConstraint(fields=['agent', 'project'], name='unique_agent_project_configuration')
        ]


class ResearchGroup(MPTTModel, ResearchGroupPermissionMixin):
    """
    ResearchGroup

    A research group
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent_group = TreeForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='children',
        on_delete=models.PROTECT)
    name = models.CharField(max_length=200,blank=False,null=False,unique=True, help_text="The name of this group")
    description = models.CharField(max_length=500, null=False, help_text="A description for this group")
    date_created = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this group was created")
    date_updated = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this group was last modified")
    is_active = models.BooleanField(default=True, help_text="Whether this group is active")

    class Meta:
        db_table = "rdm_research_groups"

    class MPTTMeta:
        parent_attr = 'parent_group'
        order_insertion_by = ['name']

    def __str__(self):
        return self.name

    def get_authorized_groups(self, user):
        """
        Return the instances of this object type that the current user has access to
        """
        return objects.filter(Q())


class GroupRole(models.Model, SuperuserOnlyPermissionMixin):
    """
    GroupRole

    A role assigned to a group
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=80, blank=True, null=False, unique=True, help_text="The label for this role")
    description = models.CharField(max_length=500, blank=True, null=False, help_text="A description of this role")

    class Meta:
        db_table = "rdm_group_roles"

    def __str__(self):
        return self.label


class GroupMember(models.Model, GroupMemberPermissionMixin):
    """
    GroupMember

    Tie groups and roles to a user
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ResearchGroup, on_delete=models.PROTECT, help_text="The group")
    group_role = models.ForeignKey(GroupRole, on_delete=models.PROTECT, help_text="The users role within this group")
    user = models.ForeignKey(User, on_delete=models.PROTECT, help_text="The user")
    is_active = models.BooleanField(default=True, help_text="Whether this person is currently active in this group")
    date_created = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this user role was created")
    date_updated = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this user role was last modified")
    date_expires = models.DateTimeField(blank=True, null=True, help_text="The date this users role expires (optional)")

    class Meta:
        db_table = "rdm_group_members"
        constraints = [
            models.UniqueConstraint(fields=['user', 'group'], name='unique_group_membership')
        ]


class GroupViewGrant(models.Model, GroupViewGrantPermissionMixin):
    """
    GroupViewGrant

    Field-Level authorization for Elasticsearch queries
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ResearchGroup, on_delete=models.PROTECT, help_text="The group that the grant is applied to")
    dataset = models.ForeignKey('Dataset', on_delete=models.PROTECT, help_text="The dataset this grant is applied to")
    fields = models.CharField(max_length=5000, blank=True, null=False, help_text="The fields that are visible through this grant")
    date_created = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this grant was created")
    date_updated = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this grant was last modifed")
    date_starts = models.DateTimeField(blank=True, null=True, help_text="The date this grant starts")
    date_expires = models.DateTimeField(blank=True, null=True, help_text="The date this grant expires")

    class Meta:
        db_table = "rdm_group_view_grants"


class Location(models.Model):
    """
    Location
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    display_name = models.CharField(max_length=100, blank=True, null=False, help_text="Friendly display name for this location (optional)")
    host_name = models.CharField(max_length=100, blank=False, null=False, help_text="The last known hostname for this location")
    location_type = models.ForeignKey('LocationType', on_delete=models.PROTECT, help_text="The location type")
    is_active = models.BooleanField(default=True, help_text="Whether this location is currently active")
    date_created = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this location was created")
    date_updated = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this location was last updated")
    globus_endpoint = models.CharField(max_length=50, blank=True, null=True, help_text="An optional UUID of a Globus Endpoint that contains the files for the location.")
    globus_path =  models.TextField(blank=True, null=True, help_text="An optional path on a Globus Endpoint that leads to the files for the location.")
    notes = models.TextField(blank=True, null=False, help_text="An optional freeform text field for notes about this location.")
    portal_url = models.TextField(blank=True, null=True, help_text="An optional URL that will lead to the files indexed about this location.")
    osf_project = models.TextField(blank=True, null=True, help_text="If this location is of type OSF then project is required.")
    geo = GenericRelation(GeoData, related_query_name="location")

    def get_geo_data(self):
        ctype = ContentType.objects.get_for_model(self.__class__)
        try:
            geo_data = GeoData.objects.get(content_type__pk=ctype.id, object_id=self.id)

        except GeoData.DoesNotExist:
            return None
        return geo_data

    class Meta:
        db_table = "rdm_locations"

    def __str__(self):
        return self.display_name


class LocationType(models.Model, SuperuserOnlyPermissionMixin):
    """
    LocationType
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=50, blank=False, null=False, help_text="The location type label")

    class Meta:
        db_table = "rdm_location_types"

    def __str__(self):
        return self.label


class SensitivityLevel(models.Model, SuperuserOnlyPermissionMixin):
    """
    SensitivityLevel
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=100, blank=False, null=False, help_text="The sensitivity label")

    class Meta:
        db_table = "rdm_sensitivity_level"

    def __str__(self):
        return self.label


class DatasetSensitivity(models.Model, DatasetDetailPermissionMixin):
    """
    DatasetSensitivity
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey('Dataset', on_delete=models.PROTECT, help_text="The dataset this sensitivity applies to")
    sensitivity = models.ForeignKey(SensitivityLevel, on_delete=models.PROTECT, help_text="The sensitivity level")

    class Meta:
        db_table = "rdm_dataset_sensitivity"


class DataCollectionMethod(models.Model, SuperuserOnlyPermissionMixin):
    """
    DataCollectionMethod
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=100, blank=False, null=False, help_text="Data collection method label")

    class Meta:
        db_table = "rdm_data_collection_methods"

    def __str__(self):
        return self.label


class DatasetDataCollectionMethod(models.Model, DatasetDetailPermissionMixin):
    """
    DatasetDataCollectionMethod
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey('Dataset', on_delete=models.PROTECT, help_text="The dataset this collection method applies to")
    data_collection_method = models.ForeignKey(DataCollectionMethod, on_delete=models.PROTECT, help_text="The data collection method")

    class Meta:
        db_table = "rdm_dataset_data_collection_method"


class DistributionRestriction(models.Model, SuperuserOnlyPermissionMixin):
    """
    DistributionRestriction
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=100, blank=False, null=False, help_text="The distribution restriction label")

    class Meta:
        db_table = "rdm_distribution_restriction"

    def __str__(self):
        return self.label


class DataCollectionStatus(models.Model, DatasetDetailPermissionMixin):
    """
    DataCollectionStatus
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=100, blank=False, null=False, help_text="The data collection status label")

    class Meta:
        db_table = "rdm_data_collection_status"

    def __str__(self):
        return self.label


class ProjectAvatar(models.Model, ResearchGroupPermissionMixin):
    """
    ProjectAvatar
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    width = models.IntegerField(help_text="The avatar image width will be calculated on upload (leave blank)", blank=True)
    height = models.IntegerField(help_text="The avatar image height will be calculated on upload (leave blank)", blank=True)
    avatar_image = models.ImageField(upload_to='uploads/avatars/projects/', height_field='height', width_field='width', help_text="The avatar binary image data")

    class Meta:
        db_table = "rdm_project_avatars"

    def __str__(self):
        return "avatar_" + str(self.id)


class Project(models.Model, ProjectPermissionMixin):
    """
    Project
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ResearchGroup, on_delete=models.PROTECT, help_text="The group this project belongs to")
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, help_text="The project name")
    number = models.CharField(max_length=40, blank=True, null=True, help_text="The assigned project number (optional)")
    keywords = models.CharField(max_length=500, blank=True, null=False, help_text="Keywords for this project (comma separated text)")
    primary_contact_user = models.ForeignKey(User, on_delete=models.PROTECT, null=True, help_text="The primary contact person for this project")
    avatar = models.ForeignKey(ProjectAvatar, on_delete=models.PROTECT, blank=True, null=True, help_text="The avatar for this project (optional)")
    date_created = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this project was created")
    date_updated = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this project was last modified")
    geo = GenericRelation(GeoData, related_query_name="project")

    def save(self, *args, **kwargs):
        """
        Create the model and create an index in ES
        """
        rs = RadiamService(self.id)
        if (not rs.index_exists(self.id)):
            try:
                rs.create_index(self.id)
            except es_exceptions.RequestError as error:
                raise ElasticSearchRequestError(error.info)
            else:
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """
        Delete the model and delete the index in ES
        """
        rs = RadiamService(self.id)
        rs.delete_index(self.id)
        super().delete(*args, **kwargs)

    def get_geo_data(self):
        ctype = ContentType.objects.get_for_model(self.__class__)
        try:
            geo_data = GeoData.objects.get(content_type__pk=ctype.id, object_id=self.id)

        except GeoData.DoesNotExist:
            return None
        return geo_data

    class Meta:
        db_table = "rdm_projects"

    def __str__(self):
        return self.name


class Dataset(models.Model, DatasetPermissionMixin):
    """
    Dataset
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.PROTECT, help_text="The project this dataset belongs to")
    title = models.CharField(max_length=250, blank=True, null=False, help_text="The title of the data for this dataset")
    abstract = models.CharField(max_length=3000, blank=True, null=False, help_text="The abstract of the data for this dataset")
    study_site = models.CharField(max_length=250, blank=True, null=False, help_text="The study site of this dataset")
    distribution_restriction = models.ForeignKey(DistributionRestriction, on_delete=models.PROTECT, null=True, help_text="Distribution restriction for this dataset")
    data_collection_status = models.ForeignKey(DataCollectionStatus, on_delete=models.PROTECT, null=True, help_text="Status of data collection for this dataset")
    date_created = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this dataset was created")
    date_updated = models.DateTimeField(blank=False, null=False, default=now, help_text="The date this dataset was last modified")
    geo = GenericRelation(GeoData, related_query_name="dataset")

    def get_data_collection_methods(self):
        methods = []
        for dcm in DatasetDataCollectionMethod.objects.filter(dataset=self):
           methods.append(dcm.data_collection_method.id)
        return DataCollectionMethod.objects.filter(id__in=methods)

    def get_sensitivity_levels(self):
        levels = []
        for dss in DatasetSensitivity.objects.filter(dataset=self):
            levels.append(dss.sensitivity.id)
        return SensitivityLevel.objects.filter(id__in=levels)

    def get_geo_data(self):
        ctype = ContentType.objects.get_for_model(self.__class__)
        try:
            geo_data = GeoData.objects.get(content_type__pk=ctype.id, object_id=self.id)

        except GeoData.DoesNotExist:
            return None
        return geo_data

    def delete_data_collection_methods(self):
        for dcm in DatasetDataCollectionMethod.objects.filter(dataset=self):
            dcm.delete()

    def delete_sensitivities(self):
        for dss in DatasetSensitivity.objects.filter(dataset=self):
            dss.delete()

    def delete(self, *args, **kwargs):
        """
        Delete any joint relationships between dataset and sensitivity or data collection model
        """
        self.delete_data_collection_methods()
        self.delete_sensitivities()
        super().delete(*args, **kwargs)

    class Meta:
        db_table = "rdm_datasets"


class ProjectStatistics(models.Model, ProjectDetailPermissionMixin):
    """
    ProjectStatistics
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.PROTECT, help_text="The project for this statistic")
    stat_date = models.DateTimeField(blank=False, null=False, default=now, help_text="The statistic date")
    stat_key = models.CharField(max_length=80, blank=False, null=False, help_text="The key of the statistic")
    stat_qualifier = models.CharField(max_length=80, blank=True, null=True, help_text="Qualifier on the statistic key (optional)")
    stat_value = models.CharField(max_length=200, blank=False, null=False, help_text="The statistic value")

    class Meta:
        db_table = "rdm_data_project_statistics"
