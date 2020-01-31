import json

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import (
    User, GroupViewGrant, Project, ResearchGroup, ProjectSensitivity, SensitivityLevel
)
from radiam.api.views import ProjectSensitivityViewSet


class TestSuperuserProjectSensitivityPermissions(APITestCase):
    """
    Test Response codes for Sensitivity endpoints for Superuser roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_superuser_read_projectsensitivity_list(self):
        """
        Test Superuser can read ProjectSensitivity list
        """
        request = self.factory.get(reverse('projectsensitivity-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        
    def test_superuser_write_projectsensitivity_list(self):
        """
        Test Superuser can write ProjectSensitivity list

        """
        projectsensitivity = SensitivityLevel.objects.get(label='sensitivity.level.none')
        project = Project.objects.get(name='project 1')

        body = {
            'project': str(project.id),
            'sensitivity': str(projectsensitivity.id)
        }

        request = self.factory.post(
            reverse('projectsensitivity-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'post': 'create'})(request)

        self.assertContains(response=response, text="", status_code=201)

    def test_superuser_read_projectsensitivity_detail(self):
        """
        Test Superuser can read a projectsensitivity detail
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        request = self.factory.get(
            reverse('projectsensitivity-detail',
                    args=[detail_projectsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'get': 'retrieve'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_projectsensitivity_detail(self):
        """
        Test Superuser can write a projectsensitivity detail
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        sensitivitylevel = SensitivityLevel.objects.get(label='sensitivity.level.none')

        body = {
            "sensitivity": str(sensitivitylevel.id)
        }

        request = self.factory.patch(
            reverse('projectsensitivity-detail',
                    args=[detail_projectsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)


class TestAdminUserProjectSensitivityPermissions(APITestCase):
    """
    Test Response codes for Sensitivity endpoints for Admin User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_admin_user_read_projectsensitivity_list(self):
        """
        Test Admin User can read ProjectSensitivity list
        """
        request = self.factory.get(reverse('projectsensitivity-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_projectsensitivity_list(self):
        """
        Test Admin user can write ProjectSensitivity list

        """
        projectsensitivity = SensitivityLevel.objects.get(label='sensitivity.level.none')
        project = Project.objects.get(name='project 1')

        body = {
            'project': str(project.id),
            'sensitivity': str(projectsensitivity.id)
        }

        request = self.factory.post(
            reverse('projectsensitivity-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'post': 'create'})(request)

        self.assertContains(response=response, text="", status_code=201)

    def test_admin_user_read_projectsensitivity_detail(self):
        """
        Test Admin user can read a projectsensitivity detail
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        request = self.factory.get(
            reverse('projectsensitivity-detail',
                    args=[detail_projectsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'get': 'retrieve'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_projectsensitivity_detail(self):
        """
        Test Admin user can write a projectsensitivity detail
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        sensitivitylevel = SensitivityLevel.objects.get(label='sensitivity.level.none')

        body = {
            "sensitivity": str(sensitivitylevel.id)
        }

        request = self.factory.patch(
            reverse('projectsensitivity-detail', args=[detail_projectsensitivity.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_projectsensitivity_detail_denied(self):
        """
        Test Admin user cannot write a projectsensitivity detail for a project
        they do not admin
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        project = Project.objects.get(name="project 2")

        body = {
            "project": str(project.id)
        }

        request = self.factory.patch(
            reverse('projectsensitivity-detail', args=[detail_projectsensitivity.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=400)

    def test_admin_user_write_projectsensitivity_detail_update_project_denied(self):
        """
        Test Admin user cannot write a projectsensitivity detail assigning a project they
        do not admin
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        project = Project.objects.get(name="project 2")

        body = {
            "project": str(project.id)
        }

        request = self.factory.patch(
            reverse('projectsensitivity-detail', args=[detail_projectsensitivity.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=400)


class TestManagerUserProjectSensitivityPermissions(APITestCase):
    """
    Test Response codes for Sensitivity endpoints for Manager User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser2')


    def test_manager_user_read_projectsensitivity_list(self):
        """
        Test Manager User can read ProjectSensitivity list
        """
        request = self.factory.get(reverse('projectsensitivity-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manager_user_write_projectsensitivity_list(self):
        """
        Test Manager user can write ProjectSensitivity list

        """
        projectsensitivity = SensitivityLevel.objects.get(label='sensitivity.level.none')
        project = Project.objects.get(name='project 1')

        body = {
            'project': str(project.id),
            'sensitivity': str(projectsensitivity.id)
        }

        request = self.factory.post(
            reverse('projectsensitivity-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manager_user_read_projectsensitivity_detail(self):
        """
        Test Manager user can read a projectsensitivity detail
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        request = self.factory.get(
            reverse('projectsensitivity-detail',
                    args=[detail_projectsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'get': 'retrieve'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manager_user_write_projectsensitivity_detail(self):
        """
        Test Manager user can write a projectsensitivity detail
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        sensitivitylevel = SensitivityLevel.objects.get(label='sensitivity.level.none')

        body = {
            "sensitivity": str(sensitivitylevel.id)
        }

        request = self.factory.patch(
            reverse('projectsensitivity-detail', args=[detail_projectsensitivity.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)


class TestMemberUserProjectSensitivityPermissions(APITestCase):
    """
    Test Response codes for Sensitivity endpoints for Member User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser3')

    def test_member_user_read_projectsensitivity_list(self):
        """
        Test Member User can read ProjectSensitivity list
        """
        request = self.factory.get(reverse('projectsensitivity-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        
    def test_member_user_write_projectsensitivity_list(self):
        """
        Test member user can write ProjectSensitivity list

        """
        projectsensitivity = SensitivityLevel.objects.get(label='sensitivity.level.none')
        project = Project.objects.get(name='project 1')

        body = {
            'project': str(project.id),
            'sensitivity': str(projectsensitivity.id)
        }

        request = self.factory.post(
            reverse('projectsensitivity-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_member_user_read_projectsensitivity_detail(self):
        """
        Test member user can read a projectsensitivity detail
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        request = self.factory.get(
            reverse('projectsensitivity-detail',
                    args=[detail_projectsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'get': 'retrieve'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_member_user_write_projectsensitivity_detail(self):
        """
        Test member user can write a projectsensitivity detail
        """

        detail_projectsensitivity = \
            ProjectSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        sensitivitylevel = SensitivityLevel.objects.get(label='sensitivity.level.none')

        body = {
            "sensitivity": str(sensitivitylevel.id)
        }

        request = self.factory.patch(
            reverse('projectsensitivity-detail', args=[detail_projectsensitivity.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_projectsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)
