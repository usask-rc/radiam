import json

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import (
    User, Dataset, DataCollectionMethod, DatasetDataCollectionMethod
)
from radiam.api.views import DatasetDataCollectionMethodViewSet


class TestSuperuserDatasetDataCollectionMethodPermissions(APITestCase):
    """
    Test Response codes for DataCollectionMethod endpoints for Superuser roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_superuser_read_datasetdatacollectionmethod_list(self):
        """
        Test Superuser can read DatasetDataCollectionMethod list
        """
        request = self.factory.get(reverse('datasetdatacollectionmethod-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_datasetdatacollectionmethod_list(self):
        """
        Test Superuser can write DatasetDataCollectionMethod list
        """
        datacollectionmethod = DataCollectionMethod.objects.get(label='datacollection.method.other')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'dataset': str(dataset.id),
            'data_collection_method': str(datacollectionmethod.id)
        }

        request = self.factory.post(
            reverse('datasetdatacollectionmethod-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'post': 'create'})(request)

        self.assertContains(response=response, text="", status_code=201)

    def test_superuser_read_datasetdatacollectionmethod_detail(self):
        """
        Test Superuser can read a DatasetDataCollectionMethod detail
        """

        detail_datasetdatacollectionmethod = \
            DatasetDataCollectionMethod.objects.get(id='f9d1402a-2301-4bf8-b4cd-70590e3ca4b7')

        request = self.factory.get(
            reverse('datasetdatacollectionmethod-detail',
                    args=[detail_datasetdatacollectionmethod.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'get': 'retrieve'})(request, pk=detail_datasetdatacollectionmethod.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_datasetdatacollectionmethod_detail(self):
        """
        Test Superuser can write a DatasetDataCollectionMethod detail
        """

        detail_datasetdatacollectionmethod = \
            DatasetDataCollectionMethod.objects.get(id='f9d1402a-2301-4bf8-b4cd-70590e3ca4b7')

        data_collection_method = DataCollectionMethod.objects.get(label='datacollection.method.other')

        body = {
            "data_collection_method": reverse('datacollectionmethod-detail', kwargs={'pk': data_collection_method.id})
        }

        request = self.factory.patch(
            reverse('datasetdatacollectionmethod-detail',
                    args=[detail_datasetdatacollectionmethod.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_datasetdatacollectionmethod.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)


class TestAdminUserDatasetDataCollectionMethodPermissions(APITestCase):
    """
    Test Response codes for DataCollectionMethod endpoints for Admin User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_admin_user_read_datasetdatacollectionmethod_list(self):
        """
        Test Admin User can read DatasetDataCollectionMethod list
        """
        request = self.factory.get(reverse('datasetdatacollectionmethod-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_datasetdatacollectionmethod_list(self):
        """
        Test Member user cannot write DatasetDataCollectionMethod list
        """
        datacollectionmethod = DataCollectionMethod.objects.get(label='datacollection.method.other')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'dataset': str(dataset.id),
            'data_collection_method': str(datacollectionmethod.id)
        }

        request = self.factory.post(
            reverse('datasetdatacollectionmethod-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_adminuser_read_datasetdatacollectionmethod_detail(self):
        """
        Test Admin user can read a DatasetDataCollectionMethod detail
        """

        detail_datasetdatacollectionmethod = \
            DatasetDataCollectionMethod.objects.get(id='f9d1402a-2301-4bf8-b4cd-70590e3ca4b7')

        request = self.factory.get(
            reverse('datasetdatacollectionmethod-detail',
                    args=[detail_datasetdatacollectionmethod.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'get': 'retrieve'})(request, pk=detail_datasetdatacollectionmethod.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_write_datasetdatacollectionmethod_detail(self):
        """
        Test Admin User can write a DatasetDataCollectionMethod detail
        """

        detail_datasetdatacollectionmethod = \
            DatasetDataCollectionMethod.objects.get(id='f9d1402a-2301-4bf8-b4cd-70590e3ca4b7')

        data_collection_method = DataCollectionMethod.objects.get(label='datacollection.method.other')

        body = {
            "data_collection_method": reverse('datacollectionmethod-detail', kwargs={'pk': data_collection_method.id})
        }

        request = self.factory.patch(
            reverse('datasetdatacollectionmethod-detail',
                    args=[detail_datasetdatacollectionmethod.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_datasetdatacollectionmethod.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

class TestManagerUserDatasetDataCollectionMethodPermissions(APITestCase):
    """
    Test Response codes for DataCollectionMethod endpoints for Manager User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser2')

    def test_manager_user_read_datasetdatacollectionmethod_list(self):
        """
        Test Manager User can read DatasetDataCollectionMethod list
        """
        request = self.factory.get(reverse('datasetdatacollectionmethod-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manager_user_write_datasetdatacollectionmethod_list(self):
        """
        Test Member user cannot write DatasetDataCollectionMethod list
        """
        datacollectionmethod = DataCollectionMethod.objects.get(label='datacollection.method.other')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'dataset': str(dataset.id),
            'data_collection_method': reverse('datacollectionmethod-detail', kwargs={'pk': datacollectionmethod.id})
        }

        request = self.factory.post(
            reverse('datasetdatacollectionmethod-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manager_user_read_datasetdatacollectionmethod_detail(self):
        """
        Test Manager user can read a DatasetDataCollectionMethod detail
        """

        detail_datasetdatacollectionmethod = \
            DatasetDataCollectionMethod.objects.get(id='f9d1402a-2301-4bf8-b4cd-70590e3ca4b7')

        request = self.factory.get(
            reverse('datasetdatacollectionmethod-detail',
                    args=[detail_datasetdatacollectionmethod.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'get': 'retrieve'})(request, pk=detail_datasetdatacollectionmethod.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manager_user_write_datasetdatacollectionmethod_detail(self):
        """
        Test Manager User can write a DatasetDataCollectionMethod detail
        """

        detail_datasetdatacollectionmethod = \
            DatasetDataCollectionMethod.objects.get(id='f9d1402a-2301-4bf8-b4cd-70590e3ca4b7')

        data_collection_method = DataCollectionMethod.objects.get(label='datacollection.method.other')

        body = {
            "data_collection_method": str(data_collection_method.id)
        }

        request = self.factory.patch(
            reverse('datasetdatacollectionmethod-detail',
                    args=[detail_datasetdatacollectionmethod.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_datasetdatacollectionmethod.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)


class TestMemberUserDatasetDataCollectionMethodPermissions(APITestCase):
    """
    Test Response codes for DataCollectionMethod endpoints for Member User roles
    """
    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser3')

    def test_member_user_read_datasetdatacollectionmethod_list(self):
        """
        Test Member User can read DatasetDataCollectionMethod list
        """
        request = self.factory.get(reverse('datasetdatacollectionmethod-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)


    def test_member_user_write_datasetdatacollectionmethod_list(self):
        """
        Test Member user cannot write DatasetDataCollectionMethod list
        """
        datacollectionmethod = DataCollectionMethod.objects.get(label='datacollection.method.other')
        dataset = Dataset.objects.get(title='Research Is Fun')

        body = {
            'dataset': str(dataset.id),
            'data_collection_method': str(datacollectionmethod.id)
        }

        request = self.factory.post(
            reverse('datasetdatacollectionmethod-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_member_user_read_datasetdatacollectionmethod_detail(self):
        """
        Test Member user can read a DatasetDataCollectionMethod detail
        """

        detail_datasetdatacollectionmethod = \
            DatasetDataCollectionMethod.objects.get(id='f9d1402a-2301-4bf8-b4cd-70590e3ca4b7')

        request = self.factory.get(
            reverse('datasetdatacollectionmethod-detail',
                    args=[detail_datasetdatacollectionmethod.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'get': 'retrieve'})(request, pk=detail_datasetdatacollectionmethod.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_member_user_write_datasetdatacollectionmethod_detail(self):
        """
        Test Member User can write a DatasetDataCollectionMethod detail
        """

        detail_datasetdatacollectionmethod = \
            DatasetDataCollectionMethod.objects.get(id='f9d1402a-2301-4bf8-b4cd-70590e3ca4b7')

        data_collection_method = DataCollectionMethod.objects.get(label='datacollection.method.other')

        body = {
            "data_collection_method": str(data_collection_method.id)
        }

        request = self.factory.patch(
            reverse('datasetdatacollectionmethod-detail',
                    args=[detail_datasetdatacollectionmethod.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetDataCollectionMethodViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_datasetdatacollectionmethod.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)
