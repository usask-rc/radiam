import json
from unittest import mock

from elasticsearch import exceptions as es_exceptions

from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from elasticsearch_dsl import Search

from django.urls import reverse

from radiam.api.models import (
    User, ResearchGroup, Project, Dataset )
from radiam.api.documents import ProjectMetadataDoc
from radiam.api.views import ProjectViewSet, ProjectSearchViewSet
from .elasticsearch.basesearchtestcase import BaseSearchTestCase
from .elasticsearch.testdata import *

from radiam.api.search import _SearchService, _IndexService

class TestProjectAPI(BaseSearchTestCase):
    fixtures = ['researchgroups',
                'searchtest',
                'distributionrestriction',
                'datacollectionstatus',
                'userpermissions']

    def setUp(self):
        super().setUp()
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_project_list(self):
        """
        Test that the project list is not empty.
        """
        request = self.factory.get(reverse('project-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)
        self.assertEqual(response.status_code, 200)
        self.assertLess(0, response.data['count'])

    @mock.patch("radiam.api.models.Project._save_metadata_doc")
    @mock.patch("radiam.api.views.ProjectViewSet.MetadataDoc")
    def test_project_create(self, mock_save_metadata_doc, doc):
        """
        Test that a new project is created with corresponding ES index,
        and ProjectMetadataDoc
        """
        doc.get.return_value = doc
        doc.update.return_value = None

        research_group = ResearchGroup.objects.get(id='23e69896-c60a-4e6c-a444-ba906ada91fb')

        body = {
            'name': 'test project',
            'group': str(research_group.id),
            'number': 'P8343422-4J',
            'primary_contact_user': str(self.user.id),
            'avatar': None
        }

        request = self.factory.post(
            reverse('project-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'post':'create'})(request)

        # Do all the project fields exist?
        self.assertContains(response=response, text='', status_code=201)
        self.assertIn('name', response.data)
        self.assertIn('number', response.data)
        self.assertIn('primary_contact_user', response.data)
        self.assertIn('date_created', response.data)
        self.assertIn('date_updated', response.data)

        # Does a corresponding Elasticsearch index exist?
        self.assertTrue(self.indexservice.index_exists(response.data['id']))

    def test_project_exists(self):
        """
        Test that a project detail returns a project.
        """
        testproject = Project.objects.get(name='searchtest')
        testproject_id = str(testproject.id)

        request = self.factory.get(reverse(
            'project-detail',
            args=['project_id']))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'get': 'retrieve'})(request, pk=testproject_id)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data)

    def test_nonexistent_project_fails(self):
        """
        Test that a project detail returns a project.
        """
        request = self.factory.get(reverse(
            'project-detail',
            args=['project_id']))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view(
            {'get': 'retrieve'})(request, pk='not-a-valid-uuid')

        self.assertContains(
            response=response,
            text='Not found',
            status_code=404)

    @mock.patch("radiam.api.models.Project._delete_metadata_doc")
    def test_project_delete(self, mock_delete_metadata_doc):
        """
        Test that deleting a project removes the model as well as the ES index
        """

        testproject = Project.objects.get(name='searchtest')
        testproject_id = str(testproject.id)

        # begin test
        request = self.factory.delete(reverse(
            'project-detail',
            args=[testproject_id]),
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        if not self.indexservice.index_exists(testproject_id):
            self.fail('Index to delete does not exist')

        response = ProjectViewSet.as_view(
            {'delete': 'destroy'})(request, pk=testproject_id)

        # self.assertFalse(self.indexservice.index_exists(testproject_id))
        self.assertContains(
            response=response,
            text='',
            status_code=204)
        self.assertFalse(self.indexservice.index_exists(testproject_id))
        mock_delete_metadata_doc.assert_called_once()

    @mock.patch("radiam.api.models.Project._save_metadata_doc")
    def test_project_update_name(self, mock_save_metadata_doc):
        """
        Test updating a project name
        """

        detail_project = Project.objects.get(name='project 1')
        updated_name = "project 1 name updated"

        body = {
            "name": updated_name
        }

        request = self.factory.patch(
            reverse('project-detail', args=[str(detail_project.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response = response,
            text = updated_name,
            status_code = 200)
        self.assertEquals(response.data['name'], updated_name)
        mock_save_metadata_doc.assert_called_once()

    @mock.patch("radiam.api.models.Project._save_metadata_doc")
    def test_project_update_group(self, mock_save_metadata_doc):
        """
        Test updating a project group
        """

        detail_project = Project.objects.get(name='project 1')
        group = ResearchGroup.objects.get(name='Test Research Group 2')

        body = {
            "group": str(group.id)
        }

        request = self.factory.patch(
            reverse('project-detail', args=[str(detail_project.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response = response,
            text = group.id,
            status_code = 200)
        self.assertEquals(group.id, response.data['group'])
        mock_save_metadata_doc.assert_called_once()

    @mock.patch("radiam.api.models.Project._save_metadata_doc")
    def test_project_update_number(self, mock_save_metadata_doc):
        """
        Test updating a project number
        """

        detail_project = Project.objects.get(name='project 1')
        updated_number = "P994A"

        body = {
            "number": updated_number
        }

        request = self.factory.patch(
            reverse('project-detail', args=[str(detail_project.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response = response,
            text = updated_number,
            status_code = 200)
        self.assertEquals(response.data['number'], updated_number)
        mock_save_metadata_doc.assert_called_once()

    @mock.patch("radiam.api.models.Project._save_metadata_doc")
    def test_project_update_keywords(self, mock_save_metadata_doc):
        """
        Test updating a project keywords
        """

        detail_project = Project.objects.get(name='project 1')
        updated_keywords = "project updated keywords"

        body = {
            "keywords": updated_keywords
        }

        request = self.factory.patch(
            reverse('project-detail', args=[str(detail_project.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response = response,
            text = updated_keywords,
            status_code = 200)
        self.assertEquals(response.data['keywords'], updated_keywords)
        mock_save_metadata_doc.assert_called_once()

    @mock.patch("radiam.api.models.Project._save_metadata_doc")
    def test_project_update_primary_contact_user(self, mock_save_metadata_doc):
        """
        Test updating a project primary contact user
        """

        detail_project = Project.objects.get(name='project 1')
        updated_primary_contact_user = User.objects.get(username='testuser1')

        body = {
            "primary_contact_user": str(updated_primary_contact_user.id)
        }

        request = self.factory.patch(
            reverse('project-detail', args=[str(detail_project.id)]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response = response,
            text = updated_primary_contact_user.id,
            status_code = 200)
        # self.assertEquals(response.data['primary_contact_user'], str(updated_primary_contact_user))
        mock_save_metadata_doc.assert_called_once()

    def test_project_doc_list(self):
        """
        Test /docs endpoint for a given project
        """
        testproject = Project.objects.get(name='searchtest')
        testproject_id = str(testproject.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        request = self.factory.get(reverse(
            'project-detail',
            args=['project_id']))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSearchViewSet.as_view(
            {'get': 'list'})(request, project_id=testproject_id)

        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.data['hits']['total'], 0)

    def test_project_doc_detail(self):
        """
        Test /docs endpoint for a given doc id
        """
        testproject = Project.objects.get(name='searchtest')
        testproject_id = str(testproject.id)

        self.index_test_docs(TEST_DATA_MULTIPLE_DOCS)

        # need to grab the id of a document before we can try to retrieve by it.
        search = Search(index=self.TEST_INDEX_ID)
        self.searchservice = _SearchService(search)
        self.searchservice.add_match('name', 'Hotproc.png')
        result = self.searchservice.execute()

        if result.hits.total != 1:
            self.fail('Search should not have returned more than one result')
        else:
            doc_id =  result.hits[0].meta['id']

        # begin test
        request = self.factory.get(reverse(
            'project-detail',
            args=['project_id', 'pk']),
            )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectSearchViewSet.as_view(
            {'get': 'retrieve'})(request, project_id=testproject_id, pk=doc_id)

        self.assertContains(
            response=response,
            text='Hotproc.png',
            status_code=200)

    @mock.patch("radiam.api.models.ProjectMetadataDoc.get")
    def test_save_metadata_doc_update(self, mock_project_metadata_doc_get):
        """
        Test that _save_metadata_doc updates an existing
        ProjectMetadataDoc.
        """
        mock_project_metadata_doc = mock.MagicMock(spec=ProjectMetadataDoc)
        mock_project_metadata_doc_get.return_value = mock_project_metadata_doc

        id = '094ee941-3c2b-4e73-953b-85cf1585dab5'
        project = Project.objects.get(id=id)

        project._save_metadata_doc()

        mock_project_metadata_doc_get.assert_called_once()
        mock_project_metadata_doc.update.assert_called_once_with(
            name=project.name,
            group=project.group.name,
            date_created=project.date_created,
            date_updated=project.date_updated,
            keywords=project.keywords
        )

    @mock.patch("radiam.api.models.ProjectMetadataDoc.save")
    @mock.patch("radiam.api.models.ProjectMetadataDoc.get")
    def test_save_metadata_doc_create(self, mock_get, mock_save):
        """
        Test _save_metadata_doc creates a new ProjectMetadataDoc objects
        """
        mock_get.side_effect = es_exceptions.NotFoundError

        id = '094ee941-3c2b-4e73-953b-85cf1585dab5'
        project = Project.objects.get(id=id)
        project._save_metadata_doc()

        mock_get.assert_called_once()
        mock_save.assert_called_once()
