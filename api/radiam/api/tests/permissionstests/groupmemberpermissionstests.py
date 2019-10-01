import json

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import (
    Project, User, GroupMember, GroupRole, ResearchGroup)
from radiam.api.views import GroupMemberViewSet, UserViewSet


class TestSuperuserGroupMemberPermissions(APITestCase):
    """
    Test Response codes for GroupMember endpoints for Superuser role
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_superuser_read_groupmember_list(self):
        """
        Test Superuser can read GroupMember list. Should be able to see
        all group memberships.
        """
        groupmember_count = GroupMember.objects.all().count()

        request = self.factory.get(reverse('groupmember-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], groupmember_count)

    def test_superuser_read_groupmember_detail(self):
        """
        Test Superuser can read GroupMember detail
        """
        # get a groupmember object. shouldn't matter which as superuser should
        # be able to view all
        detail_groupmember = GroupMember.objects.get(id='d246ea39-192a-4848-a003-493598f6f38e')

        request = self.factory.get(reverse('groupmember-detail',
                                           args=[detail_groupmember.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get':'retrieve'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_groupmember_list(self):
        """
        Test Superuser can write GroupMember list
        """

        group = ResearchGroup.objects.get(id='718aaa07-0891-4931-8c73-1304f4a21d0d')
        group_role = GroupRole.objects.get(id='bb7792ee-c7f6-4815-ae24-506fc00d3169')
        user = User.objects.get(username='testuser4')

        body = {
            'group': str(group.id),
            'group_role': str(group_role.id),
            'user': str(user.id),
            'is_active': True,
        }

        request = self.factory.post(
            reverse('groupmember-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_superuser_write_groupmember_detail(self):
        """
        Test Superuser can write GroupMember detail
        """

        detail_groupmember = GroupMember.objects.get(id='81656c95-3c0d-4ddd-8575-fdacacc5c21b')
        datamanager_role = GroupRole.objects.get(id='c4e21cc8-a446-4b38-9879-f2af71c227c3')

        body = {
            'group_role': str(datamanager_role.id)
        }

        request = self.factory.patch(
            reverse('groupmember-detail', args=[detail_groupmember.id]),
            json.dumps(body),
            content_type='application/json')

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_delete_groupmember(self):
        """
        Test that a Superuser can delete a group membership
        """
        detail_groupmember = GroupMember.objects.get(id='55cbb0f8-e19f-4ea0-a90e-37ed9ab250f0')

        request = self.factory.delete(
            reverse('groupmember-detail', args=[detail_groupmember.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text='',
            status_code=204)


class TestAdminuserGroupMemberPermissions(APITestCase):
    """
    Test Response codes for GroupMember endpoints for Admin user role
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_adminuser_read_groupmember_list(self):
        """
        Test Admin user can read GroupMember list
        """

        request = self.factory.get(reverse('groupmember-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_adminuser_read_groupmember_detail(self):
        """
        Test Admin user can read GroupMember detail for a user in a group
        that they admin.
        """
        # get a groupmember. it should not matter which one as admin
        detail_groupmember = GroupMember.objects.get(id='d246ea39-192a-4848-a003-493598f6f38e')

        request = self.factory.get(reverse('groupmember-detail',
                                           args=[detail_groupmember.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get':'retrieve'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_adminuser_write_groupmember_list(self):
        """
        Test Admin user can write GroupMember list, assigning to Groups that
        they admin.
        """

        group = ResearchGroup.objects.get(id='718aaa07-0891-4931-8c73-1304f4a21d0d')
        group_role = GroupRole.objects.get(id='bb7792ee-c7f6-4815-ae24-506fc00d3169')
        user = User.objects.get(username='testuser4')

        body = {
            'group': str(group.id),
            'group_role': str(group_role.id),
            'user': str(user.id),
            'is_active': True
        }

        request = self.factory.post(
            reverse('groupmember-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_adminuser_write_groupmember_detail(self):
        """
        Test Admin user can write GroupMember detail for a user in a group they
        admin
        """

        detail_groupmember = GroupMember.objects.get(id='81656c95-3c0d-4ddd-8575-fdacacc5c21b')
        datamanager_role = GroupRole.objects.get(id='c4e21cc8-a446-4b38-9879-f2af71c227c3')

        body = {
            'group_role': str(datamanager_role.id)
        }

        request = self.factory.patch(
            reverse('groupmember-detail', args=[detail_groupmember.id]),
            json.dumps(body),
            content_type='application/json')

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_adminuser_assign_groupmember_to_unauthorized_group(self):
        """
        Test that an admin user cannot re-assign a user to a group they do not admin.
        testuser1 should not have the ability to assign testuser3 to Test Project Group 2.
        """

        detail_groupmember = GroupMember.objects.get(id='81656c95-3c0d-4ddd-8575-fdacacc5c21b')
        researchgroup = ResearchGroup.objects.get(id='1cc80efd-83c6-488d-a722-73abdd4e5ce7')

        body = {
            'group': str(researchgroup.id)
        }

        request = self.factory.patch(
            reverse('groupmember-detail', args=[detail_groupmember.id]),
            json.dumps(body),
            content_type='application/json')

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=400)

    def test_admin_user_delete_groupmember(self):
        """
        Test that an Admin user can delete a group membership
        """
        detail_groupmember = GroupMember.objects.get(id='21e37f9a-886d-4ca0-822f-823c4fbcd66a')

        request = self.factory.delete(
            reverse('groupmember-detail', args=[detail_groupmember.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text='',
            status_code=204)

    def test_admin_user_delete_nongroupmember_denied(self):
        """
        Test that an Admin user cannot delete a group membership for a user
        in a group they do not admin.
        """
        detail_groupmember = GroupMember.objects.get(id='b56abbd6-34b4-4cbe-a88c-e44735318b09')

        request = self.factory.delete(
            reverse('groupmember-detail', args=[detail_groupmember.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text='',
            status_code=404)


class TestManageruserGroupMemberPermissions(APITestCase):
    """
    Test Response codes for GroupMember endpoints for DataManager user role
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser2')

    def test_manageruser_read_groupmember_list(self):
        """
        Test Manager user can read GroupMember list
        """
        groupmember_count = GroupMember.objects.filter(user=self.user).count()

        request = self.factory.get(reverse('groupmember-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], groupmember_count)

    def test_manageruser_read_groupmember_detail_denied(self):
        """
        Test Manager user cannot read GroupMember detail for a user in a group that they belong to.
        """
        # get a groupmember. it should not matter which one as admin
        detail_groupmember = GroupMember.objects.get(id='d246ea39-192a-4848-a003-493598f6f38e')

        request = self.factory.get(reverse('groupmember-detail',
                                           args=[detail_groupmember.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get':'retrieve'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=404)

    def test_manageruser_write_groupmember_list_denied(self):
        """
        Test Manager user cannot write GroupMember list
        """

        group = ResearchGroup.objects.get(id='718aaa07-0891-4931-8c73-1304f4a21d0d')
        group_role = GroupRole.objects.get(id='bb7792ee-c7f6-4815-ae24-506fc00d3169')
        user = User.objects.get(username='testuser2')

        body = {
            'group': str(group.id),
            'group_role': str(group_role.id),
            'user': str(user.id),
            'is_active': True
        }

        request = self.factory.post(
            reverse('groupmember-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manageruser_write_groupmember_detail_denied(self):
        """
        Test Manager user cannot write GroupMember detail
        """

        detail_groupmember = GroupMember.objects.get(id='81656c95-3c0d-4ddd-8575-fdacacc5c21b')
        datamanager_role = GroupRole.objects.get(id='c4e21cc8-a446-4b38-9879-f2af71c227c3')

        body = {
            'group_role': str(datamanager_role.id)
        }

        request = self.factory.patch(
            reverse('groupmember-detail', args=[detail_groupmember.id]),
            json.dumps(body),
            content_type='application/json')

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_manageruser_delete_groupmember_denied(self):
        """
        Test that a Manager user cannot delete a group membership
        """
        detail_groupmember = GroupMember.objects.get(id='81656c95-3c0d-4ddd-8575-fdacacc5c21b')

        request = self.factory.delete(
            reverse('groupmember-detail', args=[detail_groupmember.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text='',
            status_code=403)


class TestMemberuserGroupMemberPermissions(APITestCase):
    """
    Test Response codes for GroupMember endpoints for Member user role
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser3')

    def test_memberuser_read_groupmember_list(self):
        """
        Test Member user can read GroupMember list
        """

        request = self.factory.get(reverse('groupmember-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], 1)

    def test_memberuser_read_groupmember_detail_denied(self):
        """
        Test Member user cannot read GroupMember detail for a user in a group that they belong to.
        """

        detail_groupmember = GroupMember.objects.get(id='d246ea39-192a-4848-a003-493598f6f38e')

        request = self.factory.get(reverse('groupmember-detail',
                                           args=[detail_groupmember.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get':'retrieve'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=404)

    def test_memberuser_write_groupmember_list_denied(self):
        """
        Test Member user cannot write GroupMember list
        """

        group = ResearchGroup.objects.get(id='718aaa07-0891-4931-8c73-1304f4a21d0d')
        group_role = GroupRole.objects.get(id='bb7792ee-c7f6-4815-ae24-506fc00d3169')
        user = User.objects.get(username='testuser2')

        body = {
            'group': str(group.id),
            'group_role': str(group_role.id),
            'user': str(user.id),
            'is_active': True
        }

        request = self.factory.post(
            reverse('groupmember-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_memberuser_write_groupmember_detail_denied(self):
        """
        Test Member user cannot write GroupMember detail
        """

        detail_groupmember = GroupMember.objects.get(id='81656c95-3c0d-4ddd-8575-fdacacc5c21b')
        datamanager_role = GroupRole.objects.get(id='c4e21cc8-a446-4b38-9879-f2af71c227c3')

        body = {
            'group_role': str(datamanager_role.id)
        }

        request = self.factory.patch(
            reverse('groupmember-detail', args=[detail_groupmember.id]),
            json.dumps(body),
            content_type='application/json')

        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_memberuser_delete_groupmember_denied(self):
        """
        Test that a Member user cannot delete a group membership
        """
        detail_groupmember = GroupMember.objects.get(id='81656c95-3c0d-4ddd-8575-fdacacc5c21b')

        request = self.factory.delete(
            reverse('groupmember-detail', args=[detail_groupmember.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_groupmember.id)

        self.assertContains(
            response=response,
            text='',
            status_code=403)


class TestAllUsersGroupMember(APITestCase):
    """
    Test the extra business logic associated with 'All Users' table
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()

    def test_superuser_can_add_member_admin_group(self):
        """
        Test that a superuser can add members to 'Admin Group' group
        """
        self.user = User.objects.get(username='admin')

        group = ResearchGroup.objects.get(name='Admin Group')
        member_group_role = GroupRole.objects.get(id='bb7792ee-c7f6-4815-ae24-506fc00d3169')
        user = User.objects.get(username='testuser2')

        body = {
            'group': str(group.id),
            'group_role': str(member_group_role.id),
            'user': str(user.id),
            'is_active': True
        }

        request = self.factory.post(
            reverse('groupmember-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)


    def test_admin_user_cannot_add_member_admin_group(self):
        """
        Test that an admin user cannot add members to 'Admin Group' group
        """
        self.user = User.objects.get(username='testuser1')

        group = ResearchGroup.objects.get(name='Admin Group')
        member_group_role = GroupRole.objects.get(id='bb7792ee-c7f6-4815-ae24-506fc00d3169')
        user = User.objects.get(username='testuser2')

        body = {
            'group': reverse('researchgroup-detail', kwargs={'pk': group.id}),
            'group_role': reverse('grouprole-detail', kwargs={'pk': member_group_role.id}),
            'user': reverse('user-detail', kwargs={'pk': user.id}),
            'is_active': True
        }

        request = self.factory.post(
            reverse('groupmember-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=400)

    def test_manager_user_cannot_add_member_admin_group(self):
        """
        Test that an manager user cannot add members to 'Admin Group' group
        """
        self.user = User.objects.get(username='testuser2')

        group = ResearchGroup.objects.get(name='Admin Group')
        member_group_role = GroupRole.objects.get(id='bb7792ee-c7f6-4815-ae24-506fc00d3169')
        user = User.objects.get(username='testuser2')

        body = {
            'group': reverse('researchgroup-detail', kwargs={'pk': group.id}),
            'group_role': reverse('grouprole-detail', kwargs={'pk': member_group_role.id}),
            'user': reverse('user-detail', kwargs={'pk': user.id}),
            'is_active': True
        }

        request = self.factory.post(
            reverse('groupmember-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)

    def test_member_user_cannot_add_member_admin_group(self):
        """
        Test that an member user cannot add members to 'Admin Group' group
        """
        self.user = User.objects.get(username='testuser3')

        group = ResearchGroup.objects.get(name='Admin Group')
        member_group_role = GroupRole.objects.get(id='bb7792ee-c7f6-4815-ae24-506fc00d3169')
        user = User.objects.get(username='testuser2')

        body = {
            'group': reverse('researchgroup-detail', kwargs={'pk': group.id}),
            'group_role': reverse('grouprole-detail', kwargs={'pk': member_group_role.id}),
            'user': reverse('user-detail', kwargs={'pk': user.id}),
            'is_active': True
        }

        request = self.factory.post(
            reverse('groupmember-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=403)
