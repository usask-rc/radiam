import json

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from django.urls import reverse

from radiam.api.models import Project, User
from radiam.api.views import UserViewSet
from radiam.api.filters import RadiamAuthUserFilter

class TestSuperuserUserPermissions(APITestCase):
    """
    Test Response codes for user endpoints for various types of users
    """

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_superuser_read_user_list(self):
        """
        Test Superuser can read all system users at User list endpoint
        """
        total_user_count = User.objects.all().count()
        is_active = 'all'
        params = {
            'is_active': is_active
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request, is_active=True)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], total_user_count)

    def test_superuser_read_own_user_detail(self):
        """
        Test Superuser can read User detail
        """
        detail_user = User.objects.get(username='admin')

        request = self.factory.get(reverse('user-detail', args=[detail_user.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'retrieve'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_read_other_user_detail(self):
        """
        Test Superuser can read User detail
        """
        detail_user = User.objects.get(username='testuser1')

        request = self.factory.get(reverse('user-detail', args=[detail_user.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'retrieve'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_write_user(self):
        """
        Test Superuser can write the User list endpoint
        """
        body = {
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "email": "test.user@example.com",
            "is_active": True
        }

        request = self.factory.post(
            reverse('user-list'),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=201)

    def test_superuser_write_user_detail(self):
        """
        Test Superuser can write a User detail endpoint
        """
        detail_user = User.objects.get(username='admin')

        body = {
            "first_name": "Admin"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[detail_user.id]),
            json.dumps(body),
            content_type='application/json'
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'patch': 'partial_update'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_superuser_cannot_delete_self(self):
        """
        Test that a Superuser cannot delete themselves
        """

        detail_user = self.user

        request = self.factory.delete(
            reverse('user-detail', args=[detail_user.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=403)

class TestAdminuserUserPermissions(APITestCase):

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser1')

    def test_admin_user_read_user_list(self):
        """
        Test Admin user can read User list
        """

        request = self.factory.get(reverse('user-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        r = RadiamAuthUserFilter()
        authorized_users = r.filter_queryset(
            request,
            User.objects.all(),
            None
        )

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)
        self.assertEquals(response.data['count'], authorized_users.count())

    def test_admin_user_read_own_user_detail(self):
        """
        Test Admin user can read User detail
        """

        detail_user = User.objects.get(username='testuser1')

        request = self.factory.get(reverse('user-detail', args=[detail_user.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'retrieve'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_read_member_user_detail(self):
        """
        Test Admin user can read User detail from member of their group
        """

        detail_user = User.objects.get(username='testuser2')

        request = self.factory.get(reverse('user-detail', args=[detail_user.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'retrieve'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_admin_user_read_nonmember_user_detail_denied(self):
        """
        Test Admin user cannot read User detail
        """

        detail_user = User.objects.get(username='testuser4')

        request = self.factory.get(reverse('user-detail', args=[detail_user.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'retrieve'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text="",
            status_code=404)

    def test_admin_user_write_user_list(self):
        """
        Test Admin user can write the User list endpoint
        {ie: create new Users)
        """
        body = {
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "email": "test.user@example.com",
            "is_active": True,
            "time_zone_id": "GMT+6",
            "notes": "test. here are some notes about Test User"
        }

        request = self.factory.post(
            reverse('user-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'post': 'create'})(request)

        self.assertContains(response=response, text='', status_code=201)


    def test_admin_user_write_own_user_detail(self):
        """
        Test Admin user can write a User detail endpoint
        (ie: update an existing user)
        """

        detail_user = User.objects.get(username='testuser1')

        body = {
            "first_name": "UpdatedFirstName"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[detail_user.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=200)


    def test_admin_user_write_user_detail(self):
        """
        Test Admin user can write a User detail endpoint
        (ie: update an existing user)
        """
        detail_user = User.objects.get(username='testuser3')

        body = {
            "first_name": "UpdatedFirstName"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[detail_user.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=detail_user.id)

        actual = response.data

        self.assertContains(
            response=response,
            text='',
            status_code=200)

    def test_admin_user_cannot_delete_self(self):
        """
        Test that an Admin user cannot delete themselves
        """

        detail_user = self.user

        request = self.factory.delete(
            reverse('user-detail', args=[detail_user.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=403)

    def test_admin_user_cannot_delete_other_groupmember(self):
        """
        Test that an Admin user cannot delete another user
        """

        detail_user = User.objects.get(username='testuser3')

        request = self.factory.delete(
            reverse('user-detail', args=[detail_user.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=403)

class TestManageruserUserPermissions(APITestCase):

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser2')

    def test_manager_user_read_user_list(self):
        """
        Test manager user can read User list
        """
        request = self.factory.get(reverse('user-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_manager_user_read_own_user_detail(self):
        """
        Test manager user can read User detail
        """

        detail_user = User.objects.get(username='testuser2')

        request = self.factory.get(reverse('user-detail', args=[detail_user.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'retrieve'})(request, pk=detail_user.id)

        self.assertContains(response=response, text="", status_code=200)


    def test_manager_user_read_member_user_detail_denied(self):
        """
        Test manager user can read User detail
        """

        detail_user = User.objects.get(username='testuser3')

        request = self.factory.get(reverse('user-detail', args=[detail_user.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'retrieve'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text="",
            status_code=404)

    def test_manager_user_write_user_list_denied(self):
        """
        Test manager user cannot write the User list endpoint
        {ie: create new Users)
        """
        body = {
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "email": "test.user@example.com",
            "is_active": True,
            "time_zone_id": "GMT+6",
            "notes": "test. here are some notes about Test User"
        }

        request = self.factory.post(
            reverse('user-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'post': 'create'})(request)

        self.assertContains(response=response, text='', status_code=403)


    def test_manager_user_write_own_user_detail(self):
        """
        Test manager user can write own User detail
        (ie: update an existing user)
        """

        detail_user = User.objects.get(username='testuser2')

        body = {
            "first_name": "UpdatedFirstName"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[detail_user.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=200)


    def test_manager_user_write_other_user_detail_denied(self):
        """
        Test manager user cannot write a User detail
        (ie: update an existing user)
        """
        detail_user = User.objects.get(username='testuser1')

        body = {
            "first_name": "UpdatedFirstName"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[detail_user.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=404)

    def test_manager_user_cannot_delete_self(self):
        """
        Test that a Manager user cannot delete themselves
        """

        detail_user = self.user

        request = self.factory.delete(
            reverse('user-detail', args=[detail_user.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=403)

    def test_manager_user_cannot_delete_other_user(self):
        """
        Test that a Manager user cannot delete another user
        """

        detail_user = User.objects.get(username='testuser2')

        request = self.factory.delete(
            reverse('user-detail', args=[detail_user.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=403)


class TestMemberuserUserPermissions(APITestCase):

    fixtures = ['userpermissions']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='testuser3')

    def test_member_user_read_user_list(self):
        """
        Test member user can read User list
        """
        request = self.factory.get(reverse('user-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_member_user_read_own_user_detail(self):
        """
        Test member user can read own User detail
        """

        detail_user = User.objects.get(username='testuser3')

        request = self.factory.get(reverse('user-detail', args=[detail_user.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'retrieve'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text="",
            status_code=200)

    def test_member_user_read_other_user_detail_denied(self):
        """
        Test member user can read User detail
        """

        detail_user = User.objects.get(username='testuser2')

        request = self.factory.get(reverse('user-detail', args=[detail_user.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'retrieve'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text="",
            status_code=404)

    def test_member_user_write_user_list(self):
        """
        Test member user cannot write the User list
        {ie: create new Users)
        """
        body = {
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "email": "test.user@example.com",
            "is_active": True,
            "time_zone_id": "GMT+6",
            "notes": "test. here are some notes about Test User"
        }

        request = self.factory.post(
            reverse('user-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'post': 'create'})(request)

        self.assertContains(
            response=response,
            text='',
            status_code=403)

    def test_member_user_write_own_user_detail(self):
        """
        Test member user cann write own User detail
        (ie: update an existing user)
        """

        detail_user = User.objects.get(username='testuser3')

        body = {
            "first_name": "UpdatedFirstName"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[detail_user.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=200)

    def test_member_user_write_other_user_detail_denied(self):
        """
        Test member user cannot write a User detail endpoint
        (ie: update an existing user)
        """
        detail_user = User.objects.get(username='testuser2')

        body = {
            "first_name": "UpdatedFirstName"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[detail_user.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=404)

    def test_member_user_cannot_delete_self(self):
        """
        Test that a Member user cannot delete themselves
        """

        detail_user = self.user

        request = self.factory.delete(
            reverse('user-detail', args=[detail_user.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=403)

    def test_member_user_cannot_delete_other_user(self):
        """
        Test that a Member user cannot delete another user
        """

        detail_user = User.objects.get(username='testuser2')

        request = self.factory.delete(
            reverse('user-detail', args=[detail_user.id])
        )
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'delete': 'destroy'})(request, pk=detail_user.id)

        self.assertContains(
            response=response,
            text='',
            status_code=404)
