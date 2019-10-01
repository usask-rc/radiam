import unittest
import json

from django.test import TestCase
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import AnonymousUser
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist

from radiam.api.models import User, ResearchGroup, GroupRole
from radiam.api.views import GroupRoleViewSet


class TestGroupRoleAPI(TestCase):
    fixtures = ['users', 'researchgroups']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='bobrobb')

    def test_something(self):
        self.assertTrue(True)
