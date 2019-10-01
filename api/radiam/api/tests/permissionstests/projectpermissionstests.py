import json

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import (
    Project, User, ResearchGroup, DistributionRestriction, DataCollectionStatus,
    DataCollectionMethod, SensitivityLevel)
from radiam.api.views import ProjectViewSet

class TestSuperuserProjectPermissions(APITestCase):
    """
    Test Response codes for Project endpoints for Superuser roles
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_superuser_read_project_list(self):
        """
        Test Superuser can read Project list
        """
        request = self.factory.get(reverse('project-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_read_project_detail(self):
        """
        Test Superuser can read Project detail
        """

        detail_project = Project.objects.get(name='project 1')

        request = self.factory.get(reverse('project-detail', args=[detail_project.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'retrieve'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_project_list(self):
        """
        Test Superuser can write a Project list endpoint
        (ie: Create projects)
        """

        research_group = ResearchGroup.objects.get(id='718aaa07-0891-4931-8c73-1304f4a21d0d')

        body = {
            'name': 'test project',
            'group': str(research_group.id),
            'number': 'PRJ-1001134',
            'primary_contact_user': str(self.user.id),
            'avatar': None
        }

        request = self.factory.post(
            reverse('project-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_superuser_write_project_detail(self):
        """
        Test Superuser can write a Project detail endpoint
        (ie: Update an existing project)
        """
        detail_project = Project.objects.get(name='project 1')

        body = {
            "name": "project 1 changed"
        }

        request = self.factory.patch(
            reverse('project-detail', args=[detail_project.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)


class TestAdminuserProjectPermissions(APITestCase):
    """
    Test Response codes for Project endpoints for Admin user roles
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_adminuser_read_project_list(self):
        """
        Test Admin user can read project list
        """

        request = self.factory.get(reverse('project-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_adminuser_read_project_detail(self):
        """
        Test Admin user can read Project detail
        """

        detail_project = Project.objects.get(name='project 1')

        request = self.factory.get(reverse('project-detail', args=[detail_project.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'retrieve'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_adminuser_write_project_list(self):
        """
        Test Admin user can write a Project list endpoint
        (ie: Create projects)
        """

        research_group = ResearchGroup.objects.get(id='718aaa07-0891-4931-8c73-1304f4a21d0d')

        body = {
            'name': 'test project',
            'group': str(research_group.id),
            'number': 'PRJ-48572221',
            'primary_contact_user': str(self.user.id),
            'avatar': None
        }

        request = self.factory.post(
            reverse('project-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_adminuser_write_project_detail(self):
        """
        Test Admin user can write a Project detail endpoint
        (ie: Update an existing project)
        """

        detail_project = Project.objects.get(name='project 1')

        body = {
            "name": "project 1 changed"
        }

        request = self.factory.patch(
            reverse('project-detail', args=[detail_project.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_adminuser_change_project_group(self):
        """
        Test Admin user can change the group associated with a project
        """

        detail_project = Project.objects.get(name='project 1')
        researchgroup = ResearchGroup.objects.get(id='9f9c5261-4167-4e77-9110-b3206b594091')

        body = {
            'group': str(researchgroup.id)
        }

        request = self.factory.patch(
            reverse('project-detail', args=[detail_project.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)


    def test_adminuser_change_project_group_denied(self):
        """
        Test Admin user cannot replace the group for a project with a
        group that they do not admin
        """

        detail_project = Project.objects.get(name='project 1')
        researchgroup = ResearchGroup.objects.get(id='1cc80efd-83c6-488d-a722-73abdd4e5ce7')

        body = {
            'group': str(researchgroup.id)
        }

        request = self.factory.patch(
            reverse('project-detail', args=[detail_project.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=400)


class TestDataManageruserProjectPermissions(APITestCase):
    """
    Test Response codes for Project endpoints for DataManager role
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser2')

    def test_manageruser_read_project_list(self):
        """
        Test Manager user can read project list
        """

        request = self.factory.get(reverse('project-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_read_project_detail(self):
        """
        Test Manageruser can read Project detail
        """

        detail_project = Project.objects.get(name='project 1')

        request = self.factory.get(reverse('project-detail', args=[detail_project.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'retrieve'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manageruser_write_project_list_denied(self):
        """
        Test Manager user cannot write a Project list endpoint
        (ie: Create projects)
        """

        research_group = ResearchGroup.objects.get(id='718aaa07-0891-4931-8c73-1304f4a21d0d')

        body = {
            'name': 'test project',
            'group': str(research_group.id),
            'number': 'PRJ-199532',
            'primary_contact_user': str(self.user.id),
            'avatar': None
        }

        request = self.factory.post(
            reverse('project-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manageruser_write_project_detail_denied(self):
        """
        Test Manager user cannot write a Project detail endpoint
        (ie: Update an existing project)
        """

        detail_project = Project.objects.get(name='project 1')

        body = {
            "name": "project 1 changed"
        }

        request = self.factory.patch(
            reverse('project-detail', args=[detail_project.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)


class TestMemberuserProjectPermissions(APITestCase):
    """
    Test Response codes for Project endpoints for Member user role
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser3')

    def test_manageruser_read_project_list(self):
        """
        Test Member user can read Project list
        """

        request = self.factory.get(reverse('project-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_memberuser_read_project_detail(self):
        """
        Test Memberuser can read Project detail
        """

        detail_project = Project.objects.get(name='project 1')

        request = self.factory.get(reverse('project-detail', args=[detail_project.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'retrieve'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_memberuser_write_project_list_denied(self):
        """
        Test Member user cannot write a Project list endpoint
        (ie: Create projects)
        """

        research_group = ResearchGroup.objects.get(id='718aaa07-0891-4931-8c73-1304f4a21d0d')

        body = {
            'name': 'test project',
            'group': str(research_group.id),
            'number': 'N10144',
            'primary_contact_user': str(self.user.id),
            'avatar': None
        }

        request = self.factory.post(
            reverse('project-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_memberuser_write_project_detail_denied(self):
        """
        Test Member user cannot write a Project detail endpoint
        (ie: Update an existing project)
        """

        detail_project = Project.objects.get(name='project 1')

        body = {
            "name": "project 1 changed"
        }

        request = self.factory.patch(
            reverse('project-detail', args=[detail_project.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)
