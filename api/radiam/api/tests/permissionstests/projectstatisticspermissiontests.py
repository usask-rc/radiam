import json

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import (
    User, GroupViewGrant, Project, ProjectStatistics, ResearchGroup, SensitivityLevel
)
from radiam.api.views import ProjectStatisticsViewSet


class TestSuperuserProjectStatisticsPermissions(APITestCase):
    """
    Test Response codes for ProjectStatistics endpoints for Superuser roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_superuser_read_projectstatistics_list(self):
        """
        Test Superuser can read projectstatistics list
        """
        groups = self.user.get_groups()
        projectstatistics_count = ProjectStatistics.objects.all().count()

        request = self.factory.get(reverse('projectstatistics-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], projectstatistics_count)

    def test_superuser_write_projectstatistics_list(self):
        """
        Test Superuser can write projectstatistics list
        """
        project = Project.objects.get(name='project 1')

        body = {
            'project': str(project.id),
            'stat_key': 'key',
            'stat_qualifier': 'qualifier',
            'stat_value': 'value',
            'stat_date': '2019-05-13T00:00:00Z'
        }

        request = self.factory.post(
            reverse('projectstatistics-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'post': 'create'})(request)

        self.assertContains(response=response, text="", status_code=201)

    def test_superuser_read_projectstatistics_detail(self):
        """
        Test Superuser can read a projectstatistics detail
        """

        detail_projectstatistics = \
            ProjectStatistics.objects.get(id='cccb46ac-d998-4933-b85c-78543cf8b044')

        request = self.factory.get(
            reverse('projectstatistics-detail',
                    args=[detail_projectstatistics.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'get': 'retrieve'})(request, pk=detail_projectstatistics.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_projectstatistics_detail(self):
        """
        Test Superuser can write a projectstatistics detail
        """

        detail_projectstatistics = \
            ProjectStatistics.objects.get(id='cccb46ac-d998-4933-b85c-78543cf8b044')

        sensitivitylevel = SensitivityLevel.objects.get(label='sensitivity.level.none')

        body = {
            "sensitivity": str(sensitivitylevel.id)
        }

        request = self.factory.patch(
            reverse('projectstatistics-detail',
                    args=[detail_projectstatistics.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'patch': 'partial_update'})(request,
                                                                                  pk=detail_projectstatistics.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)


class TestAdminUserProjectStatisticsPermissions(APITestCase):
    """
    Test Response codes for ProjectStatistics endpoints for Admin User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_admin_user_read_projectstatistics_list(self):
        """
        Test Admin User can read projectstatistics list
        """
        request = self.factory.get(reverse('projectstatistics-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_projectstatistics_list(self):
        """
        Test Admin user can write projectstatistics list

        """
        project = Project.objects.get(name='project 1')

        body = {
            'project': str(project.id),
            'stat_key': 'key',
            'stat_qualifier': 'qualifier',
            'stat_value': 'value',
            'stat_date': '2019-05-13T00:00:00Z'
        }

        request = self.factory.post(
            reverse('projectstatistics-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_admin_user_read_projectstatistics_detail(self):
        """
        Test Admin user can read a ProjectStatistics detail
        """

        detail_projectstatistics = \
            ProjectStatistics.objects.get(id='cccb46ac-d998-4933-b85c-78543cf8b044')

        request = self.factory.get(
            reverse('projectstatistics-detail',
                    args=[detail_projectstatistics.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'get': 'retrieve'})(request, pk=detail_projectstatistics.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_projectstatistics_detail(self):
        """
        Test Admin user can write a projectstatistics detail
        """

        detail_projectstatistics = \
            ProjectStatistics.objects.get(id='cccb46ac-d998-4933-b85c-78543cf8b044')

        body = {
        }

        request = self.factory.patch(
            reverse('projectstatistics-detail', args=[detail_projectstatistics.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'patch': 'partial_update'})(request,
                                                                                  pk=detail_projectstatistics.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_projectstatistics_detail_denied(self):
        """
        Test Admin user cannot write a ProjectStatistics detail for a project
        they do not admin
        """

        detail_projectstatistics = \
            ProjectStatistics.objects.get(id='a44ae383-113a-4221-98b5-fa9304d1a2b1')

        project = Project.objects.get(name="project 2")

        body = {
            "project": str(project.id)
        }

        request = self.factory.patch(
            reverse('projectstatistics-detail', args=[detail_projectstatistics.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'patch': 'partial_update'})(request,
                                                                                  pk=detail_projectstatistics.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)


class TestManagerUserProjectStatisticsPermissions(APITestCase):
    """
    Test Response codes for ProjectStatistics endpoints for Manager User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser2')

    def test_manager_user_read_projectstatistics_list(self):
        """
        Test Manager User can read projectstatistics list
        """
        groups = self.user.get_groups()
        projectstatistics_count = ProjectStatistics.objects.filter(project__group__in=groups).count()

        request = self.factory.get(reverse('projectstatistics-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], projectstatistics_count)

    def test_manager_user_write_projectstatistics_list(self):
        """
        Test Manager user can write projectstatistics list

        """
        project = Project.objects.get(name='project 1')

        body = {
            'project': str(project.id),
            'stat_key': 'key',
            'stat_qualifier': 'qualifier',
            'stat_value': 'value',
            'stat_date': '2019-05-13T00:00:00Z'
        }

        request = self.factory.post(
            reverse('projectstatistics-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manager_user_read_projectstatistics_detail(self):
        """
        Test Manager user can read a projectstatistics detail
        """

        detail_projectstatistics = \
            ProjectStatistics.objects.get(id='cccb46ac-d998-4933-b85c-78543cf8b044')

        request = self.factory.get(
            reverse('projectstatistics-detail',
                    args=[detail_projectstatistics.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'get': 'retrieve'})(request, pk=detail_projectstatistics.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manager_user_write_projectstatistics_detail(self):
        """
        Test Manager user can write a projectstatistics detail
        """

        detail_projectstatistics = \
            ProjectStatistics.objects.get(id='cccb46ac-d998-4933-b85c-78543cf8b044')

        body = {
        }

        request = self.factory.patch(
            reverse('projectstatistics-detail', args=[detail_projectstatistics.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'patch': 'partial_update'})(request,
                                                                                  pk=detail_projectstatistics.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)


class TestMemberUserProjectStatisticsPermissions(APITestCase):
    """
    Test Response codes for ProjectStatistics endpoints for Member User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser3')

    def test_member_user_read_projectstatistics_list(self):
        """
        Test Member User can read projectstatistics list
        """
        groups = self.user.get_groups()
        projectstatistics_count = ProjectStatistics.objects.filter(project__group__in=groups).count()

        request = self.factory.get(reverse('projectstatistics-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], projectstatistics_count)

    def test_member_user_write_projectstatistics_list(self):
        """
        Test member user can write projectstatistics list

        """
        project = Project.objects.get(name='project 1')

        body = {
            'project': str(project.id),
            'stat_key': 'key',
            'stat_qualifier': 'qualifier',
            'stat_value': 'value',
            'stat_date': '2019-05-13T00:00:00Z'
        }

        request = self.factory.post(
            reverse('projectstatistics-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_member_user_read_projectstatistics_detail(self):
        """
        Test member user can read a projectstatistics detail
        """

        detail_projectstatistics = \
            ProjectStatistics.objects.get(id='cccb46ac-d998-4933-b85c-78543cf8b044')

        request = self.factory.get(
            reverse('projectstatistics-detail',
                    args=[detail_projectstatistics.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'get': 'retrieve'})(request, pk=detail_projectstatistics.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_member_user_write_projectstatistics_detail(self):
        """
        Test member user can write a projectstatistics detail
        """

        detail_projectstatistics = \
            ProjectStatistics.objects.get(id='cccb46ac-d998-4933-b85c-78543cf8b044')

        body = {
        }

        request = self.factory.patch(
            reverse('projectstatistics-detail', args=[detail_projectstatistics.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectStatisticsViewSet.as_view({'patch': 'partial_update'})(request,
                                                                                  pk=detail_projectstatistics.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)
