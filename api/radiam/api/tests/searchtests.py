import json
from elasticsearch_dsl import Index

from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import User, Project
from radiam.api.views import ProjectViewSet

from .elasticsearch.basesearchtestcase import BaseSearchTestCase
from .elasticsearch.testdata import *


class TestSearchAPI(BaseSearchTestCase):

    # load a test project from a fixture a test project/index
    fixtures = ['searchtest', 'users', 'researchgroups']

    def setUp(self):
        """
        There won't be a corresponding index since this project was not created
        through the API. Create a test index that matches this project.
        """
        super().setUp()
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_project_search_single_no_result(self):
        """
        Test that a search correctly returns no results.
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_SINGLE_DOC)

        data = {
            "query": {
                "bool": {
                    "must": {
                        "match": {
                            "name": "non-existent-doc.doc"
                        }
                    }
                }
            }
        }

        request = self.factory.post(reverse(
            'project-search',
            args=[project_id]),
            json.dumps(data),
            content_type='application/json'
        )

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project_id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['count'], 0)

    def test_project_search_single_result(self):
        """
        Test that a search correctly returns one result.
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_SINGLE_DOC)
        # self.index_test_docs(TEST_DATA_AGENT_SHAPE_DOCS)

        data = {
            "query": {
                "bool": {
                    "must": {
                        "match": {
                            "name": "Scienceves.png"
                        }
                    }
                }
            }
        }

        request = self.factory.post(reverse(
            'project-search',
            args=[project_id]),
            json.dumps(data),
            content_type='application/json'
        )

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project_id)

        self.assertContains(response=response, text='Scienceves', status_code=200)
        self.assertEquals(response.data['count'], 1)

    def test_project_search_multiple_results(self):
        """
        Test search endpoint with only a generic search query 'q', This test
        should return 4 results.
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)
        # self.index_test_docs(TEST_DATA_AGENT_SHAPE_DOCS)

        data = {
            "query": {
                "bool": {
                    "must": {
                        "match": {
                            "owner": "jeff"
                        }
                    }
                }
            }
        }

        request = self.factory.post(reverse(
            'project-search',
            args=[project_id]),
            json.dumps(data),
            content_type='application/json'
        )

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project_id)

        self.assertContains(response=response, text='jeff', status_code=200)
        self.assertEquals(response.data['count'], 2)

    def test_search_with_pagesize(self):
        """
        The search endpoint has page and page_size params available to paginate
        the result set
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        PAGE_SIZE = 3

        data = {
            "query": {
                "bool": {
                    "must": {
                        "match_all": {}
                    }
                }
            }
        }

        path = reverse('project-search', args=[project.id]) + '?page_size='+str(PAGE_SIZE)
        request = self.factory.post(
            path,
            json.dumps(data),
            content_type='application/json'
        )

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project_id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(len(response.data['results']), PAGE_SIZE)

    def tearDown(self):
        """
        Delete the index entirely. It will be recreated with new data for
        the next test.
        """
        super().tearDown()
