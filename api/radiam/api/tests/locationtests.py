import unittest
import json

from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.contrib.auth.models import AnonymousUser
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist

from radiam.api.models import User, Location, LocationType
from radiam.api.views import LocationViewSet


class TestLocationAPI(TestCase):

    fixtures = [
        'grouphierarchy',
        'locationtypes',
        'locations']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')


    def test_filter_fields_name(self):
        """
        Test the filter_fields values name
        """
        display_name = 'Test Location 1'
        params = {
            'display_name': display_name
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=display_name, status_code=200)
        self.assertEquals(response.data['results'][0]['display_name'], display_name)
        self.assertEquals(response.data['count'], 1)


    def test_filter_fields_group_role(self):
        """
        Test the filter_fields values location_type
        """
        location_type = LocationType.objects.get(id='fd39b7e6-86f9-4b26-8563-32eb3cb88a22')
        params = {
            'location_type': str(location_type.id)
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=location_type.id, status_code=200)
        self.assertEquals(response.data['results'][0]['location_type'], location_type.id)
        self.assertEquals(response.data['count'], 1)
