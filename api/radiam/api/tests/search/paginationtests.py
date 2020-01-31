from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import User, Project
from radiam.api.views import ProjectViewSet

from ..elasticsearch.basesearchtestcase import BaseSearchTestCase
from ..elasticsearch.testdata import *


class PaginationTests(BaseSearchTestCase):
    """
    Test the pagination functions
    """

    fixtures = ['searchtest', 'users', 'researchgroups']

    def setUp(self):
        """
        Test Pagination
        :return:
        """
        super().setUp()
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    #
    # def test_pagination(self):
    #     """Test Pagination"""
    #
    #     project = Project.objects.get(id=self.TEST_INDEX_NAME)
    #
    #
    #     # print(m_search.execute())
    #
    #     # p = Paginator(m_search, 1)
    #
    #     # print(p.object_list)
    #     # self.assertIsInstance(p.object_list, elasticsearch_dsl.Search)
    #
    #     self.assertEquals(True, True)
    #     # Does page correctly return a portion of the results?


    def test_paginatedsearch_pagesize_zero(self):
        """
        The django paginator with ?page_size=0 appears to ignore the parameter
        altogether. This test dataset has 5 records, which is less than the ES
        default so all 5 should be returned
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        PAGE_SIZE = 0

        path = reverse('project-search', args=[project.id]) + '?page_size=' + str(PAGE_SIZE)
        request = self.factory.post(path)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project.id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(len(response.data['results']), len(TEST_DATA_MULTIPLE_DOCS))


    def test_paginatedsearch_pagesize_negative(self):
        """
        The django paginator with ?page_size=-1 appears to ignore the parameter
        altogether. This test dataset has 5 records, which is less than the ES
        default so all 5 should be returned
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        PAGE_SIZE = -1

        path = reverse('project-search', args=[project.id]) + '?page_size=' + str(PAGE_SIZE)
        request = self.factory.post(path)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project.id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(len(response.data['results']), len(TEST_DATA_MULTIPLE_DOCS))


    def test_paginatedsearch_pagesize_gt_len_results(self):
        """
        The search endpoint has page and page_size params available to paginate
        the result set
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        PAGE_SIZE = 100

        path = reverse('project-search', args=[project.id]) + '?page_size=' + str(PAGE_SIZE)
        request = self.factory.post(path)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project.id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(len(response.data['results']), len(TEST_DATA_MULTIPLE_DOCS))


    def test_paginatedsearch_pagesize(self):
        """
        Test valid page and page_size params to paginate the result set
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        PAGE_SIZE = 2

        path = reverse('project-search', args=[project.id]) + '?page_size=' + str(PAGE_SIZE)
        request = self.factory.post(path)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project.id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(len(response.data['results']), PAGE_SIZE)


    def test_paginatedsearch_page_and_pagesize(self):
        """
        The search endpoint has page and page_size params available to paginate
        the result set
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        PAGE = 2
        PAGE_SIZE = 2

        path = reverse('project-search',
                       args=[project.id]) + '?page_size=' + str(PAGE_SIZE) + '&page=' + str(PAGE)
        request = self.factory.post(path)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project.id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(len(response.data['results']), PAGE_SIZE)

    def test_paginatedsearch_lastpage_remainder(self):
        """
        The search endpoint has page and page_size params available to paginate
        the result set
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        PAGE = 3
        PAGE_SIZE = 2

        path = reverse('project-search',
                       args=[project.id]) + '?page_size=' + str(PAGE_SIZE) + '&page=' + str(PAGE)
        request = self.factory.post(path)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project.id)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(len(response.data['results']), response.data['count'] % PAGE_SIZE)

    def test_paginatedsearch_negative_page(self):
        """
        The search endpoint has page and page_size params available to paginate
        the result set
        """
        project = Project.objects.get(id=self.TEST_INDEX_ID)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        PAGE = -1
        PAGE_SIZE = 2

        path = reverse('project-search',
                       args=[project.id]) + '?page_size=' + str(PAGE_SIZE) + '&page=' + str(PAGE)
        request = self.factory.post(path)

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'post': 'search'})(request, pk=project.id)

        self.assertContains(response=response, text='Invalid', status_code=404)


    def tearDown(self):
        super().tearDown()
