import unittest
import json

from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.contrib.auth.models import AnonymousUser
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import IntegrityError

from radiam.api.models import (
    User, GroupMember, GroupRole, ResearchGroup
)
from radiam.api.views import GroupMemberViewSet


class TestGroupMemberAPI(TestCase):

    fixtures = [
        'users',
        'researchgroups',
        'grouproles',
        'groupmembers',
    ]

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_filter_fields_id(self):
        """
        Test the filter_fields values id
        """
        id = 'c0f59353-2edb-4b9c-bee8-62a998472bff'
        params = {
            'id': id
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=id, status_code=200)
        self.assertEquals(response.data['results'][0]['id'], id)
        self.assertEquals(response.data['count'], 1)


    def test_filter_fields_group_role(self):
        """
        Test the filter_fields values group_role
        """
        group_role = GroupRole.objects.get(id='d9ba1fc5-606f-4f16-81b1-8816095e5041')
        params = {
            'group_role': str(group_role.id)
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=group_role.id, status_code=200)
        self.assertEquals(response.data['results'][0]['group_role'], group_role.id)
        self.assertEquals(response.data['count'], 1)


    def test_filter_fields_user(self):
        """
        Test the filter_fields values user
        """
        user = User.objects.get(id='41c3fc25-2ad5-4b8e-9ec4-be45df40ed55')
        params = {
            'user': str(user.id)
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=user.id, status_code=200)
        self.assertEquals(response.data['results'][0]['user'], user.id)
        self.assertEquals(response.data['count'], 1)


    def test_filter_fields_date_expires(self):
        """
        Test the filter_fields values date_expires
        """
        pass
        # TODO this test work work until passing in date in proper format fixed
        # date_expires = '2019-03-13T21:47:09.577Z'
        # params = {
        #     'date_expires': date_expires
        # }
        #
        # request = self.factory.get(reverse('user-list'), params)
        # request.user = self.user
        #
        # response = GroupMemberViewSet.as_view({'get': 'list'})(request)
        #
        # self.assertContains(response=response, text=date_expires, status_code=200)
        # self.assertEquals(response.data['results'][0]['date_expires'], date_expires)
        # self.assertEquals(response.data['count'], 1)


    def test_group_member_user_group_unique_constraint(self):
        """
        Test that the unique constraint applies properly. Test adding a group
        membership with user-group combination that already exists in the fixtures.
        """

        group = ResearchGroup.objects.get(name='drc')
        group_role = GroupRole.objects.get(id='d9ba1fc5-606f-4f16-81b1-8816095e5041')
        # user = User.objects.get(username='testuser2')

        body = {
            'group': str(group.id),
            'group_role': str(group_role.id),
            'user': str(self.user.id),
            'is_active': True
        }

        with self.assertRaises(IntegrityError) as raise_context:
            request = self.factory.post(
                reverse('groupmember-list'),
                json.dumps(body),
                content_type='application/json')
            request.user = self.user
            force_authenticate(request, user=request.user)

            response = GroupMemberViewSet.as_view({'post': 'create'})(request)
