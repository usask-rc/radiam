import unittest
import json

from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.contrib.auth.models import AnonymousUser
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist

from radiam.api.models import User, ResearchGroup
from radiam.api.views import ResearchGroupViewSet


class TestResearchGroupAPI(TestCase):

    fixtures = ['users', 'researchgroups']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_list_groups(self):
        request = self.factory.get(reverse('researchgroup-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)
        self.assertEqual(response.status_code, 200)

    """
    Create
    """
    def test_create_researchgroup_no_required_fields(self):
        """
        Test Failure of ResearchGroup create without required fields
        """
        body = {
            "nothing": "nothing"
        }

        request = self.factory.post(
            reverse('researchgroup-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="This field is required",
            status_code=400)

    def test_create_researchgroup_blank_name(self):
        body = {
            "name": "",
            "description": "Some Test Group",
        }

        request = self.factory.post(
            reverse('researchgroup-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="This field may not be blank.",
            status_code=400)

    def test_create_researchgroup_no_name(self):
        body = {
            "description": "Some Test Group",
        }

        request = self.factory.post(reverse('researchgroup-list'), body)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="This field is required",
            status_code=400)

    def test_create_researchgroup_blank_description(self):
        body = {
            "name": "testgroup",
            "description": "",
        }

        request = self.factory.post(
            reverse('researchgroup-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="This field may not be blank.",
            status_code=400)

    def test_create_researchgroup_no_description(self):
        body = {
            "name": "testgroup",
        }

        request = self.factory.post(
            reverse('researchgroup-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="This field is required",
            status_code=400)

    def test_create_researchgroup_min_valid_input(self):
        """
        Test creation of a ResearchGroup with the minimum valid input
        name, description)
        """
        body = {
            "name": "test",
            "description": "description"
        }
        request = self.factory.post(
            reverse('researchgroup-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)
        response_data = response.data

        self.assertContains(
            response=response,
            text="",
            status_code=201)
        self.assertEqual("test", response_data['name'])
        self.assertEqual("description", response_data['description'])

    def test_create_researchgroup_name_exists(self):
        """
        Test creation of a ResearchGroup with a name that already exists
        using ResearchGroup 'admin' (pk=2 in fixtures)
        """
        body = {
            "name": "admin",
            "description": "description"
        }
        request = self.factory.post(
            reverse('researchgroup-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)
        response_data = response.data

        self.assertContains(
            response=response,
            text="research group with this name already exists.",
            status_code=400)

    def test_filter_fields_id(self):
        """
        Test the filter_fields values email
        """
        id = '348173de-c6b3-4ec8-ba84-f657f2a70a83'
        params = {
            'id': id
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=id, status_code=200)
        self.assertEquals(response.data['results'][0]['id'], id)
        self.assertEquals(response.data['count'], 1)

    def test_filter_fields_name(self):
        """
        Test the filter_fields values email
        """
        name = 'testgroup'
        params = {
            'name': name
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=name, status_code=200)
        self.assertEquals(response.data['results'][0]['name'], name)
        self.assertEquals(response.data['count'], 1)

    def test_filter_fields_description(self):
        """
        Test the filter_fields values email
        """
        description = 'Test Group'
        params = {
            'description': description
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=description, status_code=200)
        self.assertEquals(response.data['results'][0]['description'], description)
        self.assertEquals(response.data['count'], 1)

    def test_filter_fields_parent_group(self):
        """
        Test the filter_fields values email
        """
        parent_group = ResearchGroup.objects.get(id='23e69896-c60a-4e6c-a444-ba906ada91fb')
        params = {
            'parent_group': str(parent_group.id)
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=parent_group.id, status_code=200)
        self.assertEquals(response.data['results'][0]['parent_group'], parent_group.id)
        self.assertEquals(response.data['count'], 1)

    def test_create_researchgroup_with_parent(self):
        """
        Test creation of a ResearchGroup with a parent group
        """
        parent_group = ResearchGroup.objects.get(name="testgroup")

        body = {
            "name": "test",
            "description": "description",
            "parent_group": str(parent_group.id)
        }
        request = self.factory.post(
            reverse('researchgroup-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)
        response_data = response.data

        self.assertContains(
            response=response,
            text="",
            status_code=201)
        self.assertEqual("test", response_data['name'])
        self.assertEqual("description", response_data['description'])
        self.assertEqual(parent_group.id, response_data['parent_group'])

    def test_update_researchgroup_name(self):
        """
        Test update of a ResearchGroup with a new name
        """
        group = ResearchGroup.objects.get(name="testgroup")
        new_name = "name_changed"

        body = {
            "name": new_name
        }
        request = self.factory.patch(
            reverse('researchgroup-detail', args=[group.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'patch': 'partial_update'})(request, pk=group.id)
        response_data = response.data

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEqual(new_name, response_data['name'])

    def test_update_researchgroup_description(self):
        """
        Test update of a ResearchGroup with a new description
        """
        group = ResearchGroup.objects.get(name="testgroup")
        new_description = "desc_changed"

        body = {
            "description": new_description
        }
        request = self.factory.patch(
            reverse('researchgroup-detail', args=[group.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'patch': 'partial_update'})(request, pk=group.id)
        response_data = response.data

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEqual(new_description, response_data['description'])

    def test_update_researchgroup_new_parent(self):
        """
        Test update of a ResearchGroup with a new parent group
        """
        group = ResearchGroup.objects.get(name="drc")
        parent_group = ResearchGroup.objects.get(name="testgroup")

        body = {
            "parent_group": str(parent_group.id)
        }
        request = self.factory.patch(
            reverse('researchgroup-detail', args=[group.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'patch': 'partial_update'})(request, pk=group.id)
        response_data = response.data

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEqual(group.name, response_data['name'])
        self.assertEqual(parent_group.id, response_data['parent_group'])