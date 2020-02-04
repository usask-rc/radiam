from uuid import UUID
from django.contrib.contenttypes.models import ContentType

from django.db.models import Q
from django.utils.timezone import now

from rest_framework import serializers, exceptions
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueTogetherValidator
from rest_framework.validators import UniqueValidator
import django.contrib.auth.password_validation as password_validators
from django_rest_passwordreset.models import ResetPasswordToken
from django.conf import settings

from radiam.api.documents import DatasetMetadataDoc
from radiam.api.documents import ProjectMetadataDoc
from radiam.api.documents import ResearchGroupMetadataDoc

from .exceptions import ElasticSearchRequestError

from .models import (
    ChoiceList,
    ChoiceListValue,
    DataCollectionMethod,
    DataCollectionStatus,
    Dataset,
    DatasetDataCollectionMethod,
    DatasetSensitivity,
    DistributionRestriction,
    Entity,
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
    SelectedField,
    SelectedSchema,
    SensitivityLevel,
    User,
    UserAgent,
    UserAgentProjectConfig)

from .signals import radiam_user_created, radiam_user_updated, radiam_project_created

class MetadataSerializer():
    def to_representation(self, instance, ret):
        try:
            doc = self.MetadataDoc.get(instance.id)
            metadata = doc.to_dict().get("metadata")
            if metadata is not None:
                ret.update({"metadata": metadata})
            else:
                ret.update({"metadata" : None})
        except ElasticSearchRequestError as error:
            if settings.TRACE:
                print("Unable to get metadata from elastic search index due to elastic search error " + str(error))
            ret.update({"metadata" : None})
        except Exception as error:
            if settings.TRACE:
                print("Unable to get metadata from elastic search index because " + str(error))
            ret.update({"metadata" : None})
        return ret

def is_uuid4(uuid_string):
    try:
        UUID(uuid_string, version=4)
    except ValueError:
        return False
    return True

class ResearchGroupPKRelatedField(serializers.PrimaryKeyRelatedField):
    """
    ResearchGroup PK-related Hyperlinked field for foreign key relationships that require filtering
    """
    def get_queryset(self):
        user = self.context['request'].user

        if not user.is_superuser:
            queryset = ResearchGroup.objects.filter(
                Q(groupmember__user=user),
                Q(groupmember__group_role__label__contains="admin")
            )

            group_queryset = ResearchGroup.objects.none()
            for g in queryset:
                group_queryset |= g.get_descendants(include_self=True)

            return group_queryset
        else:
            return ResearchGroup.objects.all()


class ProjectPKRelatedField(serializers.PrimaryKeyRelatedField):
    """
    Project PK-related field for foreign key relationships that require filtering
    """
    def get_queryset(self):
        user = self.context['request'].user

        if not user.is_superuser:
            return user.get_projects()
        else:
            return Project.objects.all()


class NestedUserAgentProjectPKRelatedField(ProjectPKRelatedField):
    """
    Project PK-related field for foreign key relationships that require filtering.
    As well as filtering, this field is modified to accept a project name, but return
    the project instance.
    """

    def to_internal_value(self, data):
        """
        Convert the unique project name to the projects UUID for storage
        """

        try:
            if is_uuid4(data):
                project = self.get_queryset().get(id=data)
            else:
                project = self.get_queryset().get(name=data)
            return project
        except Project.DoesNotExist:
            msg = f'Project with id or name \'{data}\' does not exist.'
            raise serializers.ValidationError(msg)


class DatasetPKRelatedField(serializers.PrimaryKeyRelatedField):
    """
    Dataset PK-related field for foreign key relationships that require filtering
    """
    def get_queryset(self):
        user = self.context['request'].user

        if not user.is_superuser:
            queryset = Dataset.objects.filter(
                project__in=user.get_projects()
            )
            return queryset
        else:
            return Dataset.objects.all()


class ContentObjectNameForeignKey(serializers.RelatedField):
    """
    Serializer field that will receive a Content Type name, and store it's ID.
    """

    def get_queryset(self):
        """
        Use ContentType objects manager.
        """
        return ContentType.objects.all()

    def to_representation(self, value):
        """
        Use the ID of a ContentType to get it's model name
        """
        return value.model

    def to_internal_value(self, data):
        """
        Use the model name of the ContentType and return the ID.
        """
        msg = "No ContentType matching model: \'{}\'"
        try:
            content_type = self.get_queryset().get(model=data)
            return content_type
        except ContentType.DoesNotExist:
            raise serializers.ValidationError(msg, format(data))


class BaseUserSerializer(serializers.ModelSerializer):
    """
    Base User serializer for other User serializers to inherit from. This is
    a method of showing a different set of fields based on superuser status.
    """
    date_created = serializers.DateTimeField(read_only=True)
    date_updated = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = ('id',
                  'username',
                  'first_name',
                  'last_name',
                  'email',
                  'is_active',
                  'time_zone_id',
                  'user_orcid_id',
                  'date_created',
                  'date_updated',
                  'notes')

    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        user.date_created = now()

        HTTP_USER_AGENT_HEADER = getattr(settings, 'DJANGO_REST_PASSWORDRESET_HTTP_USER_AGENT_HEADER',
                                         'HTTP_USER_AGENT')
        HTTP_IP_ADDRESS_HEADER = getattr(settings, 'DJANGO_REST_PASSWORDRESET_IP_ADDRESS_HEADER', 'REMOTE_ADDR')
        reset_password_token = ResetPasswordToken.objects.create(
            user=user,
            user_agent=self.context.get('request').META.get(HTTP_USER_AGENT_HEADER, ''),
            ip_address=self.context.get('request').META.get(HTTP_IP_ADDRESS_HEADER, ''),
        )

        # trigger the user create signal with request context
        radiam_user_created.send(sender=self.__class__,
                                 user=user,
                                 reset_password_token=reset_password_token,
                                 request=self.context.get('request'))

        return user

    # is superuser update?....
    def update(self, instance, validated_data):
        instance.username = validated_data.get(
            'username', instance.username)
        instance.first_name = validated_data.get(
            'first_name', instance.first_name)
        instance.last_name = validated_data.get(
            'last_name', instance.last_name)
        instance.email = validated_data.get(
            'email', instance.email)
        instance.is_active = validated_data.get(
            'is_active', instance.is_active)
        instance.time_zone_id = validated_data.get(
            'time_zone_id', instance.time_zone_id)
        instance.user_orcid_id = validated_data.get(
            'user_orcid_id', instance.user_orcid_id)
        instance.date_updated = now()
        instance.notes = validated_data.get('notes', instance.notes)

        instance.save()

        # trigger the user updated signal
        radiam_user_updated.send(sender=self.__class__,
                                 email=instance.email,
                                 username=instance.username,
                                 first_name=instance.first_name,
                                 request=self.context.get('request'))

        return instance


class UserSerializer(BaseUserSerializer):
    """
    Non Superuser serializer that does not allow setting 'is_superuser'.
    We may want to further restrict access to this in the future.
    """
    pass


class SuperuserUserSerializer(BaseUserSerializer):
    """
    SuperuserSerializer allows 'is_superuser' field to be changed
    """

    class Meta:
        model = User
        fields = ('id',
                  'username',
                  'first_name',
                  'last_name',
                  'email',
                  'is_active',
                  'is_superuser',
                  'user_orcid_id',
                  'time_zone_id',
                  'date_created',
                  'date_updated',
                  'notes')

    def update(self, instance, validated_data):
        instance.username = validated_data.get(
                                'username', instance.username)
        instance.first_name = validated_data.get(
                                'first_name', instance.first_name)
        instance.last_name = validated_data.get(
                                'last_name', instance.last_name)
        instance.email = validated_data.get(
                                'email', instance.email)
        instance.is_active = validated_data.get(
                                'is_active', instance.is_active)
        instance.is_superuser = validated_data.get(
                                'is_superuser', instance.is_superuser)
        instance.user_orcid_id = validated_data.get(
            'user_orcid_id', instance.user_orcid_id)
        instance.time_zone_id = validated_data.get(
                                'time_zone_id', instance.time_zone_id)
        instance.date_updated = now()
        instance.notes = validated_data.get('notes', instance.notes)

        instance.save()

        # trigger the user updated signal
        radiam_user_updated.send(sender=self.__class__,
                                 email=instance.email,
                                 username=instance.username,
                                 first_name=instance.first_name,
                                 request=self.context.get('request'))

        return instance


class PasswordSerializer(serializers.Serializer):
    """
    Password serializer. Used in set_password endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        """Ensure old password provided actual old password
        """
        user = self.context.get('user')
        if not user.check_password(value):
            raise serializers.ValidationError('Incorrect old password.')
        else:
            return value

    def validate_new_password(self, value):
        """Validate new_password against password validators
        """

        user = self.context.get('user')
        password_validators.validate_password(password=value, user=user)
        return value

    def validate(self, data):
        """Ensure new passwords match
        """

        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError('New passwords do not match.')
        else:
            return data

class UserAgentTokenSerializer(serializers.ModelSerializer):
    """
    User Agent Token serializer.
    """
    class Meta:
        model = UserAgent
        fields = ('id',
                  'local_access_token',
                  'local_refresh_token'
                  )


class NestedUserAgentProjectConfigSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    project = NestedUserAgentProjectPKRelatedField()
    config = serializers.JSONField(required=False)

    class Meta:
        model = UserAgentProjectConfig
        fields = (
            'id',
            'project',
            'config'
        )


class UserAgentSerializer(serializers.ModelSerializer):

    id = serializers.UUIDField(required=False)

    # Do these need to be protected via auth model?
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all()
    )
    version = serializers.CharField(required=True)
    project_config_list = NestedUserAgentProjectConfigSerializer(many=True, required=True, source="get_project_config_list")

    class Meta:
        model = UserAgent
        fields = ('id',
                  'user',
                  'location',
                  'version',
                  'project_config_list',
                  'remote_api_username',
                  'remote_api_token',
                  'local_access_token',
                  'local_refresh_token',
                  'crawl_minutes',
                  'is_active'
                  )

    def create(self, validated_data):
        """
        Create a UserAgent Object
        """
        try:
            project_config_list = validated_data.pop('get_project_config_list')
        except KeyError:
            pass

        useragent = UserAgent.objects.create(**validated_data)
        useragent.date_created = now()

        # try:
        self._save_project_config(project_config_list, useragent)
        # except NameError:
        #     pass
        return useragent

    def update(self, instance, validated_data):
        """
        Update a UserAgent Object
        """

        try:
            project_config_list = validated_data.pop('get_project_config_list')
            self._save_project_config(project_config_list, instance)
        except KeyError:
            pass

        instance.remote_api_username = validated_data.get('remote_api_username', instance.remote_api_username)
        instance.remote_api_token = validated_data.get('remote_api_token', instance.remote_api_token)
        instance.local_access_token = validated_data.get('local_access_token', instance.local_access_token)
        instance.local_refresh_token = validated_data.get('local_refresh_token', instance.local_refresh_token)
        instance.crawl_minutes = validated_data.get('crawl_minutes', instance.crawl_minutes)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        if instance.user != validated_data.get('user', instance.user):
            instance.local_access_token = None
            instance.local_refresh_token = None
        instance.user = validated_data.get('user', instance.user)
        instance.location = validated_data.get('location', instance.location)
        instance.version = validated_data.get('version', instance.version)
        instance.date_created = validated_data.get('date_created', instance.date_created)
        instance.date_updated = validated_data.get('date_updated', instance.date_updated)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()

        return instance


    def _save_project_config(self, project_config_list, instance):
        """
        Save a UserAgentProjectConfig that was nested in this UserAgent object
        """
        for project_config in project_config_list:
            try:
                # update the UserAgentProjectConfig if it exists
                uapc = UserAgentProjectConfig.objects.get(
                    project=project_config.get('project'),
                    agent=instance
                )
                uapc.config = project_config.get('config')
                uapc.save()

            except UserAgentProjectConfig.DoesNotExist:
                user_agent_project_config = UserAgentProjectConfig.objects.create(
                    **project_config,
                    agent=instance)
                user_agent_project_config.save()
                # no matching UserAgentProjectConfig exists for this agent
                # create one from the passed in pro'project_config'

    def validate_location(self, value):
        """
        Ensure the location being entered is valid
        """
        # Enforce unique OSF locations for agents
        if value.location_type.label == "location.type.osf":
            if self.context['view'].kwargs.get('pk') is None:
                useragents = UserAgent.objects.all()
            else:
                useragents = UserAgent.objects.all().exclude(id=self.initial_data['id'])

            for u in useragents:
                if u.location == value:
                    raise ValidationError("Duplicate OSF locations for agents is not allowed")

        return value


class NestedProjectUserAgentProjectConfigSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    config = serializers.JSONField(required=True)

    class Meta:
        model = UserAgentProjectConfig
        fields = (
            'id',
            'config'
        )


class ProjectUserAgentSerializer(serializers.ModelSerializer):
    """
    Read only Serializer that returns UserAgents for use with the projects/<pk>/agents
    endpoint. This should filter the Agent's configurations for other projects.
    """
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all()
    )
    version = serializers.CharField(required=True)
    # project_config = NestedProjectUserAgentProjectConfigSerializer(required=True,
    #                                                              source="get_project_config_list")
    project_config = serializers.SerializerMethodField()

    class Meta:
        model = UserAgent
        fields = '__all__'

    def get_project_config(self, obj):
        """
        Get the UserAgentProjectConfig object associated with this project/agent combo.
        """
        project_id = self.context.get('view').kwargs['pk']

        uapc = UserAgentProjectConfig.objects.get(
            agent=obj,
            project__id=project_id
        )
        serializer = NestedProjectUserAgentProjectConfigSerializer(instance=uapc)

        return serializer.data

class ResearchGroupSerializer(serializers.ModelSerializer, MetadataSerializer):
    parent_group = ResearchGroupPKRelatedField(
        required=False,
        allow_null=True
    )
    date_created = serializers.DateTimeField(read_only=True)
    date_updated = serializers.DateTimeField(read_only=True)

    MetadataDoc = ResearchGroupMetadataDoc

    class Meta:
        model = ResearchGroup
        fields = ('id',
                  'description',
                  'name',
                  'parent_group',
                  'date_created',
                  'date_updated',
                  'is_active')
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return MetadataSerializer.to_representation(self, instance, ret)

    def create(self, validated_data):
        researchgroup = ResearchGroup.objects.create(**validated_data)
        researchgroup.date_created = now()

        return researchgroup

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get(
                                'description', instance.description)
        instance.date_updated = now()
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.parent_group = validated_data.get('parent_group', instance.parent_group)
        instance.save()
        return instance


class GroupRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupRole
        fields = ('id',
                  'label',
                  'description')


class GroupMemberSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )
    group = ResearchGroupPKRelatedField()
    group_role = serializers.PrimaryKeyRelatedField(
        queryset=GroupRole.objects.all()
    )
    date_created = serializers.DateTimeField(read_only=True)
    date_updated = serializers.DateTimeField(read_only=True)

    class Meta:
        model = GroupMember
        fields = ('id',
                  'group',
                  'group_role',
                  'user',
                  'is_active',
                  'date_created',
                  'date_updated',
                  'date_expires')

    def create(self, validated_data):

        # deny 'All Users' with any role other than member if user is not superuser
        # raise serializers.ValidationError()
        request = self.context['request']
        # all_users_group = ResearchGroup.objects.get(name='All Users')


        # if not request.user.is_superuser \
        #   and request.data['group'] is all_users_group:
        #     raise exceptions.PermissionDenied()


        groupmember = GroupMember.objects.create(**validated_data)
        groupmember.date_created = now()

        return groupmember

    def update(self, instance, validated_data):
        instance.user = validated_data.get('user', instance.user)
        instance.group = validated_data.get('group', instance.group)
        instance.group_role = validated_data.get(
                                'group_role', instance.group_role)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.date_expires = validated_data.get(
                                'date_expires', instance.date_expires)
        instance.date_updated = now()
        instance.save()

        return instance


class DatasetDataCollectionMethodSerializer(serializers.ModelSerializer):
    dataset = DatasetPKRelatedField()
    data_collection_method = serializers.PrimaryKeyRelatedField(
        queryset=DataCollectionMethod.objects.all()
    )

    class Meta:
        model = DatasetDataCollectionMethod
        fields = ('id',
                  'dataset',
                  'data_collection_method')


class GroupViewGrantSerializer(serializers.ModelSerializer):
    group = ResearchGroupPKRelatedField()
    dataset = DatasetPKRelatedField()

    date_created = serializers.DateTimeField(read_only=True)
    date_updated = serializers.DateTimeField(read_only=True)

    class Meta:
        model = GroupViewGrant
        fields = ('id',
                  'group',
                  'dataset',
                  'fields',
                  'date_created',
                  'date_updated',
                  'date_starts',
                  'date_expires')

    def create(self, validated_data):
        groupviewgrant = GroupViewGrant.objects.create(**validated_data)
        groupviewgrant.date_created = now()

        return groupviewgrant

    def update(self, instance, validated_data):
        instance.group = validated_data.get('group', instance.group)
        instance.dataset = validated_data.get('dataset', instance.dataset)
        instance.fields = validated_data.get('fields', instance.fields)
        instance.date_starts = validated_data.get(
                                    'date_starts', instance.date_starts)
        instance.date_expires = validated_data.get(
                                    'date_expires', instance.date_expires)
        instance.date_updated = now()
        instance.save()

        return instance

class GeoDataSerializer(serializers.ModelSerializer):

    geojson = serializers.JSONField()
    content_type = ContentObjectNameForeignKey()

    class Meta:
        model = GeoData
        fields = (
            'id',
            'geojson',
            'object_id',
            'content_type'
        )

    def create(self, validated_data):
        return GeoData.objects.create(**validated_data)

    def update(self, instance, validated_data):

        instance.geojson = validated_data.get('geojson', instance.geojson)
        instance.object_id = validated_data.get('object_id', instance.object_id)
        instance.content_type = validated_data.get('content_type', instance.content_type)

        instance.save()

        return instance

    def validate(self, data):
        """
        Object wide validation

        Make sure the object_id is actually an object of the type 'content_type'
        """
        content_type = data.get('content_type')
        object_id = data.get('object_id')

        klass = content_type.model_class()

        try:
            klass.objects.get(id=object_id)
        except klass.DoesNotExist:
            raise serializers.ValidationError(
                'No {} found with id: {}'.format(klass.__name__, object_id)
            )

        return data

    def validate_content_type(self, value):
        """
        Enforce that only Dataset, Project, and Location are valid related models
        for GeoData type.
        """
        valid_related_models = ['dataset', 'project', 'location']
        error_msg = "Must be Dataset, Project, or Location"

        valid_related_models_queryset = ContentType.objects.filter(
            app_label='api',
            model__in=valid_related_models
        )

        if value not in valid_related_models_queryset:
            raise serializers.ValidationError(error_msg)

        return value

    def validate_geojson(self, value):
        """
        Enforce that the GeoJSON is a valid FeatureCollection.
        """

        error_msg = "This field should contain a GeoJSON FeatureCollection."

        if type(value) is not dict:
            raise serializers.ValidationError(error_msg)

        if value['type'] != 'FeatureCollection':
            raise serializers.ValidationError(error_msg)

        if "features" not in value:
            raise serializers.ValidationError("FeatureCollection should have a 'features' key")

        return value

class NestedProjectSerializer(serializers.ModelSerializer):
    id = serializers.CharField()
    name = serializers.CharField(required=False)

    class Meta:
        model = Project
        fields = ('id',
                  'name')

class LocationSerializer(serializers.ModelSerializer):
    location_type = serializers.PrimaryKeyRelatedField(
        queryset=LocationType.objects.all()
    )
    date_created = serializers.DateTimeField(read_only=True)
    date_updated = serializers.DateTimeField(read_only=True)
    geo = GeoDataSerializer(required=False, allow_null=True, source="get_geo_data")
    projects = NestedProjectSerializer(many=True, source="get_projects")

    class Meta:
        model = Location
        fields = ('id',
                  'display_name',
                  'host_name',
                  'location_type',
                  'is_active',
                  'date_created',
                  'date_updated',
                  'globus_endpoint',
                  'globus_path',
                  'notes',
                  'portal_url',
                  'osf_project',
                  'geo',
                  'projects')

    def create(self, validated_data):
        """
        Create a Location instance
        """
        projects_list = validated_data.pop("get_projects")
        try:
            geodata = validated_data.pop("get_geo_data")
        except KeyError:
            pass

        location = Location.objects.create(**validated_data)
        location.date_created = now()

        self._save_location_projects(projects_list, location)
        try:
            self._save_geodata(geodata, location)
        except NameError:
            pass

        return location

    def update(self, instance, validated_data):
        """
        Update a Location instance
        """
        try:
            projects_list = validated_data.pop("get_projects")
            self._save_location_projects(projects_list, instance)
        except KeyError:
            pass

        try:
            geodata = validated_data.pop("get_geo_data")
            self._save_geodata(geodata, instance)
        except KeyError:
            pass

        instance.display_name = validated_data.get('display_name', instance.display_name)
        instance.host_name = validated_data.get('host_name', instance.host_name)
        instance.location_type = validated_data.get(
                                    'location_type', instance.location_type)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.date_updated = now()
        instance.globus_endpoint = validated_data.get('globus_endpoint', instance.globus_endpoint)
        instance.globus_path = validated_data.get('globus_path', instance.globus_path)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.portal_url = validated_data.get('portal_url', instance.portal_url)
        instance.osf_project = validated_data.get('osf_project', instance.osf_project)
        instance.save()

        return instance

    def _save_geodata(self, geo, instance):
        """
        If the linked GeoData object exists, update it. If not, create it.
        """

        geojson_geometry = geo.get('geojson')
        ctype = ContentType.objects.get_for_model(instance)

        try:
            # update the geodataobject if it exists
            gd_obj = GeoData.objects.get(object_id=instance.id)
            gd_obj.geojson = geojson_geometry
            gd_obj.save()

        except GeoData.DoesNotExist:
            geodata = GeoData.objects.create(geojson=geojson_geometry, object_id=instance.id, content_type=ctype)
            geodata.save()

    def _save_location_projects(self, projects_list, instance):
        """
        Loop through the projects list and create corresponding
        LocationProject objects for this location instance.
        """
        for project_input in projects_list:
            if isinstance(project_input, dict):
                for project_data in project_input.items():
                    if (project_data[0] == "id"):
                        project_id = project_data[1]

            if isinstance(project_input, str):
                project_id = project_input

            if project_id:
                project = Project.objects.get(id=project_id)
                location_project = LocationProject.objects.create(project=project, location=instance)
                location_project.save()


class LocationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationType
        fields = ('id',
                  'label')


class DataCollectionStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataCollectionStatus
        fields = ('id',
                  'label')


class DataCollectionMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataCollectionMethod
        fields = ('id',
                  'label')

class ProjectAvatarSerializer(serializers.ModelSerializer):
    avatar_image = serializers.ImageField(max_length=None, allow_empty_file=False, use_url=False)

    class Meta:
        model = ProjectAvatar
        fields = ('id',
                  'width',
                  'height',
                  'avatar_image')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret.update({"avatar_image": "/" + str(instance.avatar_image)})
        return ret


# A class to represent embedded DataCollectionMethods not requiring a label or url
class NestedDataCollectionMethodSerializer(serializers.ModelSerializer):
    id = serializers.CharField()
    label = serializers.CharField(required=False)

    class Meta:
        model = DataCollectionMethod
        fields = ('id',
                  'label')


class DistributionRestrictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistributionRestriction
        fields = ('id',
                  'label')


class SensitivityLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensitivityLevel
        fields = ('id',
                  'label')


# A class to represent embedded SensitivityLevels not requiring a label or url
class NestedSensitivityLevelSerializer(serializers.ModelSerializer):
    id = serializers.CharField()
    label = serializers.CharField(required=False)

    class Meta:
        model = SensitivityLevel
        fields = ('id',
                  'label')


class DatasetSensitivitySerializer(serializers.ModelSerializer):
    dataset = DatasetPKRelatedField()
    sensitivity = serializers.PrimaryKeyRelatedField(
        queryset=SensitivityLevel.objects.all()
    )
    class Meta:
        model = DatasetSensitivity
        fields = ('id',
                  'dataset',
                  'sensitivity')


class ProjectSerializer(serializers.ModelSerializer, MetadataSerializer):
    group = ResearchGroupPKRelatedField()
    avatar = serializers.PrimaryKeyRelatedField(
        queryset=ProjectAvatar.objects.all(),
        allow_null=True
    )
    date_created = serializers.DateTimeField(read_only=True)
    date_updated = serializers.DateTimeField(read_only=True)
    geo = GeoDataSerializer(required=False, allow_null=True, source="get_geo_data")

    MetadataDoc = ProjectMetadataDoc

    class Meta:
        model = Project
        fields = ('id',
                  'name',
                  'group',
                  'number',
                  'keywords',
                  'primary_contact_user',
                  'avatar',
                  'date_created',
                  'date_updated',
                  'geo')

    def create(self, validated_data):
        """
        Create a Project instance.
        """
        try:
            geodata = validated_data.pop("get_geo_data")
        except KeyError:
            pass
        project = Project.objects.create(**validated_data)
        project.date_created = now()
        try:
            self._save_geodata(geodata, project)
        except NameError:
            pass

        return project

    def update(self, instance, validated_data):
        """
        Update a project instance
        """
        try:
            geodata = validated_data.pop("get_geo_data")
            if (geodata is not None):
                self._save_geodata(geodata, instance)
        except KeyError:
            pass

        instance.name = validated_data.get('name', instance.name)
        instance.number = validated_data.get('number', instance.number)
        instance.keywords = validated_data.get('keywords', instance.keywords)
        instance.primary_contact_user = validated_data.get('primary_contact_user', instance.primary_contact_user)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.group = validated_data.get('group', instance.group)
        instance.date_updated = now()

        instance.save()

        return instance

    def validate_primary_contact_user(self, value):
        """
        Ensure the project primary contact user is a member of the project group
        """

        group = self.initial_data['group']
        project_group_member = GroupMember.objects.filter(
            user=value.id,
            group=group
        )
        if not project_group_member:
            raise serializers.ValidationError('Invalid primary contact user.')
        else:
            return value

    def _save_geodata(self, geo, instance):
        """
        If the linked GeoData object exists, update it. If not, create it.
        """

        geojson_geometry = geo.get('geojson')
        ctype = ContentType.objects.get_for_model(instance)

        try:
            # update the geodataobject if it exists
            gd_obj = GeoData.objects.get(object_id=instance.id)
            gd_obj.geojson = geojson_geometry
            gd_obj.save()

        except GeoData.DoesNotExist:
            geodata = GeoData.objects.create(geojson=geojson_geometry, object_id=instance.id, content_type=ctype)
            geodata.save()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return MetadataSerializer.to_representation(self, instance, ret)

class ESDatasetSerializer(serializers.Serializer):

    # serialize will not run for empty result set

    class Meta(object):
        pass

    def to_representation(self, instance):

        representation = {}

        if not instance:
            return representation

        if instance and instance.meta and instance.meta.id:
            # first add the doc id if its the first 'layer'
            representation.update({'id': instance.meta.id})
        # convert the rest of the result object into a dict and append it to rep
        representation.update(instance.to_dict())
        return representation

class DatasetSerializer(serializers.ModelSerializer, MetadataSerializer):

    project = ProjectPKRelatedField()
    data_collection_status = serializers.PrimaryKeyRelatedField(
        queryset=DataCollectionStatus.objects.all()
    )
    distribution_restriction = serializers.PrimaryKeyRelatedField(
        queryset=DistributionRestriction.objects.all()
    )
    data_collection_method = NestedDataCollectionMethodSerializer(many=True, source="get_data_collection_methods")
    sensitivity_level = NestedSensitivityLevelSerializer(many=True, source="get_sensitivity_levels")
    date_created = serializers.DateTimeField(read_only=True)
    date_updated = serializers.DateTimeField(read_only=True)

    geo = GeoDataSerializer(required=False, allow_null=True, source="get_geo_data")

    MetadataDoc = DatasetMetadataDoc

    class Meta:
        model = Dataset
        fields = ('id',
                  'project',
                  'title',
                  'abstract',
                  'study_site',
                  'distribution_restriction',
                  'data_collection_method',
                  'data_collection_status',
                  'sensitivity_level',
                  'date_created',
                  'date_updated',
                  'geo')

    def create(self, validated_data):
        """
        Create a Dataset instance.
        """
        data_collection_methods_list = validated_data.pop("get_data_collection_methods")
        sensitivity_list = validated_data.pop("get_sensitivity_levels")
        try:
            geodata = validated_data.pop("get_geo_data")
        except KeyError:
            pass

        dataset = Dataset.objects.create(**validated_data)
        dataset.date_created = now()

        self._save_dataset_datacollectionmethods(data_collection_methods_list, dataset)
        self._save_dataset_sensitivitylevels(sensitivity_list, dataset)
        try:
            self._save_geodata(geodata, dataset)
        except NameError:
            pass

        return dataset

    def update(self, instance, validated_data):
        """
        Update a Dataset instance

        NOTE: validated_data.pop('<method>') with throw a KeyError if the
        corresponding item (data_collection_method or sensitivity_level) is not
        included in the JSON payload.
        """

        try:
            data_collection_methods_list = validated_data.pop("get_data_collection_methods")
            self._save_dataset_datacollectionmethods(data_collection_methods_list, instance)
        except KeyError:
            pass

        try:
            sensitivity_list = validated_data.pop("get_sensitivity_levels")
            self._save_dataset_sensitivitylevels(sensitivity_list, instance)
        except KeyError:
            pass

        try:
            geodata = validated_data.pop("get_geo_data")
            if (geodata is not None):
                self._save_geodata(geodata, instance)
        except KeyError:
            pass

        instance.project = validated_data.get('project', instance.project)
        instance.title = validated_data.get('title', instance.title)
        instance.abstract = validated_data.get('abstract', instance.abstract)
        instance.study_site = validated_data.get('study_site', instance.study_site)
        instance.distribution_restriction = validated_data.get('distribution_restriction', instance.distribution_restriction)
        instance.data_collection_status = validated_data.get('data_collection_status', instance.data_collection_status)
        instance.date_updated = now()

        instance.save()

        return instance

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return MetadataSerializer.to_representation(self, instance, ret)

    def _save_dataset_datacollectionmethods(self, data_collection_methods_list, instance):
        """
        Loop through the data collection methods list and create corresponding
        DatasetDataCollectionMethod objects for this dataset instance.
        """
        for data_collection_method_input in data_collection_methods_list:
            if isinstance(data_collection_method_input, dict):
                for method_data in data_collection_method_input.items():
                    if (method_data[0] == "id"):
                        method_id = method_data[1]

            if isinstance(data_collection_method_input, str):
                method_id = data_collection_method_input

            if method_id:
                data_collection_method = DataCollectionMethod.objects.get(id=method_id)
                dataset_data_collection_method = DatasetDataCollectionMethod.objects.create(data_collection_method=data_collection_method, dataset=instance)
                dataset_data_collection_method.save()

    def _save_dataset_sensitivitylevels(self, sensitivity_list, instance):
        """
        Loop through the sensitivity levels list and create corresponding
        DatasetSensitivityLevel objects for this dataset instance.
        """
        for sensitivity_input in sensitivity_list:
            if isinstance(sensitivity_input, dict):
                for sensitivity_data in sensitivity_input.items():
                    if (sensitivity_data[0] == "id"):
                        sensitivity_id = sensitivity_data[1]

            if isinstance(sensitivity_input, str):
                method_id = sensitivity_input

            if sensitivity_id:
                sensitivity = SensitivityLevel.objects.get(id=sensitivity_id)
                dataset_sensitivity = DatasetSensitivity.objects.create(sensitivity=sensitivity, dataset=instance)
                dataset_sensitivity.save()

    def _save_geodata(self, geo, instance):
        """
        If the linked GeoData object exists, update it. If not, create it.
        """

        geojson_geometry = geo.get('geojson')
        ctype = ContentType.objects.get_for_model(instance)

        try:
            gd_obj = GeoData.objects.get(object_id=instance.id)
            gd_obj.geojson = geojson_geometry
            gd_obj.object_id = geo.get('object_id')
            gd_obj.content_type = geo.get('content_type')
            gd_obj.save()

        except GeoData.DoesNotExist:
            geodata = GeoData.objects.create(geojson=geojson_geometry, object_id=instance.id, content_type=ctype)
            geodata.save()


class ProjectStatisticsSerializer(serializers.ModelSerializer):
    project = ProjectPKRelatedField()

    class Meta:
        model = ProjectStatistics
        fields = (#'url',
                  'id',
                  'project',
                  'stat_date',
                  'stat_key',
                  'stat_qualifier',
                  'stat_value')

class MetadataUITypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetadataUIType
        fields = ('id',
                  'key',
                  'label')

class MetadataValueTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetadataValueType
        fields = ('id',
                  'key',
                  'label')

class ChoiceListValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoiceListValue
        fields = ('id',
                  'label',
                  'value',
                  'list')

class ChoiceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoiceList
        fields = ('id',
                  'label')

class SchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schema
        fields = ('id',
                  'label')

class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = ('id',
                  'label',
                  'help',
                  'schema',
                  'parent',
                  'metadata_ui_type',
                  'metadata_value_type',
                  'many_values',
                  'choice_list',
                  'default_order',
                  'default_choice',
                  'default_value')

class EntityUniqueOneItemValidator:
    """
    A validator that makes sure that only one entity per item is created.
    Based upon https://github.com/encode/django-rest-framework/blob/master/rest_framework/validators.py
    """
    found_more_message = 'We found more than one of group, project, dataset, file or folder when trying to create or update this entity'
    def __init__(self, queryset):
        self.queryset = queryset
        self.fields = ('group', 'project', 'dataset', 'file', 'folder')

    def enforce_required_one_item(self, attrs):
        found_one = False
        found_more = False

        unique_fields = {}
        for field_name in self.fields:
            if field_name in attrs:
                value = attrs[field_name]
                if not value == None and not found_one:
                    found_one = True
                    unique_fields[field_name] = self.found_more_message
                elif not value == None and found_one:
                    found_more = True
                    unique_fields[field_name] = self.found_more_message

        if found_more:
            raise ValidationError(unique_fields, code='unique')

        if not found_one:
            raise ValidationError('There needs to be at least one group, project, dataset, file or folder when trying to create or update an entity', code='unique')

    def set_context(self, serializer_field):
         self.instance = getattr(serializer_field.parent, 'instance', None)

    def qs_filter(self, queryset, **kwargs):
        try:
            return queryset.filter(**kwargs)
        except (TypeError, ValueError, DataError):
            return queryset.none()

    def filter_queryset(self, attrs, queryset):
        """
        Filter the queryset to all instances matching the given attributes.
        """
        # If this is an update, then any unprovided field should
        # have it's value set based on the existing instance attribute.
        if self.instance is not None:
            for field_name in self.fields:
                if field_name not in attrs:
                    attrs[field_name] = getattr(self.instance, field_name)

        # Determine the filter keyword arguments and filter the queryset.
        filter_kwargs = {
            field_name: attrs[field_name]
            for field_name in self.fields
        }
        return self.qs_filter(queryset, **filter_kwargs)

    def exclude_current_instance(self, attrs, queryset):
        """
        If an instance is being updated, then do not include
        that instance itself as a uniqueness conflict.
        """
        if self.instance is not None:
            return queryset.exclude(pk=self.instance.pk)
        return queryset

    def __call__(self, attrs):
        self.enforce_required_one_item(attrs)
        queryset = self.queryset
        queryset = self.filter_queryset(attrs, queryset)
        queryset = self.exclude_current_instance(attrs, queryset)

    def __repr__(self):
        return '<%s(queryset=%s, field=%s, date_field=%s)>' % (
            self.__class__.__name__,
            smart_repr(self.queryset),
            smart_repr(self.field),
            smart_repr(self.date_field)
        )


class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = ('id',
                  'group',
                  'project',
                  'dataset',
                  'file',
                  'folder')
        validators = [
                        EntityUniqueOneItemValidator(
                            queryset=Entity.objects.all()
                        )
                    ]

    group = serializers.PrimaryKeyRelatedField(queryset=ResearchGroup.objects.all(),
            allow_null=True,
            validators=[UniqueValidator(queryset=Entity.objects.all(), message="There is already an entity with this group.")])

    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(),
            allow_null=True,
            validators=[UniqueValidator(queryset=Entity.objects.all(), message="There is already an entity with this project.")])

    dataset = serializers.PrimaryKeyRelatedField(queryset=Dataset.objects.all(),
            allow_null=True,
            validators=[UniqueValidator(queryset=Entity.objects.all(), message="There is already an entity with this dataset.")])

class SelectedSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelectedSchema
        fields = ('id',
                  'entity',
                  'schema')
        validators = [
            UniqueTogetherValidator(
                queryset=SelectedSchema.objects.all(),
                fields=('entity', 'schema')
            )
        ]

class SelectedFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelectedField
        fields = ('id',
                  'entity',
                  'field',
                  'default',
                  'required',
                  'visible',
                  'order')
        validators = [
            UniqueTogetherValidator(
                queryset=SelectedField.objects.all(),
                fields=('entity', 'field')
            )
        ]

class EntitySchemaFieldSerializer (serializers.Serializer):
    class Meta:
        model = Entity
        fields = ('id',
                  'group',
                  'project',
                  'dataset',
                  'file',
                  'folder',
                  'selected_schemas',
                  'selected_fields',
                  'schemas',
                  'fields',
                  'metadata_ui_types',
                  'metadata_value_types',
                  'choice_lists',
                  'choice_list_values')

    id = serializers.CharField()
    group = serializers.CharField()
    project = serializers.CharField()
    dataset = serializers.CharField()
    file = serializers.CharField()
    folder = serializers.CharField()
    selected_schemas = SelectedSchemaSerializer(many=True, source="get_selected_schemas")
    selected_fields = SelectedFieldSerializer(many=True, source="get_selected_fields")
    schemas = SchemaSerializer(many=True, source="get_schemas")
    fields = FieldSerializer(many=True, source="get_fields")
    metadata_ui_types = MetadataUITypeSerializer(many=True, source="get_metadata_ui_types")
    metadata_value_types = MetadataValueTypeSerializer(many=True, source="get_metadata_value_types")
    choice_lists = ChoiceListSerializer(many=True, source="get_choice_lists")
    choice_list_values = ChoiceListValueSerializer(many=True, source="get_choice_list_values")
