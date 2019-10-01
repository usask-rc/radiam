import json
from unittest import mock


from django.test import TestCase
from django.db.models.query import EmptyQuerySet

from rest_framework.test import APIRequestFactory
from rest_framework.test import APITestCase
from rest_framework.test import force_authenticate

from radiam.api.models import (
    Location, Project, User, UserAgent, UserAgentProjectConfig
)
from radiam.api.serializers import UserAgentSerializer


class TestUserAgentAPI(TestCase):
    """
    Test the UserAgent Model
    """

    fixtures = ['grouphierarchy',]

    def setUp(self):
        super().setUp()

    def test_useragent_create(self):
        """
        Test creation of a UserAgent object
        :return:
        """

        user = User.objects.get(username='admin')
        location = Location.objects.get(id='0ae20ca5-87d1-4cdf-9d56-84943e14898e')

        user_agent = UserAgent(user=user, location=location)

        self.assertTrue(isinstance(user_agent, UserAgent))
        self.assertEqual(user_agent.user, user)
        self.assertEqual(user_agent.location, location)

    def tearDown(self):
        super().tearDown()


class TestUserAgentSerializer(TestCase):
    """
    Test the UserAgentSerializer
    """

    fixtures = ['grouphierarchy',]

    @staticmethod
    def _make_useragent_data(user, location, version, project_config_list):
        return {
            'user': user,
            'version': version,
            'location': location,
            'project_config_list': project_config_list
        }

    def setUp(self):
        self.factory = APIRequestFactory()
        self.request = self.factory.get('/fake_endpoint')
        self.request.user = User.objects.get(username='admin')

    def test_useragent_create_missing_user_fail(self):
        """
        Test that UserAgent creation fails if 'user' is missing.
        :return:
        """

        location_id = '0ae20ca5-87d1-4cdf-9d56-84943e14898e'
        version = '0.0.1'
        project_name = 'test'

        user_agent_data = {
            "version": version,
            "location": location_id,
            "project_config_list": [{
                "project": project_name,
                "config": {

                }
            }]
        }

        serializer = UserAgentSerializer(data=user_agent_data, context={'request': self.request})

        if serializer.is_valid():
            self.fail('UserAgent input data should have been invalid.')

        self.assertIsNotNone(serializer.errors)
        self.assertIn('{"user": ["This field is required."]}',
                      json.dumps(serializer.errors))

    def test_useragent_create_null_user_fail(self):
        """
        Test that UserAgent creation fails if 'user' is null.
        :return:
        """

        location_id = '0ae20ca5-87d1-4cdf-9d56-84943e14898e'
        version = '0.0.1'
        project_name = 'test'

        user_agent_data = {
            "user": None,
            "version": version,
            "location": location_id,
            "project_config_list": [{
                "project": project_name,
                "config": {

                }
            }]
        }

        serializer = UserAgentSerializer(data=user_agent_data, context={'request': self.request})

        if serializer.is_valid():
            self.fail('UserAgent input data should have been invalid.')

        self.assertIsNotNone(serializer.errors)
        self.assertIn('{"user": ["This field may not be null."]}',
                      json.dumps(serializer.errors))

    def test_useragent_create_missing_version_fail(self):
        """
        Test that UserAgent creation fails if 'version' is missing.
        :return:
        """

        user = User.objects.get(username='testuser1')
        location_id = '0ae20ca5-87d1-4cdf-9d56-84943e14898e'
        project_name = 'test'

        user_agent_data = {
            "user": user.id,
            "location": location_id,
            "project_config_list": [{
                "project": project_name,
                "config": {

                }
            }]
        }

        serializer = UserAgentSerializer(data=user_agent_data, context={'request': self.request})

        if serializer.is_valid():
            self.fail('UserAgent input data should have been invalid.')

        self.assertIsNotNone(serializer.errors)
        self.assertIn('{"version": ["This field is required."]}',
                      json.dumps(serializer.errors))

    def test_useragent_create_null_version_fail(self):
        """
        Test that UserAgent creation fails if 'version' is null.
        :return:
        """

        user = User.objects.get(username='testuser1')
        location_id = '0ae20ca5-87d1-4cdf-9d56-84943e14898e'
        project_name = 'test'

        user_agent_data = {
            "user": user.id,
            "version": None,
            "location": location_id,
            "project_config_list": [{
                "project": project_name,
                "config": {

                }
            }]
        }

        serializer = UserAgentSerializer(data=user_agent_data, context={'request': self.request})

        if serializer.is_valid():
            self.fail('UserAgent input data should have been invalid.')

        self.assertIsNotNone(serializer.errors)
        self.assertIn('{"version": ["This field may not be null."]}',
                      json.dumps(serializer.errors))

    def test_useragent_create_missing_location_fail(self):
        """
        Test that UserAgent creation fails if 'location' is missing.
        :return:
        """

        user = User.objects.get(username='testuser1')
        project_name = 'test'
        version = '0.0.1'
        key = 'rootdir'
        value = '/test/folder'

        user_agent_data = {
            "user": user.id,
            "version": '0.0.1',
            "project_config_list": [{
                "project": project_name,
                "config": {
                    key: value
                }
            }]
        }

        serializer = UserAgentSerializer(data=user_agent_data, context={'request': self.request})

        if serializer.is_valid():
            self.fail('UserAgent input data should have been invalid.')

        self.assertIsNotNone(serializer.errors)
        self.assertIn('{"location": ["This field is required."]}',
                      json.dumps(serializer.errors))

    def test_useragent_create_null_location_fail(self):
        """
        Test that UserAgent creation fails if 'location' is null.
        :return:
        """

        user = User.objects.get(username='testuser1')
        project_name = 'test'
        version = '0.0.1'
        key = 'rootdir'
        value = '/test/folder'

        user_agent_data = {
            "user": user.id,
            "version": '0.0.1',
            "location": None,
            "project_config_list": [{
                "project": project_name,
                "config": {
                    key: value
                }
            }]
        }

        serializer = UserAgentSerializer(data=user_agent_data, context={'request': self.request})

        if serializer.is_valid():
            self.fail('UserAgent input data should have been invalid.')

        self.assertIsNotNone(serializer.errors)
        self.assertIn('{"location": ["This field may not be null."]}',
                      json.dumps(serializer.errors))

    def test_useragent_create_missing_project_config_fail(self):
        """
        Test that UserAgent creation fails if 'project_config' is missing.
        :return:
        """

        user = User.objects.get(username='testuser1')
        version = '0.0.1'
        location_id = '0ae20ca5-87d1-4cdf-9d56-84943e14898e'

        user_agent_data = {
            "user": user.id,
            "version": version,
            "location": location_id
        }

        serializer = UserAgentSerializer(data=user_agent_data, context={'request': self.request})

        if serializer.is_valid():
            self.fail('UserAgent input data should have been invalid.')

        self.assertIsNotNone(serializer.errors)
        self.assertIn('{"project_config_list": ["This field is required."]}',
                      json.dumps(serializer.errors))

    def test_useragent_create_null_project_config_fail(self):
        """
        Test that UserAgent creation fails if 'project_config' is null.
        :return:
        """

        user = User.objects.get(username='testuser1')
        version = '0.0.1'
        location_id = '0ae20ca5-87d1-4cdf-9d56-84943e14898e'

        user_agent_data = {
            "user": user.id,
            "version": version,
            "location": location_id,
            "project_config_list": None
        }

        serializer = UserAgentSerializer(
            data=user_agent_data, context={'request': self.request}
        )

        if serializer.is_valid():
            self.fail('UserAgent input data should have been invalid.')

        self.assertIsNotNone(serializer.errors)
        self.assertIn('{"project_config_list": ["This field may not be null."]}',
                      json.dumps(serializer.errors))

    def test_useragent_create(self):
        """
        Test that UserAgent creation is successful
        """

        user = User.objects.get(username='testuser1')
        location_id = '0ae20ca5-87d1-4cdf-9d56-84943e14898e'
        # project_id = '69c35620-cca7-4fd6-a84e-35ff3b34b24a'
        project_name = 'test'
        version = '0.0.1'
        key = 'rootdir'
        value = '/test/folder'

        user_agent_data = {
            "user": user.id,
            "location": location_id,
            "version": version,
            "project_config_list": [{
                "project": project_name,
                "config": {
                    key: value
                }
            }]
        }

        serializer = UserAgentSerializer(
            data=user_agent_data, context={'request': self.request}
        )

        if not serializer.is_valid():
            self.fail(serializer.errors)

        user_agent = serializer.save()
        uapc = UserAgentProjectConfig.objects.get(agent=user_agent)

        project = Project.objects.get(name=project_name)

        self.assertEqual({}, serializer.errors)
        self.assertNotEqual(EmptyQuerySet, uapc)
        self.assertEqual(str(uapc.project.name), project_name)
        self.assertEqual(uapc.project.id, project.id)

    def test_useragent_create_multiple(self):
        """
        Test that UserAgent creation is successful with multiple
        project configs for one UserAgent.
        """

        user = User.objects.get(username='testuser1')
        location_id = '0ae20ca5-87d1-4cdf-9d56-84943e14898e'
        version = '0.0.1'
        project_name_1 = 'test'
        project_name_2 = 'project 1'

        key = 'rootdir'
        value = '/test/folder'

        user_agent_data = {
            "user": user.id,
            "version": version,
            "location": location_id,
            "project_config_list": [
                {
                    "project": project_name_1,
                    "config": {
                        key: value
                    }
                },
                {
                    "project": project_name_2,
                    "config": {
                        key: value
                    }
                }
            ]
        }

        serializer = UserAgentSerializer(data=user_agent_data, context={'request': self.request})

        if not serializer.is_valid():
            self.fail(serializer.errors)

        user_agent = serializer.save()
        uapc = UserAgentProjectConfig.objects.filter(agent=user_agent)

        self.assertEqual({}, serializer.errors)
        self.assertNotEqual(EmptyQuerySet, uapc)
        self.assertNotEqual(EmptyQuerySet, uapc.filter(project=project_name_1))
        self.assertNotEqual(EmptyQuerySet, uapc.filter(project=project_name_2))

    def test_useragent_update_projectconfig_value(self):
        """
        Test Updating a UserAgent Location using serializers.
        """

        user = User.objects.get(username='testuser1')
        version = '0.0.1'
        location_id = '0ae20ca5-87d1-4cdf-9d56-84943e14898e'
        project_name = 'test'
        key = 'rootdir'
        value = '/test/dir'

        project_config_list = [{
            "project": project_name,
            "config": {
                key: value
            }
        }]
        user_agent_data = self._make_useragent_data(
            user.id, location_id, version, project_config_list
        )

        serializer = UserAgentSerializer(
            data=user_agent_data, context={'request': self.request}
        )

        if not serializer.is_valid():
            self.fail(serializer.errors)
        user_agent = serializer.save()
        uapc = UserAgentProjectConfig.objects.get(
            agent=user_agent,
            project__name=project_name
        )

        # update the config
        updated_config = {
            'rootdir': '/test/dir/updated'
        }
        updated_config_list = [{
            "project": project_name,
            "config": updated_config
        }]
        updated_model_data = self._make_useragent_data(
            user.id, location_id, version, updated_config_list
        )

        serializer_update = UserAgentSerializer(
            instance=user_agent,
            data=updated_model_data,
            context={'request': self.request}
        )
        if not serializer_update.is_valid():
            self.fail(serializer_update.errors)

        user_agent = serializer_update.save()

        uapc_update = UserAgentProjectConfig.objects.get(
            agent=user_agent,
            project__name=project_name
        )

        self.assertEqual({}, serializer_update.errors)
        self.assertNotEqual(EmptyQuerySet, uapc)
        self.assertNotEqual(EmptyQuerySet, uapc_update)
        self.assertNotEqual(uapc.config, uapc_update.config)
        self.assertEqual(uapc.project.name, project_name)
        self.assertEqual(uapc.project.id, uapc_update.project.id)
        self.assertEqual(uapc_update.config, updated_config)
