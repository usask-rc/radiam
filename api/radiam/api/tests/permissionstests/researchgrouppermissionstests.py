import json

from unittest import mock

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import Project, User, ResearchGroup
from radiam.api.views import ResearchGroupViewSet

class TestSuperuserResearchGroupPermissions(APITestCase):
    """
    Test Response codes for researchgroup endpoints for Superusers
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_superuser_read_researchgroup_list(self):
        """
        Test Superuser can read ResearchGroup list
        """
        request = self.factory.get(reverse('researchgroup-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_researchgroup_list(self):
        """
        Test Superuser can write ResearchGroup list
        (ie: create new ResearchGroups)
        """

        body = {
            "name": "testgroup",
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
            text="",
            status_code=201)

    def test_superuser_read_researchgroup_detail(self):
        """
        Test Superuser can update an existing research group
        """
        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        request = self.factory.get(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'retrieve'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    @mock.patch("radiam.api.documents.ResearchGroupMetadataDoc")
    @mock.patch("radiam.api.documents.ResearchGroupMetadataDoc.get")
    def test_superuser_write_researchgroup_detail(self, doc, get):
        """
        Test Superuser can update an existing research group
        """
        get.return_value = doc
        doc.update.return_value = None
        doc.save.return_value = None

        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        body = {
            "name": "testgroup",
            "description": "Some Test Group"
        }

        request = self.factory.patch(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)


class TestAdminuserResearchGroupPermissions(APITestCase):
    """
    Test Response codes for researchgroup endpoints for Admin users
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_adminuser_read_researchgroup_list(self):
        """
        Test Adminuser can read ResearchGroup list. Restricted to groups that
        they admin.
        """
        user_groups = self.user.get_groups()

        request = self.factory.get(reverse('researchgroup-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], user_groups.count())

    def test_adminuser_write_researchgroup_list(self):
        """
        Test Admin user can write ResearchGroup list
        (ie: create new ResearchGroups)
        """

        body = {
            "name": "testgroup",
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
            text="",
            status_code=201)

    def test_adminuser_read_researchgroup_detail(self):
        """
        Test Admin user can read an existing research group detail
        """
        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        request = self.factory.get(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'retrieve'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_adminuser_write_researchgroup_detail(self):
        """
        Test Adminuser can update an existing research group detail
        """
        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        body = {
            "description": "updated description",
        }

        request = self.factory.patch(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_adminuser_cannot_write_researchgroup_detail(self):
        """
        Test Adminuser for one group cannot update an existing research
        group detail for a group they have only member access to.
        """
        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 2')

        body = {
            "description": "updated description",
        }

        request = self.factory.patch(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)


class TestDataManageruserResearchGroupPermissions(APITestCase):
    """
    Test Response codes for researchgroup endpoints for Data Manager users
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser2')

    def test_manageruser_read_researchgroup_list(self):
        """
        Test Manager user can read ResearchGroup list
        """
        user_groups = self.user.get_groups()

        request = self.factory.get(reverse('researchgroup-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], user_groups.count())

    def test_manageruser_write_researchgroup_list(self):
        """
        Test Manager user can write ResearchGroup list
        (ie: create new ResearchGroups)
        """

        body = {
            "name": "testgroup",
            "description": "test group description",
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
            text="",
            status_code=403)

    def test_manageruser_read_researchgroup_detail(self):
        """
        Test Manager user can read an existing research group
        """
        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        request = self.factory.get(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'retrieve'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manageruser_write_researchgroup_detail_denied(self):
        """
        Test Manager user cannot update an existing research group
        """
        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        body = {
            "description": "updated description",
        }

        request = self.factory.patch(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)


class TestMemberuserResearchGroupPermissions(APITestCase):
    """
    Test Response codes for researchgroup endpoints for Member users
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser3')

    def test_memberuser_read_researchgroup_list(self):
        """
        Test Member user can read ResearchGroup list
        """
        user_groups = self.user.get_groups()

        request = self.factory.get(reverse('researchgroup-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], user_groups.count())

    def test_memberuser_write_researchgroup_list_denied(self):
        """
        Test Member user cannot write ResearchGroup list
        (ie: create new ResearchGroups)
        """

        body = {
            "name": "testgroup",
            "description": "test group description",
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
            text="",
            status_code=403)

    def test_memberuser_read_researchgroup_detail(self):
        """
        Test Member user can read an existing research group
        """
        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        request = self.factory.get(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'retrieve'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_memberuser_read_nonmember_researchgroup_detail_denied(self):
        """
        Test Member user cannot read an existing research group they don't have access to
        """
        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 2')

        request = self.factory.get(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'retrieve'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=404)

    def test_memberuser_write_researchgroup_detail_denied(self):
        """
        Test Memberuser cannot update an existing research group
        """
        detail_researchgroup = ResearchGroup.objects.get(name='Test Research Group 1')

        body = {
            "description": "updated description",
        }

        request = self.factory.patch(reverse('researchgroup-detail', args=[detail_researchgroup.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_researchgroup.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)
