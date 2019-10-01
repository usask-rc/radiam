from elasticsearch_dsl import Index

from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import User, Project
from radiam.api.views import SearchViewSet

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
        self.user = User.objects.get(username='bobrobb')

    def test_search_unique_document(self):
        """
        Test search endpoint with all params required to uniquely identify a document
        (path, name, radiam.agent, radiam.location)
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_SINGLE_DOC)
        # self.index_test_docs(TEST_DATA_AGENT_SHAPE_SINGLE_DOC)

        path = 'file://C:/Users/bob/My Documents/maw doghouse node.txt'
        name = 'maw doghouse node.txt'
        agent = 'd3ee03e1-a551-4495-9946-d5d0cad8cba3'
        location = '93836039-d54c-4616-a5d3-068a67a90227'
        params = {
            'path': path,
            'name': name,
            'radiam.agent': agent,
            'radiam.location': location
        }

        request = self.factory.get(reverse(
            'radiamsearch-list',
            args=[project_id]),
            params)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = SearchViewSet.as_view(
            {'get': 'list'})(request, project_id=project_id)

        self.assertContains(response=response, text=name, status_code=200)

    def test_generic_doc_search_single_result(self):
        """
        Test search endpoint with only a generic search query 'q', This test
        should only return one result.
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)
        # self.index_test_docs(TEST_DATA_AGENT_SHAPE_DOCS)

        q = 'zoo'
        params = { 'q': q}

        request = self.factory.get(reverse(
            'radiamsearch-list',
            args=[project_id]),
            params)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = SearchViewSet.as_view(
            {'get': 'list'})(request, project_id=project_id)

        self.assertContains(response=response, text='zoo', status_code=200)
        self.assertEquals(response.data['count'], 1)

    def test_generic_doc_search_multiple_results(self):
        """
        Test search endpoint with only a generic search query 'q', This test
        should return 4 results.
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)
        # self.index_test_docs(TEST_DATA_AGENT_SHAPE_DOCS)

        q = 'jim'
        params = {'q': q}

        request = self.factory.get(reverse(
            'radiamsearch-list',
            args=[project_id]),
            params)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = SearchViewSet.as_view(
            {'get': 'list'})(request, project_id=project_id)

        self.assertContains(response=response, text='bob', status_code=200)
        self.assertEquals(response.data['count'], 4)

    def test_combination_query_match_search_no_results(self):
        """
        Test search endpoint with generic search query 'q', as well as a 'match' filter.
        This test should return 0 results (no matches for 'jim' from a given agent)
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)
        # self.index_test_docs(TEST_DATA_AGENT_SHAPE_DOCS)

        q = 'jim'
        agent = 'd3ee03e1-a551-4495-9946-d5d0cad8cba3'
        params = {
            'radiam.agent': agent,
            'q': q
        }

        request = self.factory.get(reverse(
            'radiamsearch-list',
            args=[project_id]),
            params)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = SearchViewSet.as_view(
            {'get': 'list'})(request, project_id=project_id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['count'], 0)

    def test_combination_query_match_search(self):
        """
        Test search endpoint with generic search query 'q', as well as a 'match' filter.
        This test should return 4 results (matches for 'jim' from a given agent)
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)
        # self.index_test_docs(TEST_DATA_AGENT_SHAPE_DOCS)

        q = 'jim'
        agent = '6e0770d1-60a5-459a-bc91-c8a01ef5a116'
        params = {
            'radiam.agent': agent,
            'q': q
        }

        request = self.factory.get(reverse(
            'radiamsearch-list',
            args=[project_id]),
            params)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = SearchViewSet.as_view(
            {'get': 'list'})(request, project_id=project_id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['count'], 4)


    def test_search_with_pagesize(self):
        """
        The search endpoint has page and page_size params available to paginate
        the result set
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)
        project_id = str(project.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        PAGE_SIZE = 3


        params = {
            'page_size': PAGE_SIZE
        }

        request = self.factory.get(reverse(
            'radiamsearch-list',
            args=[project.id]),
            params)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = SearchViewSet.as_view(
            {'get': 'list'})(request, project_id=project_id)

        # print(response.data[])

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(len(response.data['results']), PAGE_SIZE)


    def tearDown(self):
        """
        Delete the index entirely. It will be recreated with new data for
        the next test.
        """
        super().tearDown()

