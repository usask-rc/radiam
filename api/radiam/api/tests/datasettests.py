import unittest
import json
import time

from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import APITestCase
from rest_framework.test import force_authenticate

from django.contrib.auth.models import AnonymousUser
from django.urls import reverse

from radiam.api.models import (
    User, ResearchGroup, Project, Dataset, DistributionRestriction, DataCollectionMethod,
    DataCollectionStatus, SensitivityLevel)
from radiam.api.views import DatasetViewSet
from .elasticsearch.basesearchtestcase import BaseSearchTestCase
from .elasticsearch.testdata import *

from radiam.api.search import _SearchService, _IndexService

class TestDatasetAPI(BaseSearchTestCase):
    fixtures = ['researchgroups',
                'datasets',
                'projects',
                'distributionrestriction',
                'datacollectionstatus',
                'users']

    def setUp(self):
        super().setUp()
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_dataset_list(self):
        """
        Test that the dataset list is not empty.
        """
        request = self.factory.get(reverse('dataset-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'get': 'list'})(request)
        self.assertEqual(response.status_code, 200)
        self.assertLess(0, response.data['count'])

    def test_dataset_create(self):
        """
        Test that a new dataset is created
        """

        distribution_restriction = DistributionRestriction.objects.get(label='distribution.restriction.none')
        data_collection_status = DataCollectionStatus.objects.get(label='datacollection.status.inprogress')
        project = Project.objects.get(id='100235d2-c388-4abe-9c6d-73f528f38144')

        body = {
            'project': str(project.id),
            'title': 'Test project dataset',
            'abstract': 'Test dataset abstract',
            'study_site': 'Test study site',
            'distribution_restriction': str(distribution_restriction.id),
            'data_collection_status': str(data_collection_status.id),
            'sensitivity_level': [],
            'data_collection_method': [],
        }

        request = self.factory.post(
            reverse('dataset-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'post':'create'})(request)

        # Do all the dataset fields exist?
        self.assertContains(response=response, text='', status_code=201)
        self.assertIn('title', response.data)
        self.assertIn('abstract', response.data)
        self.assertIn('study_site', response.data)
        self.assertIn('distribution_restriction', response.data)
        self.assertIn('data_collection_status', response.data)
        self.assertIn('date_created', response.data)
        self.assertIn('date_updated', response.data)

    def test_dataset_exists(self):
        """
        Test that a dataset detail returns a dataset.
        """
        testdataset = Dataset.objects.get(title='Research Is Fun')
        testdataset_id = str(testdataset.id)

        request = self.factory.get(reverse(
            'dataset-detail',
            args=['dataset_id']))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view(
            {'get': 'retrieve'})(request, pk=testdataset_id)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data)

    def test_nonexistent_dataset_fails(self):
        """
        Test that a nonexisting dataset detail returns failure.
        """
        request = self.factory.get(reverse(
            'dataset-detail',
            args=['dataset_id']))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view(
            {'get': 'retrieve'})(request, pk='not-a-valid-uuid')

        self.assertContains(
            response=response,
            text='Not found',
            status_code=404)

    def test_dataset_delete(self):
        """
        Test that deleting a dataset removes the model
        """

        testdataset = Dataset.objects.get(title='Research Is Fun')
        testdataset_id = str(testdataset.id)

        # begin test
        request = self.factory.delete(reverse(
            'dataset-detail',
            args=[testdataset_id]),
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view(
            {'delete': 'destroy'})(request, pk=testdataset_id)

        self.assertContains(
            response=response,
            text='',
            status_code=204)
        self.assertFalse(self.indexservice.index_exists(testdataset_id))

    def test_dataset_update_title(self):
        """
        Test updating a dataset title
        """

        detail_dataset = Dataset.objects.get(title='Even more research')
        updated_title = "Dataset new title"

        body = {
            "title": updated_title
        }

        request = self.factory.patch(
            reverse('dataset-detail', args=[str(detail_dataset.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_dataset.id)

        self.assertContains(
            response = response,
            text = updated_title,
            status_code = 200)
        self.assertEquals(response.data['title'], updated_title)


    def test_dataset_update_abstract(self):
        """
        Test updating a dataset abstract
        """

        detail_dataset = Dataset.objects.get(title='Dataset for more tests')
        updated_abstract = "Dataset abstract updated"

        body = {
            "abstract": updated_abstract
        }

        request = self.factory.patch(
            reverse('dataset-detail', args=[str(detail_dataset.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_dataset.id)

        self.assertContains(
            response = response,
            text = updated_abstract,
            status_code = 200)
        self.assertEquals(response.data['abstract'], updated_abstract)

    def test_dataset_update_study_site(self):
        """
        Test updating a dataset study site
        """

        detail_dataset = Dataset.objects.get(title='Dataset for more tests')
        updated_study_site = "dataset study site updated"

        body = {
            "study_site": updated_study_site
        }

        request = self.factory.patch(
            reverse('dataset-detail', args=[str(detail_dataset.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_dataset.id)

        self.assertContains(
            response = response,
            text = updated_study_site,
            status_code = 200)
        self.assertEquals(response.data['study_site'], updated_study_site)

    def test_dataset_update_distribution_restriction(self):
        """
        Test updating a dataset distribution restriction
        """

        detail_dataset = Dataset.objects.get(title='Dataset for more tests')
        updated_distribution_restriction = DistributionRestriction.objects.get(
            label="distribution.restriction.embargo"
        )

        body = {
            "distribution_restriction": str(updated_distribution_restriction.id)
        }

        request = self.factory.patch(
            reverse('dataset-detail', args=[str(detail_dataset.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_dataset.id)

        self.assertContains(
            response = response,
            text = updated_distribution_restriction.id,
            status_code = 200)
        self.assertEquals(updated_distribution_restriction.id, response.data['distribution_restriction'])

    def test_dataset_update_data_collection_method(self):
        """
        Test updating a dataset data collection method
        """

        detail_dataset = Dataset.objects.get(title='Dataset for more tests')
        updated_data_collection_method = DataCollectionMethod.objects.get(
            label='datacollection.method.interview'
        )

        body = {
            "data_collection_method": [{
                "id": str(updated_data_collection_method.id)
            }]
        }

        request = self.factory.patch(
            reverse('dataset-detail', args=[str(detail_dataset.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_dataset.id)

        self.assertContains(
            response = response,
            text = updated_data_collection_method.id,
            status_code = 200)

    def test_dataset_update_data_collection_status(self):
        """
        Test updating a dataset data collection status
        """

        detail_dataset = Dataset.objects.get(title='Dataset for more tests')
        updated_data_collection_status = DataCollectionStatus.objects.get(
            label='datacollection.status.inprogress'
        )

        body = {
            "data_collection_status": str(updated_data_collection_status.id)
        }

        request = self.factory.patch(
            reverse('dataset-detail', args=[str(detail_dataset.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_dataset.id)

        self.assertContains(
            response = response,
            text = updated_data_collection_status.id,
            status_code = 200)


    def test_dataset_update_sensitivity_level(self):
        """
        Test updating a dataset sensitivity level and data collection method
        """

        detail_dataset = Dataset.objects.get(title='Dataset for more tests')
        updated_data_collection_method = DataCollectionMethod.objects.get(
            label='datacollection.method.other')
        updated_sensitivity_level = SensitivityLevel.objects.get(
            label='sensitivity.level.none')

        body = {
            "data_collection_method": [{
                "id": str(updated_data_collection_method.id)
            }],
            "sensitivity_level": [{
                "id": str(updated_sensitivity_level.id),
            }]
        }

        request = self.factory.patch(
            reverse('dataset-detail', args=[str(detail_dataset.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_dataset.id)

        self.assertContains(
            response = response,
            text = updated_sensitivity_level.id,
            status_code = 200)

