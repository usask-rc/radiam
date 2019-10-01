import unittest
import json
import logging

from django.test import TestCase
from rest_framework.test import APIRequestFactory, APIClient, APITestCase
from rest_framework.test import force_authenticate

from django.contrib.auth.models import AnonymousUser
from django.urls import reverse, reverse_lazy, resolve
from django.core.exceptions import ObjectDoesNotExist

from radiam.api.models import User, Project, ResearchGroup
from radiam.api.views import UserViewSet


class TestUserAPI(APITestCase):
    fixtures = ['users']

    def setUp(self):
        self.factory = APIRequestFactory()
        # self.user = User.objects.get(username='bobrobb')
        self.user = User.objects.get(username='admin')

    def test_anonymous_user_access_denied(self):
        """
        Anonymous user should be denied access. Is there a better way to test
        this globally (not just for the user endpoint)?
        """
        request = self.factory.get(reverse('user-list'))
        request.user = AnonymousUser()
        force_authenticate(request, user=request.user)

        # response = UserViewSet.as_view({'put': 'create'})(request)
        # self.assertEqual(response.status_code, 403)

        response = UserViewSet.as_view({'get': 'list'})(request)
        self.assertEqual(response.status_code, 403)

    def test_list_users(self):
        request = self.factory.get(reverse('user-list'))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)
        self.assertEqual(response.status_code, 200)

    """
    Create
    """
    def test_create_invalid_user_no_username(self):
        """
        Test Failure of User create with no username
        """
        body = {
            "nothing": "nothing"
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
            text="This field is required",
            status_code=400)

    def test_create_user(self):
        """
        Create user with all input fields
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

        actual = response.data

        # Status 'Created'
        self.assertEqual(response.status_code, 201)

        # Do all the fields exist?
        self.assertIn('username', actual)
        self.assertIn('first_name', actual)
        self.assertIn('last_name', actual)
        self.assertIn('email', actual)
        self.assertIn('is_active', actual)
        self.assertIn('time_zone_id', actual)
        self.assertIn('date_created', actual)
        self.assertIn('date_updated', actual)
        self.assertIn('notes', actual)

        # Do the values contain the expected data?
        # self.assertIn('/users/testuser', actual['url'])
        self.assertEqual('testuser', actual['username'])
        self.assertTrue(actual['is_active'])
        self.assertIsNotNone(actual['date_created'])
        self.assertIsNotNone(actual['date_updated'])

    def test_create_user_minimum_input(self):
        """
        Create User with bare minimum input
        """

        body = {
            "username": "user",
        }

        request = self.factory.post(
            reverse('user-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'post': 'create'})(request)

        actual = response.data

        # Status 'Created'
        self.assertEqual(response.status_code, 201)

        # Do all the fields exist?
        self.assertIn('username', actual)
        self.assertIn('first_name', actual)
        self.assertIn('last_name', actual)
        self.assertIn('email', actual)
        self.assertIn('is_active', actual)
        self.assertIn('time_zone_id', actual)
        self.assertIn('date_created', actual)
        self.assertIn('date_updated', actual)
        self.assertIn('notes', actual)

        # Do the values contain the expected data?
        # self.assertIn('user', actual['url'])
        self.assertEqual('user', actual['username'])
        self.assertTrue(actual['is_active'])
        self.assertIsNotNone(actual['date_created'])
        self.assertIsNotNone(actual['date_updated'])

    def test_create_user_that_exists(self):
        """
        Try to create a user that already exists.
        'bob' should already exist in our 'api' fixtures
        """

        body = {
            "username": "bobrobb",
            "first_name": "Bob",
            "last_name": "Robb",
            "email": "bob.robb@example.com",
            "is_active": True,
            "time_zone_id": "GMT+6",
            "notes": "test. here are some notes about Bob Robb"
        }

        request = self.factory.post(
            reverse('user-list'),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'post': 'create'})(request)

        actual = response.data

        # Should return '400'
        self.assertContains(
            response=response,
            text="A user with that username already exists.",
            status_code=400)

    def test_create_user_inactive(self):
        """
        Create user with all input fields
        """

        body = {
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "email": "test.user@example.com",
            "is_active": False,
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

        actual = response.data

        # Status 'Created'
        self.assertEqual(response.status_code, 201)

        # Do all the fields exist?
        self.assertIn('username', actual)
        self.assertIn('first_name', actual)
        self.assertIn('last_name', actual)
        self.assertIn('email', actual)
        self.assertIn('is_active', actual)
        self.assertIn('time_zone_id', actual)
        self.assertIn('date_created', actual)
        self.assertIn('date_updated', actual)
        self.assertIn('notes', actual)

        # Do the values contain the expected data?
        # self.assertIn('/users/testuser', actual['url'])
        self.assertEqual('testuser', actual['username'])
        self.assertFalse(actual['is_active'])
        self.assertIsNotNone(actual['date_created'])
        self.assertIsNotNone(actual['date_updated'])


    """
    Update
    """
    def test_update_user_firstname(self):
        """
        Update the first_name user field using 'bob' (pk=3 in fixtures)
        """
        bob = User.objects.get(username='bobrobb')

        body = {
            "first_name": "UpdatedRobby"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[bob.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=bob.id)

        actual = response.data

        self.assertContains(
            response=response,
            text='UpdatedRob',
            status_code=200)
        self.assertNotEqual(bob.first_name, actual['first_name'])
        self.assertEqual("UpdatedRobby", actual['first_name'])
        self.assertNotEqual(actual['date_created'], actual['date_updated'])

    def test_update_user_lastname(self):
        """
        Update the last_name user field using 'bob' (pk=3 in fixtures)
        """
        bob = User.objects.get(username='bobrobb')

        body = {
            "last_name": "UpdatedRobb"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[bob.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=bob.id)

        actual = response.data

        self.assertContains(
            response=response,
            text='UpdatedRobb',
            status_code=200)
        self.assertNotEqual(bob.last_name, actual['last_name'])
        self.assertEqual("UpdatedRobb", actual['last_name'])
        self.assertNotEqual(actual['date_created'], actual['date_updated'])

    def test_update_user_email(self):
        """
        Try updating the email field using 'bob' (pk=3 in fixtures)
        """
        bob = User.objects.get(username='bobrobb')

        body = {
            "email": "bob.update@example.com"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[bob.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=bob.id)

        actual = response.data

        self.assertContains(
            response=response,
            text='bob.update@example.com',
            status_code=200)
        self.assertNotEqual(bob.email, actual['email'])
        self.assertEqual("bob.update@example.com", actual['email'])
        self.assertNotEqual(actual['date_created'], actual['date_updated'])

    def test_update_user_is_active_true(self):
        """
        Try updating the is_active field to True
        """
        bob = User.objects.get(username='bobrobb')

        body = {
            "is_active": True
        }

        request = self.factory.patch(
            reverse('user-detail', args=[bob.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=bob.id)

        actual = response.data

        self.assertContains(response=response, text="", status_code=200)
        self.assertEqual(True, actual['is_active'])
        self.assertNotEqual(actual['date_created'], actual['date_updated'])

    def test_update_user_is_active_false(self):
        """
        Try updating the is_active field to False
        """
        bob = User.objects.get(username='bobrobb')

        body = {
            "is_active": False
        }

        request = self.factory.patch(
            reverse('user-detail', args=[bob.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=bob.id)

        actual = response.data

        self.assertContains(response=response, text="", status_code=200)
        self.assertEqual(False, actual['is_active'])
        self.assertNotEqual(actual['date_created'], actual['date_updated'])

    def test_update_timezone_id(self):
        """
        Try updating the email field using 'bob' (pk=3 in fixtures)
        """
        bob = User.objects.get(username='bobrobb')

        body = {
            "time_zone_id": "GMT+6"
        }

        request = self.factory.patch(
            reverse('user-detail', args=[bob.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=bob.id)

        actual = response.data

        self.assertContains(response=response, text="", status_code=200)
        self.assertEqual("GMT+6", actual['time_zone_id'])
        self.assertNotEqual(actual['date_created'], actual['date_updated'])

    def test_update_notes(self):
        """
        Try updating the email field using 'bob' (pk=3 in fixtures)
        """
        bob = User.objects.get(username='bobrobb')

        note = "here are some test notes for bob"
        body = {
            "notes": note
        }

        request = self.factory.patch(
            reverse('user-detail', args=[bob.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=bob.id)

        actual = response.data

        self.assertContains(response=response, text=note, status_code=200)
        self.assertEqual(note, actual['notes'])
        self.assertNotEqual(actual['date_created'], actual['date_updated'])

    """
    Delete
    """
    def test_user_delete(self):
        """
        Test Delete existing user 'bob' (pk=3 in fixtures)
        """
        bob = User.objects.get(username='bobrobb')

        request = self.factory.delete(reverse('user-detail', args=[bob.id]))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'delete': 'destroy'})(request, pk=bob.id)

        actual = response.data

        # Django returns 204 if content was successfully deleted, 404 otherwise
        self.assertContains(response=response, text="", status_code=204)

    def test_delete_invalid_user(self):
        """
        Test Delete non existent user 'greg'
        """
        request = self.factory.delete(reverse('user-detail', args=['greg']))
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'delete': 'destroy'})(request, pk='not-a-valid-uuid')

        actual = response.data

        # Django returns 204 if content was successfully deleted, 404 otherwise
        self.assertContains(response=response, text="", status_code=404)

    def test_filter_fields_username(self):
        """
        Test the filter_fields values username
        """
        username = 'bobrobb'
        params = {
            'username': username
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=username, status_code=200)
        self.assertEquals(response.data['count'], 1)

    def test_filter_fields_first_name(self):
        """
        Test the filter_fields values first_name
        """
        first_name = 'Bobb'
        params = {
            'first_name': first_name
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=first_name, status_code=200)
        self.assertEquals(response.data['results'][0]['first_name'], first_name)
        self.assertEquals(response.data['count'], 1)

    def test_filter_fields_last_name(self):
        """
        Test the filter_fields values last_name
        """
        last_name = 'Robb'
        params = {
            'last_name': last_name
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=last_name, status_code=200)
        self.assertEquals(response.data['results'][0]['last_name'], last_name)
        self.assertEquals(response.data['count'], 1)


    def test_filter_fields_id(self):
        """
        Test the filter_fields values id
        """
        id = 'b9d7096b-c1df-4a94-bab8-fc2489b86710'
        params = {
            'id': id
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=id, status_code=200)
        self.assertEquals(response.data['results'][0]['id'], id)
        self.assertEquals(response.data['count'], 1)

    def test_filter_fields_email(self):
        """
        Test the filter_fields values email
        """
        email = 'bob.robb@example.com'
        params = {
            'email': email
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text=email, status_code=200)
        self.assertEquals(response.data['results'][0]['email'], email)
        self.assertEquals(response.data['count'], 1)

    def test_superuser_can_toggle_is_superuser(self):
        """
        Test that the superuser can toggle 'is_superuser' on another user
        """

        adminuser = User.objects.get(username='admin')
        testuser = User.objects.get(username='bobrobb')

        if testuser.is_superuser:
            self.fail("testuser should initially not be superuser")

        body = {
            "is_superuser": True
        }

        request = self.factory.patch(
            reverse('user-detail', args=[testuser.id]),
            json.dumps(body),
            content_type='application/json')
        request.user = adminuser
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view(
            {'patch': 'partial_update'})(request, pk=testuser.id)

        resp = response.data

        self.assertContains(response=response, text="", status_code=200)
        self.assertEqual(True, resp['is_superuser'])
        self.assertNotEqual(resp['date_created'], resp['date_updated'])

    # def test_user_cannot_toggle_is_superuser(self):
    #     """
    #     Test that the testuser cannot toggle 'is_superuser' on themselves
    #     """
    #
    #     testuser = User.objects.get(username='bobrobb')
    #
    #     if testuser.is_superuser:
    #         self.fail("testuser should initially not be superuser")
    #
    #     body = {
    #         "is_superuser": True
    #     }
    #
    #     request = self.factory.patch(
    #         reverse('user-detail', args=[testuser.id]),
    #         json.dumps(body),
    #         content_type='application/json')
    #     request.user = testuser
    #
    #     response = UserViewSet.as_view(
    #         {'patch': 'partial_update'})(request, pk=testuser.id)
    #
    #     resp = response.data
    #
    #     self.assertContains(response=response, text="", status_code=200)
    #     self.assertEqual(False, resp['is_superuser'])
    #     self.assertNotEqual(resp['date_created'], resp['date_updated'])

    def test_user_set_password(self):
        """
        Test that user can set their own password
        """

        user = User.objects.get(username='bobrobb')

        old_password = "bobrobb" #known old password
        new_password = "testpassword"
        confirm_password = "testpassword"

        if not user.check_password(old_password):
            self.fail('Unexpected old_password. Check fixtures.')

        body = {
            'old_password': old_password,
            'new_password': new_password,
            'confirm_password': confirm_password
        }

        request_user = User.objects.get(username='bobrobb')
        self.client.login(username='bobrobb', password='bobrobb')
        self.client.force_authenticate(user=request_user)

        url = reverse('user-set-password', args=[user.id])

        response = self.client.post(
            url,
            json.dumps(body),
            content_type='application/json'
        )

        #retrieve the user again with new password
        user = User.objects.get(username='bobrobb')
        success_text = "The password has been changed"
        self.assertContains(response=response, text=success_text, status_code=200)
        self.assertTrue(user.check_password(new_password))

    def test_superuser_set_password(self):
        """
        Test Superuser can set another user password
        """

        user = User.objects.get(username='bobrobb')

        old_password = "bobrobb"  # known old password
        new_password = "testpassword"
        confirm_password = "testpassword"

        if not user.check_password(old_password):
            self.fail('Unexpected old_password. Check fixtures.')

        body = {
            'old_password': old_password,
            'new_password': new_password,
            'confirm_password': confirm_password
        }

        request_user = User.objects.get(username='admin')
        self.client.login(username='admin', password='admin')
        self.client.force_authenticate(user=request_user)

        url = reverse('user-set-password', args=[user.id])

        response = self.client.post(
            url,
            json.dumps(body),
            content_type='application/json'
        )

        # retrieve the user again with new password
        user = User.objects.get(username='bobrobb')
        success_text = "The password has been changed"
        self.assertContains(response=response, text=success_text, status_code=200)
        self.assertTrue(user.check_password(new_password))

    def test_unauthorized_user_set_password(self):
        """
        Test that a non-superuser cannot change another user's password
        """

        logging.disable(logging.WARNING)

        user = User.objects.get(username='jeffgreff')

        old_password = "bobrobb" #known old password
        new_password = "testpassword"
        confirm_password = "testpassword"

        body = {
            'old_password': old_password,
            'new_password': new_password,
            'confirm_password': confirm_password
        }

        request_user = User.objects.get(username='bobrobb')
        self.client.login(username='bobrobb', password='bobrobb')
        self.client.force_authenticate(user=request_user)

        url = reverse('user-set-password', args=[user.id])

        response = self.client.post(
            url,
            json.dumps(body),
            content_type='application/json'
        )

        self.assertContains(response=response, text="", status_code=403)

    def test_user_set_password_invalid_data(self):
        """
        Test an empty request body raises an exception
        """

        logging.disable(logging.ERROR)

        user = User.objects.get(username='bobrobb')

        body = {}

        request_user = User.objects.get(username='bobrobb')
        self.client.login(username='bobrobb', password='bobrobb')
        self.client.force_authenticate(user=request_user)

        url = reverse('user-set-password', args=[user.id])

        response = self.client.post(
            url,
            json.dumps(body),
            content_type='application/json'
        )

        self.assertContains(response=response, text="This field is required", status_code=500)

    def test_user_set_password_incorrect_old_password(self):
        """
        Test wrong old_password raises exception
        """

        logging.disable(logging.ERROR)

        user = User.objects.get(username='bobrobb')

        old_password = "bobrobby" #known old password
        new_password = "testpassword"
        confirm_password = "testpassword"

        body = {
            'old_password': old_password,
            'new_password': new_password,
            'confirm_password': confirm_password
        }

        request_user = User.objects.get(username='bobrobb')
        self.client.login(username='bobrobb', password='bobrobb')
        self.client.force_authenticate(user=request_user)

        url = reverse('user-set-password', args=[user.id])

        response = self.client.post(
            url,
            json.dumps(body),
            content_type='application/json'
        )

        self.assertContains(response=response, text="Incorrect old password", status_code=500)

    def test_user_set_password_unmatching_passwords(self):
        """
        Test failure for new non-matching passwords
        """

        logging.disable(logging.ERROR)

        user = User.objects.get(username='bobrobb')

        old_password = "bobrobb" #known old password
        new_password = "testpassword"
        confirm_password = "passwordtest"

        body = {
            'old_password': old_password,
            'new_password': new_password,
            'confirm_password': confirm_password
        }

        request_user = User.objects.get(username='bobrobb')
        self.client.login(username='bobrobb', password='bobrobb')
        self.client.force_authenticate(user=request_user)

        url = reverse('user-set-password', args=[user.id])

        response = self.client.post(
            url,
            json.dumps(body),
            content_type='application/json'
        )

        self.assertContains(
            response=response,
            text="New passwords do not match",
            status_code=500)

    def test_user_set_password_invalid_numeric_password(self):
        """
        Test an empty request body raises an exception
        """

        logging.disable(logging.ERROR)

        user = User.objects.get(username='bobrobb')

        old_password = "bobrobb" #known old password
        new_password = "123456789"
        confirm_password = "123456789"

        body = {
            'old_password': old_password,
            'new_password': new_password,
            'confirm_password': confirm_password
        }

        request_user = User.objects.get(username='bobrobb')
        self.client.login(username='bobrobb', password='bobrobb')
        self.client.force_authenticate(user=request_user)

        url = reverse('user-set-password', args=[user.id])

        response = self.client.post(
            url,
            json.dumps(body),
            content_type='application/json'
        )

        self.assertContains(
            response=response,
            text="This password is entirely numeric",
            status_code=500)

    def test_user_set_password_invalid_same_as_username(self):
        """
        Test an empty request body raises an exception
        """

        user = User.objects.get(username='bobrobb')

        old_password = "bobrobb" #known old password
        new_password = "bobrobb"
        confirm_password = "bobrobb"

        body = {
            'old_password': old_password,
            'new_password': new_password,
            'confirm_password': confirm_password
        }

        request_user = User.objects.get(username='bobrobb')
        self.client.login(username='bobrobb', password='bobrobb')
        self.client.force_authenticate(user=request_user)

        url = reverse('user-set-password', args=[user.id])

        response = self.client.post(
            url,
            json.dumps(body),
            content_type='application/json'
        )

        self.assertContains(
            response=response,
            text="The password is too similar to the username",
            status_code=500)

class TestUserFunctions(TestCase):
    """
    Test the extra utility functions added to User object.
    """
    fixtures = ('userpermissions',)

    def test_adminuser_is_admin(self):
        """
        Test that a known admin user .is_admin() returns True
        """

        user = User.objects.get(username='testuser1')

        self.assertTrue(user.is_admin())

    def test_non_adminuser_is_not_admin(self):
        """
        Test that a known non-admin user .is_admin() returns False
        """

        user = User.objects.get(username='testuser2')

        self.assertFalse(user.is_admin())

    def test_adminuser_is_project_admin(self):
        """
        Test that known admin for a given project returns true
        """
        user = User.objects.get(username='testuser1')
        project1 = Project.objects.get(name='project 1')

        self.assertTrue(user.is_project_admin(project1))

    def test_memberuser_is_not_project_admin(self):
        """
        Test that known user returns False for a given project
        """
        user = User.objects.get(username='testuser3')
        project2 = Project.objects.get(name='project 2')

        self.assertFalse(user.is_project_admin(project2))

    def test_adminuser_is_group_admin(self):
        """
        Test that known admin for a given group returns true
        """
        user = User.objects.get(username='testuser1')
        group1 = ResearchGroup.objects.get(name='Test Research Group 1')

        self.assertTrue(user.is_group_admin(group1))

    def test_adminuser_not_is_group_admin(self):
        """
        Test that user for a given group returns true
        """
        user = User.objects.get(username='testuser1')
        group2 = ResearchGroup.objects.get(name='Test Research Group 2')

        self.assertFalse(user.is_group_admin(group2))

    def test_nonadminuser_is_group_admin(self):
        """
        Test that known user returns False for a given group
        """
        user = User.objects.get(username='testuser3')
        group2 = ResearchGroup.objects.get(name='Test Research Group 2')

        self.assertFalse(user.is_group_admin(group2))

    def test_adminuser_get_admin_groups_is_nonzero(self):
        """
        Test that function returns values for a known admin user
        """
        user = User.objects.get(username='testuser1')
        admingroups = user.get_admin_groups()

        self.assertGreater(admingroups.count(), 0)

    def test_non_adminuser_get_admin_groups_is_zero(self):
        """
        Test that function returns values for a known admin user
        """
        user = User.objects.get(username='testuser2')
        admingroups = user.get_admin_groups()

        self.assertEqual(admingroups.count(), 0)