import json

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import (
    User, GroupViewGrant, Dataset, ResearchGroup
)
from radiam.api.views import GroupViewGrantViewSet


class TestSuperuserViewGrantPermissions(APITestCase):
    """
    Test Response codes for GroupViewGrant endpoints for Superuser roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_superuser_read_groupviewgrant_list(self):
        """
        Test Superuser can read GroupViewGrant list
        """
        request = self.factory.get(reverse('groupviewgrant-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_groupviewgrant_list(self):
        """
        Test Superuser can write GroupViewGrant list
        """

        researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'group': str(researchgroup.id),
            'dataset': str(dataset.id),
            'fields': 'some test fields'
        }

        request = self.factory.post(
            reverse('groupviewgrant-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)
        
    def test_superuser_read_groupviewgrant_detail(self):
        """
        Test Superuser can write GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        request = self.factory.get(
            reverse('groupviewgrant-detail',
            args=[detail_groupviewgrant.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_groupviewgrant_detail(self):
        """
        Test Superuser can write GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        body = {
            'group': str(researchgroup.id),
        }

        request = self.factory.patch(
            reverse('groupviewgrant-detail', args=[detail_groupviewgrant.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_delete_groupviewgrant_detail(self):
        """
        Test Superuser can delete GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        request = self.factory.delete(
            reverse('groupviewgrant-detail', args=[detail_groupviewgrant.id]),
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'delete': 'destroy'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=204)


class TestAdminUserViewGrantPermissions(APITestCase):
    """
    Test Response codes for GroupViewGrant endpoints for Admin user roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_admin_user_read_groupviewgrant_list(self):
        """
        Test Admin user can read GroupViewGrant list
        """
        datasets = self.user.get_datasets()
        admin_groupviewgrants = GroupViewGrant.objects.filter(dataset__in=datasets)

        request = self.factory.get(reverse('groupviewgrant-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], admin_groupviewgrants.count())

    def test_admin_user_write_groupviewgrant_list(self):
        """
        Test Admin user can write GroupViewGrant list
        """
        researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'group': str(researchgroup.id),
            'dataset': str(dataset.id),
            'fields': 'some test fields'
        }

        request = self.factory.post(
            reverse('groupviewgrant-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_admin_user_read_groupviewgrant_detail(self):
        """
        Test Admin User can read GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        request = self.factory.get(
            reverse('groupviewgrant-detail',
            args=[detail_groupviewgrant.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'retrieve'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_read_groupviewgrant_detail_denied(self):
        """
        Test Admin User cannot read GroupViewGrant detail for a dataset they
        don't admin
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='e2e2e7b1-3e27-470c-9cf3-6ccbd82f8ec6')

        request = self.factory.get(
            reverse('groupviewgrant-detail',
            args=[detail_groupviewgrant.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'retrieve'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_admin_user_write_groupviewgrant_detail(self):
        """
        Test Admin user can write GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        body = {
            'group': str(researchgroup.id),
        }

        request = self.factory.patch(
            reverse('groupviewgrant-detail', args=[detail_groupviewgrant.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_delete_groupviewgrant_detail(self):
        """
        Test Admin user can delete GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        request = self.factory.delete(
            reverse('groupviewgrant-detail', args=[detail_groupviewgrant.id]),
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'delete': 'destroy'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=204)

    def test_admin_user_cannot_add_nonadmin_group_detail(self):
        """
        Test Admin user cannot change a groupviewgrant to a group they do not admin
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        researchgroup = ResearchGroup.objects.get(name='Test Research Group 2')

        body = {
            'group': str(researchgroup.id),
        }

        request = self.factory.patch(
            reverse('groupviewgrant-detail', args=[detail_groupviewgrant.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=400)


class TestManagerUserViewGrantPermissions(APITestCase):
    """
    Test Response codes for GroupViewGrant endpoints for Manager user roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser2')

    def test_manager_user_read_groupviewgrant_list(self):
        """
        Test Manager user can read GroupViewGrant list
        """
        request = self.factory.get(reverse('groupviewgrant-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manager_user_write_groupviewgrant_list_denied(self):
        """
        Test Manager user cannot write GroupViewGrant list
        """
        researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'group': str(researchgroup.id),
            'dataset': str(dataset.id),
            'fields': 'some test fields'
        }

        request = self.factory.post(
            reverse('groupviewgrant-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manager_user_read_groupviewgrant_detail(self):
        """
        Test Manager User can write GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        request = self.factory.get(
            reverse('groupviewgrant-detail',
            args=[detail_groupviewgrant.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manager_user_write_groupviewgrant_detail(self):
        """
        Test Manager user cannot write a GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        body = {
            'group': str(researchgroup.id),
        }

        request = self.factory.patch(
            reverse('groupviewgrant-detail', args=[detail_groupviewgrant.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)


class TestMemberUserViewGrantPermissions(APITestCase):
    """
    Test Response codes for GroupViewGrant endpoints for Member user roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser3')

    def test_member_user_read_groupviewgrant_list(self):
        """
        Test Member user cannot read GroupViewGrant list
        """
        request = self.factory.get(reverse('groupviewgrant-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_member_user_write_groupviewgrant_list(self):
        """
        Test Member user cannot write GroupViewGrant list
        """
        researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'group': str(researchgroup.id),
            'dataset': str(dataset.id),
            'fields': 'some test fields'
        }

        request = self.factory.post(
            reverse('groupviewgrant-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_member_user_read_groupviewgrant_detail(self):
        """
        Test Member User cannot write GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        request = self.factory.get(
            reverse('groupviewgrant-detail',
                    args=[detail_groupviewgrant.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_member_user_write_groupviewgrant_detail(self):
        """
        Test Member user cannot write a GroupViewGrant detail
        """
        detail_groupviewgrant = GroupViewGrant.objects.get(id='a2d0a0e8-74b3-408a-bff0-20de29253f59')

        researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        body = {
            'group': str(researchgroup.id),
        }

        request = self.factory.patch(
            reverse('groupviewgrant-detail', args=[detail_groupviewgrant.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)