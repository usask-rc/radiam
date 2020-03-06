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
from radiam.api.serializers import LocationSerializer


class TestLocationAPI(TestCase):

    fixtures = [
        'grouphierarchy',
        'locationtypes',
        'locations']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_create_location_no_required_fields(self):
        """
        Test Failure of Location create without required fields
        """
        body = {
            "nothing": "nothing"
        }

        request = self.factory.post(
            reverse('location-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="This field is required",
            status_code=400)

    def test_location_create(self):
        """
        Test that Location creation is successful
        """

        body = {
            "display_name": "New Test Location",
            "host_name": "localhost",
            "location_type": "dc010206-085d-4f9a-8c04-631a23325bce",
            "is_active": "true",
            "projects": [
                {
                    "id": "69c35620-cca7-4fd6-a84e-35ff3b34b24a",
                    "name": "test"
                },
                {
                    "id": "a750cbe5-c5a6-42d0-97c8-285404001166",
                    "name": "child group 1 project"
                }
            ]
        }

        request = self.factory.post(
            reverse('location-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'post': 'create'})(request)

        self.assertContains(response=response, text='', status_code=201)
        self.assertIn('display_name', response.data)
        self.assertIn('host_name', response.data)
        self.assertIn('projects', response.data)

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
