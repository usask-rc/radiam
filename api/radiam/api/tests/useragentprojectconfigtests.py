from unittest import mock

from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import APITestCase
from rest_framework.test import force_authenticate

from radiam.api.models import UserAgentProjectConfig, Project, User
from radiam.api.serializers import NestedUserAgentProjectConfigSerializer


class TestNestedUserAgentProjectConfigSerializer(APITestCase):
    """
    Test NestedUserAgentProjectConfig in UserAgent object.
    """

    fixtures = ['grouphierarchy',]

    def setUp(self):
        # super().setUp()
        self.factory = APIRequestFactory()
        self.request = self.factory.get('/fake_endpoint')
        self.request.user = User.objects.get(username='admin')

    def test_useragentprojectconfig_create(self):
        """
        Test that a UserAgentProjectConfig object can be created through the
        serializer.create() method.

        THIS TEST SHOULD BE IN THE USER AGENT OBJECT. IT"S KIND OF USELESS HERE.

        """
        key = 'rootdir'
        value = '/test/directory'

        agent_id = '12785dfb-1791-4771-953e-09febcb8b103'
        project_id = '69c35620-cca7-4fd6-a84e-35ff3b34b24a'

        uapc_data = {
            "agent": agent_id,
            "project": project_id,
            "key": key,
            "value": value
        }

        serializer = NestedUserAgentProjectConfigSerializer(data=uapc_data, context={'request': self.request})

        if not serializer.is_valid():
            self.fail(serializer.errors)

        uapc = serializer.save()

        self.assertTrue(isinstance(uapc, UserAgentProjectConfig))

    def tearDown(self):
        super().tearDown()