from django.test import TestCase

from django.urls import reverse
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from radiam.api.models import User
from radiam.api.views import UserViewSet


class ActiveModelFilterTest(TestCase):
    """Test Filters using the User model.
    """

    fixtures = ['users']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_filter_fields_is_active_true_lower(self):
        """
        Test the is_active filter backend with 'True'
        """
        is_active = 'true'
        params = {
            'is_active': is_active
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['count'], 3)

    def test_filter_fields_is_active_true_upper(self):
        """
        Test the is_active filter backend with 'True'
        """
        is_active = 'True'
        params = {
            'is_active': is_active
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['count'], 3)

    def test_filter_fields_is_active_false_lower(self):
        """
        Test the is_active filter backend with 'False'
        """
        is_active = 'false'
        params = {
            'is_active': is_active
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['count'], 1)

    def test_filter_fields_is_active_false_upper(self):
        """
        Test the is_active filter backend with 'False'
        """
        is_active = 'False'
        params = {
            'is_active': is_active
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['count'], 1)

    def test_filter_fields_is_active_all_lower(self):
        """
        Test the is_active filter backend with 'False'
        """
        is_active = 'all'
        params = {
            'is_active': is_active
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['count'], 4)

    def test_filter_fields_is_active_all_upper(self):
        """
        Test the is_active filter backend with 'False'
        """
        is_active = 'All'
        params = {
            'is_active': is_active
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['count'], 4)
