import unittest
import json

from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from elasticsearch_dsl import Search

from django.contrib.auth.models import AnonymousUser
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist

from radiam.api.models import User, Project
from radiam.api.views import ProjectSearchViewSet
from radiam.api.search import _SearchService
from radiam.api.serializers import ESDatasetSerializer

from .elasticsearch.basesearchtestcase import BaseSearchTestCase
from .elasticsearch.testdata import *


class TestDocumentAPI(BaseSearchTestCase):

    fixtures = ['searchtest', 'users', 'researchgroups']

    def setUp(self):
        super().setUp()
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='bobrobb')

    def test_document_list(self):
        """
        Test the document list endpoint
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        # Search for all docs
        search = Search(index=self.TEST_INDEX_ID)
        self.searchservice = _SearchService(search)
        result = self.searchservice.execute()

        if result.hits.total != 5:
            self.fail('Search should have returned results')

        request = self.factory.get(reverse('radiamprojectdocs-list', args=[project_id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSearchViewSet.as_view({'get': 'list'})(request, project_id=project_id)

        # Search for all docs
        search = Search(index=self.TEST_INDEX_ID)
        self.searchservice = _SearchService(search)
        result = self.searchservice.execute()

        self.assertContains(response=response, text="", status_code=200)
        self.assertEquals(result.hits.total, response.data['hits']['total'])

    def test_document_create(self):
        """
        Test the creation of a document in an index
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        body = TEST_DATA_SINGLE_DOC

        request = self.factory.post(
            reverse('radiamprojectdocs-list', args=[project_id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSearchViewSet.as_view({'post': 'create'})(request, project_id=project_id)

        self.assertContains(response=response, text="", status_code=200)

    def test_document_delete(self):
        """
        Test the deletion of a document in an index
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_SINGLE_DOC)

        # Need to grab the id of a document before we can try to retrieve by id.
        search = Search(index=self.TEST_INDEX_ID)
        self.searchservice = _SearchService(search)
        self.searchservice.add_match('name','maw doghouse node.txt')
        result = self.searchservice.execute()

        if result.hits.total != 1:
            self.fail('Search should have returned one result')
        else:
            doc_id =  result.hits[0].meta['id']

        request = self.factory.delete(reverse('radiamprojectdocs-list', args=[project_id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSearchViewSet.as_view({'delete': 'destroy'})(request, project_id=project_id, pk=doc_id)

        # Search for the deleted document should not return any results
        search = Search(index=self.TEST_INDEX_ID)
        self.searchservice = _SearchService(search)
        self.searchservice.add_match('name','maw doghouse node.txt')
        result = self.searchservice.execute()

        self.assertContains(response=response, text="", status_code=200)
        self.assertEqual(result.hits.total, 0)

    def test_document_update(self):
        """
        Test the update of a document in an index
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_SINGLE_DOC)

        # Need to grab the id of a document before we can try to retrieve by id.
        search = Search(index=self.TEST_INDEX_ID)
        self.searchservice = _SearchService(search)
        self.searchservice.add_match('name','maw doghouse node.txt')
        initial_result = self.searchservice.execute()

        if initial_result.hits.total != 1:
            self.fail('Search should have returned one result')
        else:
            doc = initial_result.hits[0]
            # doc_id =  initial_result.hits[0].meta['id']

        body = TEST_DATA_SINGLE_DOC_2[0]

        request = self.factory.put(
            reverse('radiamprojectdocs-list', args=[project_id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSearchViewSet.as_view({'put': 'update'})(request, project_id=project_id, pk=doc.meta['id'])

        # search for the updated document
        search = Search(index=self.TEST_INDEX_ID)
        self.searchservice = _SearchService(search)
        self.searchservice.add_match('name','millstone ambitious reign.txt')
        updated_result = self.searchservice.execute()

        if updated_result.hits.total != 1:
            self.fail('Search should have returned one result')
        else:
            updated_doc = updated_result.hits[0]

        self.assertContains(response=response, text="", status_code=200)
        self.assertEquals(updated_doc.meta['id'], doc.meta['id'])
        self.assertNotEquals(initial_result, updated_result)

    def test_document_update_partial(self):
        """
        Test the partial update of a document in an index
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_SINGLE_DOC)

        # Need to grab the id of a document before we can try to retrieve by id.
        search = Search(index=self.TEST_INDEX_ID)
        self.searchservice = _SearchService(search)
        self.searchservice.add_match('name','maw doghouse node.txt')
        initial_result = self.searchservice.execute()

        if initial_result.hits.total != 1:
            self.fail('Search should have returned one result')
        else:
            doc = initial_result.hits[0]
            # doc_id =  initial_result.hits[0].meta['id']

        body = {
            "keywords": "newtestkeyword"
        }

        request = self.factory.patch(
            reverse('radiamprojectdocs-list', args=[project_id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSearchViewSet.as_view({'patch': 'partial_update'})(request, project_id=project_id, pk=doc.meta['id'])

        # search for the updated document
        search = Search(index=self.TEST_INDEX_ID)
        self.searchservice = _SearchService(search)
        self.searchservice.add_match('name', 'maw doghouse node.txt')
        updated_result = self.searchservice.execute()

        if updated_result.hits.total != 1:
            self.fail('Search should have returned one result')
        else:
            updated_doc = updated_result.hits[0]

        self.assertContains(response=response, text="", status_code=200)
        self.assertEquals(updated_doc.meta['id'], doc.meta['id'])
        self.assertNotEquals(updated_doc['keywords'], doc['keywords'])

    def tearDown(self):
        super().tearDown()
