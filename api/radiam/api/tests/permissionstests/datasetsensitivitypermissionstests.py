import json

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import (
    User, GroupViewGrant, Dataset, ResearchGroup, DatasetSensitivity, SensitivityLevel
)
from radiam.api.views import DatasetSensitivityViewSet


class TestSuperuserDatasetSensitivityPermissions(APITestCase):
    """
    Test Response codes for Sensitivity endpoints for Superuser roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_superuser_read_datasetsensitivity_list(self):
        """
        Test Superuser can read DatasetSensitivity list
        """
        request = self.factory.get(reverse('datasetsensitivity-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        
    def test_superuser_write_datasetsensitivity_list(self):
        """
        Test Superuser can write DatasetSensitivity list

        """
        datasetsensitivity = SensitivityLevel.objects.get(label='sensitivity.level.none')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'dataset': str(dataset.id),
            'sensitivity': str(datasetsensitivity.id)
        }

        request = self.factory.post(
            reverse('datasetsensitivity-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'post': 'create'})(request)

        self.assertContains(response=response, text="", status_code=201)

    def test_superuser_read_datasetsensitivity_detail(self):
        """
        Test Superuser can read a datasetsensitivity detail
        """

        detail_datasetsensitivity = \
            DatasetSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        request = self.factory.get(
            reverse('datasetsensitivity-detail',
                    args=[detail_datasetsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'get': 'retrieve'})(request, pk=detail_datasetsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_datasetsensitivity_detail(self):
        """
        Test Superuser can write a datasetsensitivity detail
        """

        detail_datasetsensitivity = \
            DatasetSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        sensitivitylevel = SensitivityLevel.objects.get(label='sensitivity.level.none')

        body = {
            "sensitivity": str(sensitivitylevel.id)
        }

        request = self.factory.patch(
            reverse('datasetsensitivity-detail',
                    args=[detail_datasetsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_datasetsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)


class TestAdminUserDatasetSensitivityPermissions(APITestCase):
    """
    Test Response codes for Sensitivity endpoints for Admin User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_admin_user_read_datasetsensitivity_list(self):
        """
        Test Admin User can read DatasetSensitivity list
        """
        request = self.factory.get(reverse('datasetsensitivity-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_datasetsensitivity_list(self):
        """
        Test Admin user can write DatasetSensitivity list

        """
        datasetsensitivity = SensitivityLevel.objects.get(label='sensitivity.level.none')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'dataset': str(dataset.id),
            'sensitivity': str(datasetsensitivity.id)
        }

        request = self.factory.post(
            reverse('datasetsensitivity-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'post': 'create'})(request)

        self.assertContains(response=response, text="", status_code=201)

    def test_admin_user_read_datasetsensitivity_detail(self):
        """
        Test Admin user can read a datasetsensitivity detail
        """

        detail_datasetsensitivity = \
            DatasetSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        request = self.factory.get(
            reverse('datasetsensitivity-detail',
                    args=[detail_datasetsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'get': 'retrieve'})(request, pk=detail_datasetsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_datasetsensitivity_detail(self):
        """
        Test Admin user can write a datasetsensitivity detail
        """

        detail_datasetsensitivity = \
            DatasetSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        sensitivitylevel = SensitivityLevel.objects.get(label='sensitivity.level.none')

        body = {
            "sensitivity": str(sensitivitylevel.id)
        }

        request = self.factory.patch(
            reverse('datasetsensitivity-detail', args=[detail_datasetsensitivity.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_datasetsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)


class TestManagerUserDatasetSensitivityPermissions(APITestCase):
    """
    Test Response codes for Sensitivity endpoints for Manager User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser2')


    def test_manager_user_read_datasetsensitivity_list(self):
        """
        Test Manager User can read DatasetSensitivity list
        """
        request = self.factory.get(reverse('datasetsensitivity-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manager_user_write_datasetsensitivity_list(self):
        """
        Test Manager user can write DatasetSensitivity list

        """
        datasetsensitivity = SensitivityLevel.objects.get(label='sensitivity.level.none')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'dataset': str(dataset.id),
            'sensitivity': str(datasetsensitivity.id)
        }

        request = self.factory.post(
            reverse('datasetsensitivity-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manager_user_read_datasetsensitivity_detail(self):
        """
        Test Manager user can read a datasetsensitivity detail
        """

        detail_datasetsensitivity = \
            DatasetSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        request = self.factory.get(
            reverse('datasetsensitivity-detail',
                    args=[detail_datasetsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'get': 'retrieve'})(request, pk=detail_datasetsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manager_user_write_datasetsensitivity_detail(self):
        """
        Test Manager user can write a datasetsensitivity detail
        """

        detail_datasetsensitivity = \
            DatasetSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        sensitivitylevel = SensitivityLevel.objects.get(label='sensitivity.level.none')

        body = {
            "sensitivity": str(sensitivitylevel.id)
        }

        request = self.factory.patch(
            reverse('datasetsensitivity-detail', args=[detail_datasetsensitivity.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_datasetsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)


class TestMemberUserDatasetSensitivityPermissions(APITestCase):
    """
    Test Response codes for Sensitivity endpoints for Member User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser3')

    def test_member_user_read_datasetsensitivity_list(self):
        """
        Test Member User can read DatasetSensitivity list
        """
        request = self.factory.get(reverse('datasetsensitivity-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        
    def test_member_user_write_datasetsensitivity_list(self):
        """
        Test member user can write DatasetSensitivity list

        """
        datasetsensitivity = SensitivityLevel.objects.get(label='sensitivity.level.none')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'dataset': str(dataset.id),
            'sensitivity': str(datasetsensitivity.id)
        }

        request = self.factory.post(
            reverse('datasetsensitivity-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_member_user_read_datasetsensitivity_detail(self):
        """
        Test member user can read a datasetsensitivity detail
        """

        detail_datasetsensitivity = \
            DatasetSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        request = self.factory.get(
            reverse('datasetsensitivity-detail',
                    args=[detail_datasetsensitivity.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'get': 'retrieve'})(request, pk=detail_datasetsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_member_user_write_datasetsensitivity_detail(self):
        """
        Test member user can write a datasetsensitivity detail
        """

        detail_datasetsensitivity = \
            DatasetSensitivity.objects.get(id='f12d0558-b8c1-4c5d-8ddc-599bb172f4b6')

        sensitivitylevel = SensitivityLevel.objects.get(label='sensitivity.level.none')

        body = {
            "sensitivity": str(sensitivitylevel.id)
        }

        request = self.factory.patch(
            reverse('datasetsensitivity-detail', args=[detail_datasetsensitivity.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetSensitivityViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_datasetsensitivity.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)
