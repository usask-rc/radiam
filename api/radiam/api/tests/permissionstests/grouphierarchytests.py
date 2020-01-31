import json
from unittest import mock

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import (
    DistributionRestriction, DataCollectionStatus, Project, Dataset, User, GroupMember,
    GroupRole, GroupViewGrant, ResearchGroup
)
from radiam.api.views import (
    GroupMemberViewSet, GroupViewGrantViewSet, ResearchGroupViewSet,
    ProjectViewSet, DatasetViewSet
)

class TestGroupHierarchyPermissions(APITestCase):
    """
    Test group hierarchy functionality using a Group tree in the
    grouphierarchy data fixture.
    """

    fixtures = ['grouphierarchy']

    def setUp(self):
        self.factory = APIRequestFactory()

    def test_parent_user_is_admin_for_parent_group(self):

        parent_user = User.objects.get(username='parentuser1')
        admin_groups = parent_user.get_admin_groups().filter(name='Parent Group 1')

        self.assertTrue(admin_groups.count() == 1)

    def test_childuser1_is_member_in_child_group_1(self):

        parent_user = User.objects.get(username='childuser1')
        groups = parent_user.get_groups().filter(name='Child Group 1')

        self.assertTrue(groups.count() == 1)

    def test_childuser_2_is_member_in_child_group_2(self):

        parent_user = User.objects.get(username='childuser2')
        groups = parent_user.get_groups().filter(name='Child Group 2')

        self.assertTrue(groups.count() == 1)

    def test_parent_admin_user_can_view_child_group_hierarchy(self):
        """
        Test Parent Admin user can read entire group hierarchy
        """
        parent_user = User.objects.get(username='parentuser1')

        request = self.factory.get(reverse('researchgroup-list'))
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)
        result_str = str(response.data['results'])

        self.assertContains(
            response=response,
            text="",
            status_code=200
        )
        self.assertIn('Parent Group 1', result_str)
        self.assertIn('Child Group 1', result_str)
        self.assertIn('Child Group 2', result_str)
        self.assertIn('Grandchild Group 1', result_str)

    def test_child_admin_user_can_view_child_group_hierarchy(self):
        """
        Test Child Admin user can read child group hierarchy
        """
        child_user = User.objects.get(username='childuser1')

        request = self.factory.get(reverse('researchgroup-list'))
        request.user = child_user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)
        result_str = str(response.data['results'])

        self.assertContains(
            response=response,
            text="",
            status_code=200
        )
        self.assertNotIn('Parent Group 1', result_str)
        self.assertIn('Child Group 1', result_str)
        self.assertNotIn('Child Group 2', result_str)
        self.assertIn('Grandchild Group 1', result_str)

    def test_grandchild_admin_user_can_view_grandchild_group(self):
        """
        Test Grandchild Admin user can only read grandchild node
        """
        child_user = User.objects.get(username='gchilduser1')

        request = self.factory.get(reverse('researchgroup-list'))
        request.user = child_user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)
        result_str = str(response.data['results'])

        self.assertContains(
            response=response,
            text="",
            status_code=200
        )
        self.assertNotIn('Parent Group 1', result_str)
        self.assertNotIn('Child Group 1', result_str)
        self.assertNotIn('Child Group 2', result_str)
        self.assertIn('Grandchild Group 1', result_str)

    def test_parent_admin_user_can_create_child_group(self):
        """
        Test Parent Admin user can create a child group of Parent Group
        """
        parent_user = User.objects.get(username='parentuser1')
        parent_group = ResearchGroup.objects.get(name="Parent Group 1")

        body = {
            "name": "Test Child Group",
            "description": "A Test Child of Parent Group",
            "parent_group": str(parent_group.id)
        }

        request = self.factory.post(
            reverse('researchgroup-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_parent_admin_user_can_create_grandchild_group(self):
        """
        Test Parent Admin user can create a child group of Child Group
        (Grandchild Group)
        """
        parent_user = User.objects.get(username='parentuser1')
        parent_group = ResearchGroup.objects.get(name="Child Group 1")

        body = {
            "name": "Test Grand Child Group",
            "description": "A Test Child of Child Group",
            "parent_group": str(parent_group.id)
        }

        request = self.factory.post(
            reverse('researchgroup-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_parent_admin_user_can_edit_child_group(self):
        """
        Test that an admin user of a parent group can edit a child Group
        """
        parent_user = User.objects.get(username='parentuser1')
        child_group = ResearchGroup.objects.get(name="Child Group 1")

        body = {
            "description": "updated description",
        }

        request = self.factory.patch(reverse('researchgroup-detail', args=[child_group.id]))
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'patch': 'partial_update'})(request, pk=child_group.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_parent_admin_user_can_view_child_group_members(self):
        """
        Test that a parent group admin can view the members of the child groups.
        Check that known groupmember ID's exist in the output.
        """
        parent_user = User.objects.get(username='parentuser1')

        # known Memberships of child members
        child1group1 = GroupMember.objects.get(
            user__username='childuser1',
            group__name='Child Group 1')

        request = self.factory.get(reverse('groupmember-list'))
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)
        result_str = str(response.data['results'])

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertIn(str(child1group1.id), result_str)

    def test_parent_admin_user_can_create_child_group_members(self):
        """
        Test that a parent group admin can create members in a child group.
        """
        parent_user = User.objects.get(username='parentuser1')

        child_group = ResearchGroup.objects.get(name="Child Group 1")
        group_role = GroupRole.objects.get(id='bb7792ee-c7f6-4815-ae24-506fc00d3169')
        user = User.objects.get(username='testuser2')

        body = {
            'group': str(child_group.id),
            'group_role': str(group_role.id),
            'user': str(user.id),
            'is_active': True,
        }

        request = self.factory.post(
            reverse('groupmember-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_parent_admin_user_can_edit_child_group_members(self):
        """
        Test that a parent user can edit a group membership for a child group
        """
        parent_user = User.objects.get(username='parentuser1')

        detail_groupmember = GroupMember.objects.get(id='d01fdd40-dec2-4016-a673-afd7e4c26354')
        datamanager_role = GroupRole.objects.get(id='c4e21cc8-a446-4b38-9879-f2af71c227c3')

        body = {
            'group_role': str(datamanager_role.id)
        }

        request = self.factory.patch(
            reverse('groupmember-detail', args=[detail_groupmember.id]),
            json.dumps(body),
            content_type='application/json')

        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    @mock.patch("radiam.api.models.Project._save_metadata_doc")
    def test_parent_admin_user_can_view_child_projects(self, m):
        """
        Test parent user can view projects with child groups assigned
        """
        parent_user = User.objects.get(username='parentuser1')

        request = self.factory.get(reverse('project-list'))
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)
        result_str = str(response.data['results'])

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertIn("child group 1 project 1", result_str)
        self.assertIn("grandchild group 1 project 1", result_str)

    @mock.patch("radiam.api.models.Project._save_metadata_doc")
    @mock.patch("radiam.api.views.ProjectViewSet.MetadataDoc")
    def test_parent_admin_user_can_create_child_projects(self, m, doc):
        """
        Test that a parent user can create a new project assigning a
        child group.
        """
        doc.get.return_value = doc
        doc.update.return_value = None

        parent_user = User.objects.get(username='parentuser1')

        research_group = ResearchGroup.objects.get(name='Child Group 1')
        primary_contact_user = User.objects.get(username='childuser1')

        body = {
            'name': 'test project with child group',
            'group': str(research_group.id),
            'number': 'PRJ-93342',
            'primary_contact_user': str(primary_contact_user.id),
            'avatar': None
        }

        request = self.factory.post(
            reverse('project-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    @mock.patch("radiam.api.models.Project._save_metadata_doc")
    def test_parent_admin_user_can_edit_child_projects(self, m):
        """
        Test that a parent user can edit a project that has a child group
        assigned.
        """
        parent_user = User.objects.get(username='parentuser1')

        detail_project = Project.objects.get(name='child group 1 project')

        body = {
            "name": "child group 1 project name changed"
        }

        request = self.factory.patch(
            reverse('project-detail', args=[detail_project.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_project.id)

        self.assertContains(
            response=response,
            text="child group 1 project name changed",
            status_code=200)

    def test_parent_admin_can_view_viewgrants_for_child_group(self):
        """
        Test that a parent user can view viewgrants for child groups
        """
        parent_user = User.objects.get(username='parentuser1')

        parent_group_viewgrant_id = 'efa502ac-a06a-458e-8f3b-4fe85e1ffd3d'
        child_group_viewgrant_id = '07398deb-2746-447b-a9b9-1dd085aa4df0'
        grandchild_group_viewgrant_id = 'c31cf6dc-6b33-433e-bf7d-00d69d1897ff'

        request = self.factory.get(reverse('groupviewgrant-list'))
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)
        result_str = str(response.data['results'])

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertIn(parent_group_viewgrant_id, result_str)
        self.assertIn(child_group_viewgrant_id, result_str)
        self.assertIn(grandchild_group_viewgrant_id, result_str)

    def test_parent_admin_can_create_viewgrants_for_child_group(self):
        """
        Test that a parent user can create a new viewgrant for a child group
        """
        parent_user = User.objects.get(username='parentuser1')

        researchgroup = ResearchGroup.objects.get(name='Child Group 1')
        dataset = Dataset.objects.get(title='Dataset for child group 1')

        body = {
            'group': str(researchgroup.id),
            'dataset': str(dataset.id),
            'fields': 'some test fields'
        }

        request = self.factory.post(
            reverse('groupviewgrant-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_parent_admin_can_create_viewgrants_for_grandchild_group(self):
        """
        Test that a parent user can create a new viewgrant for a child group
        """
        parent_user = User.objects.get(username='parentuser1')

        researchgroup = ResearchGroup.objects.get(name='Grandchild Group 1')
        dataset = Dataset.objects.get(title='Grandchild Group 1 Dataset')

        body = {
            'group': str(researchgroup.id),
            'dataset': str(dataset.id),
            'fields': 'some test fields'
        }

        request = self.factory.post(
            reverse('groupviewgrant-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_parent_admin_can_edit_viewgrants_for_child_group(self):
        """
        Test that a parent user can modify an existing viewgrant for a child
        group
        """
        parent_user = User.objects.get(username='parentuser1')

        child_groupviewgrant = GroupViewGrant.objects.get(id='07398deb-2746-447b-a9b9-1dd085aa4df0')

        body = {
            'fields': 'newfields',
        }

        request = self.factory.patch(
            reverse('groupviewgrant-detail', args=[child_groupviewgrant.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'patch': 'partial_update'})(request, pk=child_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_parent_admin_can_edit_viewgrants_for_grandchild_group(self):
        """
        Test that a parent user can modify an existing viewgrant for a child
        group
        """
        parent_user = User.objects.get(username='parentuser1')

        child_groupviewgrant = GroupViewGrant.objects.get(id='c31cf6dc-6b33-433e-bf7d-00d69d1897ff')

        body = {
            'fields': 'newfields',
        }

        request = self.factory.patch(
            reverse('groupviewgrant-detail', args=[child_groupviewgrant.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'patch': 'partial_update'})(request, pk=child_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_child_admin_can_view_viewgrants_for_child_group(self):
        """
        Test that a child user can view viewgrants for child groups but not
        parent group
        """
        parent_user = User.objects.get(username='childuser1')

        parent_group_viewgrant_id = 'efa502ac-a06a-458e-8f3b-4fe85e1ffd3d'
        child_group_viewgrant_id = '07398deb-2746-447b-a9b9-1dd085aa4df0'
        grandchild_group_viewgrant_id = 'c31cf6dc-6b33-433e-bf7d-00d69d1897ff'

        request = self.factory.get(reverse('groupviewgrant-list'))
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)
        result_str = str(response.data['results'])

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertNotIn(parent_group_viewgrant_id, result_str)
        self.assertIn(child_group_viewgrant_id, result_str)
        self.assertIn(grandchild_group_viewgrant_id, result_str)

    def test_child_admin_cannot_create_viewgrants_for_parent_group(self):
        """
        Test that a child admin user cannot create a new viewgrant for the
        parent group
        """
        parent_user = User.objects.get(username='childuser1')

        researchgroup = ResearchGroup.objects.get(name='Parent Group 1')
        dataset = Dataset.objects.get(title='Parent Group Dataset')

        body = {
            'group': reverse('researchgroup-detail', kwargs={'pk': researchgroup.id}),
            'dataset': reverse('dataset-detail', kwargs={'pk': dataset.id}),
            'fields': 'some test fields'
        }

        request = self.factory.post(
            reverse('groupviewgrant-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=400)

    def test_child_admin_cannot_edit_viewgrants_for_parent_group(self):
        """
        Test that a parent user can modify an existing viewgrant for a child
        group
        """
        parent_user = User.objects.get(username='childuser1')

        child_groupviewgrant = GroupViewGrant.objects.get(id='efa502ac-a06a-458e-8f3b-4fe85e1ffd3d')

        body = {
            'fields': 'newfields',
        }

        request = self.factory.patch(
            reverse('groupviewgrant-detail', args=[child_groupviewgrant.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = parent_user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'patch': 'partial_update'})(request, pk=child_groupviewgrant.id)

        self.assertContains(
            response=response,
            text="",
            status_code=404)

