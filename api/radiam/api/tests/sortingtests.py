from django.test import TestCase

from django.urls import reverse
from rest_framework.test import APIRequestFactory, APIClient, APITestCase
from rest_framework.test import force_authenticate

from radiam.api.models import Location
from radiam.api.models import ResearchGroup
from radiam.api.models import User
from radiam.api.views import DatasetViewSet
from radiam.api.views import GroupMemberViewSet
from radiam.api.views import GroupViewGrantViewSet
from radiam.api.views import LocationViewSet
from radiam.api.views import ProjectViewSet
from radiam.api.views import ResearchGroupViewSet
from radiam.api.views import UserAgentViewSet
from radiam.api.views import UserViewSet


class UserSortingTest(APITestCase):
    fixtures = ['sort']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_user__ordered_by_username__admin_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'username'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['username'], 'admin')

    def test_user__reverse_ordered_by_username__admin_last(self):
        params = {
            'page': 2,
            'page_size': 10,
            'ordering': '-username'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][1]['username'], 'admin')

    def test_user__ordered_by_username__person_9_last(self):
        params = {
            'page': 2,
            'page_size': 10,
            'ordering': 'username'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][1]['username'], 'person9')

    def test_user__reverse_ordered_by_username__person_9_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-username'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['username'], 'person9')

    def test_user__ordered_by_username__person_2_in_middle(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'username'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][4]['username'], 'person2')

    def test_user__reverse_ordered_by_username__person_2_past_middle(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-username'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][7]['username'], 'person2')

    def test_user__ordered_by_firstname__admin_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'first_name'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['username'], 'admin')

    def test_user__reverse_ordered_by_firstname__admin_last(self):
        params = {
            'page': 2,
            'page_size': 10,
            'ordering': '-first_name'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][1]['username'], 'admin')

    def test_user__ordered_by_firstname__person_2_last(self):
        params = {
            'page': 2,
            'page_size': 10,
            'ordering': 'first_name'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][1]['username'], 'person2')

    def test_user__reverse_ordered_by_firstname__person_2_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-first_name'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['username'], 'person2')

    def test_user__ordered_by_lastname__admin_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'last_name'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['username'], 'admin')

    def test_user__reverse_ordered_by_lastname__admin_last(self):
        params = {
            'page': 2,
            'page_size': 10,
            'ordering': '-last_name'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][1]['username'], 'admin')

    def test_user__ordered_by_lastname__person_1_last(self):
        params = {
            'page': 2,
            'page_size': 10,
            'ordering': 'last_name'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][1]['username'], 'person1')

    def test_user__reverse_ordered_by_lastname__person_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-last_name'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['username'], 'person1')

    def test_user__ordered_by_email__admin_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'email'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['username'], 'admin')

    def test_user__reverse_ordered_by_email__admin_last(self):
        params = {
            'page': 2,
            'page_size': 10,
            'ordering': '-email'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][1]['username'], 'admin')

    def test_user__ordered_by_email__person_2_last(self):
        params = {
            'page': 2,
            'page_size': 10,
            'ordering': 'email'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][1]['username'], 'person2')

    def test_user__reverse_ordered_by_email__person_2_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-email'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['username'], 'person2')

    def test_user__ordered_by_notes__empties_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'notes'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][9]['username'], 'person4')

    def test_user__reverse_ordered_by_notes__empties_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-notes'
        }

        request = self.factory.get(reverse('user-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['username'], 'admin')
        self.assertEquals(response.data['results'][1]['username'], 'person2')
        self.assertEquals(response.data['results'][2]['username'], 'person4')

class GroupSortingTest(APITestCase):
    fixtures = ['sort']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_group__ordered_by_name__group_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'name'
        }

        request = self.factory.get(reverse('researchgroup-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'All Users')
        self.assertEquals(response.data['results'][1]['name'], 'Child 1')
        self.assertEquals(response.data['results'][2]['name'], 'Child 2')
        self.assertEquals(response.data['results'][3]['name'], 'Group 1')


    def test_group__reverse_ordered_by_name__group_9_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-name'
        }

        request = self.factory.get(reverse('researchgroup-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Group 9')
        self.assertEquals(response.data['results'][1]['name'], 'Group 8')
        self.assertEquals(response.data['results'][2]['name'], 'Group 7')

    def test_group__ordered_by_description__group_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'description'
        }

        request = self.factory.get(reverse('researchgroup-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'All Users')
        self.assertEquals(response.data['results'][1]['name'], 'Child 1')
        self.assertEquals(response.data['results'][2]['name'], 'Child 2')
        self.assertEquals(response.data['results'][3]['name'], 'Group 1')


    def test_group__reverse_ordered_by_description__group_9_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-name'
        }

        request = self.factory.get(reverse('researchgroup-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Group 9')
        self.assertEquals(response.data['results'][1]['name'], 'Group 8')
        self.assertEquals(response.data['results'][2]['name'], 'Group 7')

    def test_group__ordered_by_parent_group__child_group_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'parent_group'
        }

        request = self.factory.get(reverse('researchgroup-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Child 1')
        self.assertEquals(response.data['results'][1]['name'], 'Child 2')


    def test_group__reverse_ordered_by_parent_group__child_group_2_first(self):
        params = {
            'page': 2,
            'page_size': 10,
            'ordering': '-parent_group'
        }

        request = self.factory.get(reverse('researchgroup-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ResearchGroupViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][1]['name'], 'Child 2')
        self.assertEquals(response.data['results'][2]['name'], 'Child 1')

class GroupMembershipSortingTest(APITestCase):
    fixtures = ['sort']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_group_membership__ordered_by_user__admin_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'user'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(User.objects.get(id=response.data['results'][0]['user']).username, 'admin')
        self.assertEquals(User.objects.get(id=response.data['results'][1]['user']).username, 'person2')
        self.assertEquals(User.objects.get(id=response.data['results'][2]['user']).username, 'person3')
        self.assertEquals(User.objects.get(id=response.data['results'][3]['user']).username, 'person1')

    def test_group_membership__reverse_ordered_by_user__admin_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-user'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(User.objects.get(id=response.data['results'][0]['user']).username, 'person1')
        self.assertEquals(User.objects.get(id=response.data['results'][1]['user']).username, 'person3')
        self.assertEquals(User.objects.get(id=response.data['results'][2]['user']).username, 'person2')
        self.assertEquals(User.objects.get(id=response.data['results'][3]['user']).username, 'admin')

    def test_group_membership__ordered_by_group__admin_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'group'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(User.objects.get(id=response.data['results'][0]['user']).username, 'person2')
        self.assertEquals(User.objects.get(id=response.data['results'][1]['user']).username, 'person1')
        self.assertEquals(User.objects.get(id=response.data['results'][2]['user']).username, 'person3')
        self.assertEquals(User.objects.get(id=response.data['results'][3]['user']).username, 'admin')

    def test_group_membership__reverse_ordered_by_group__admin_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-group'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(User.objects.get(id=response.data['results'][0]['user']).username, 'admin')
        self.assertEquals(User.objects.get(id=response.data['results'][1]['user']).username, 'person3')
        self.assertEquals(User.objects.get(id=response.data['results'][2]['user']).username, 'person1')
        self.assertEquals(User.objects.get(id=response.data['results'][3]['user']).username, 'person2')

    def test_group_membership__reverse_ordered_by_group_role__person_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'group_role'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(User.objects.get(id=response.data['results'][2]['user']).username, 'person3')
        self.assertEquals(User.objects.get(id=response.data['results'][3]['user']).username, 'person1')

    def test_group_membership__reverse_ordered_by_group_role__person_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-group_role'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupMemberViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(User.objects.get(id=response.data['results'][0]['user']).username, 'person1')
        self.assertEquals(User.objects.get(id=response.data['results'][1]['user']).username, 'person3')
        self.assertEquals(User.objects.get(id=response.data['results'][2]['user']).username, 'admin')
        self.assertEquals(User.objects.get(id=response.data['results'][3]['user']).username, 'person2')

class LocationSortingTest(APITestCase):
    fixtures = ['sort']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_location__ordered_by_display_name__location_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'display_name'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['display_name'], 'Location 1')
        self.assertEquals(response.data['results'][1]['display_name'], 'Location 2')
        self.assertEquals(response.data['results'][2]['display_name'], 'Location 3')

    def test_location__reverse_ordered_by_display_name__location_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-display_name'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['display_name'], 'Location 3')
        self.assertEquals(response.data['results'][1]['display_name'], 'Location 2')
        self.assertEquals(response.data['results'][2]['display_name'], 'Location 1')

    def test_location__ordered_by_host_name__location_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'host_name'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['display_name'], 'Location 1')
        self.assertEquals(response.data['results'][1]['display_name'], 'Location 2')
        self.assertEquals(response.data['results'][2]['display_name'], 'Location 3')

    def test_location__reverse_ordered_by_host_name__location_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-host_name'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['display_name'], 'Location 3')
        self.assertEquals(response.data['results'][1]['display_name'], 'Location 2')
        self.assertEquals(response.data['results'][2]['display_name'], 'Location 1')

    def test_location__ordered_by_location_type__location_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'location_type'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['display_name'], 'Location 3')
        self.assertEquals(response.data['results'][1]['display_name'], 'Location 2')
        self.assertEquals(response.data['results'][2]['display_name'], 'Location 1')

    def test_location__reverse_ordered_by_host_name__location_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-location_type'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['display_name'], 'Location 1')
        self.assertEquals(response.data['results'][1]['display_name'], 'Location 2')
        self.assertEquals(response.data['results'][2]['display_name'], 'Location 3')

    def test_location__ordered_by_notes__location_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'notes'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['display_name'], 'Location 1')
        self.assertEquals(response.data['results'][1]['display_name'], 'Location 2')
        self.assertEquals(response.data['results'][2]['display_name'], 'Location 3')

    def test_location__reverse_ordered_by_notes_location_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-notes'
        }

        request = self.factory.get(reverse('groupmember-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = LocationViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['display_name'], 'Location 3')
        self.assertEquals(response.data['results'][1]['display_name'], 'Location 2')
        self.assertEquals(response.data['results'][2]['display_name'], 'Location 1')

class ProjectSortingTest(APITestCase):
    fixtures = ['sort']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_project__ordered_by_name__project_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'name'
        }

        request = self.factory.get(reverse('project-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Project 1')
        self.assertEquals(response.data['results'][1]['name'], 'Project 2')
        self.assertEquals(response.data['results'][2]['name'], 'Project 3')
        self.assertEquals(response.data['results'][3]['name'], 'Project 4')
        self.assertEquals(response.data['results'][4]['name'], 'Project 5')

    def test_project__reverse_ordered_by_name_project_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-name'
        }

        request = self.factory.get(reverse('project-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Project 5')
        self.assertEquals(response.data['results'][1]['name'], 'Project 4')
        self.assertEquals(response.data['results'][2]['name'], 'Project 3')
        self.assertEquals(response.data['results'][3]['name'], 'Project 2')
        self.assertEquals(response.data['results'][4]['name'], 'Project 1')

    def test_project__ordered_by_keywords__project_3_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'keywords'
        }

        request = self.factory.get(reverse('project-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Project 3')
        self.assertEquals(response.data['results'][1]['name'], 'Project 5')
        self.assertEquals(response.data['results'][2]['name'], 'Project 4')
        self.assertEquals(response.data['results'][3]['name'], 'Project 1')
        self.assertEquals(response.data['results'][4]['name'], 'Project 2')

    def test_project__reverse_ordered_by_keywords_project_3_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-keywords'
        }

        request = self.factory.get(reverse('project-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Project 2')
        self.assertEquals(response.data['results'][1]['name'], 'Project 1')
        self.assertEquals(response.data['results'][2]['name'], 'Project 4')
        self.assertEquals(response.data['results'][3]['name'], 'Project 5')
        self.assertEquals(response.data['results'][4]['name'], 'Project 3')

    def test_project__ordered_by_group__project_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'group'
        }

        request = self.factory.get(reverse('project-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Project 1')
        self.assertEquals(response.data['results'][1]['name'], 'Project 2')
        self.assertEquals(response.data['results'][2]['name'], 'Project 3')
        self.assertEquals(response.data['results'][3]['name'], 'Project 4')
        self.assertEquals(response.data['results'][4]['name'], 'Project 5')

    def test_project__reverse_ordered_by_group_project_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-group'
        }

        request = self.factory.get(reverse('project-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Project 5')
        self.assertEquals(response.data['results'][1]['name'], 'Project 4')
        self.assertEquals(response.data['results'][2]['name'], 'Project 3')
        self.assertEquals(response.data['results'][3]['name'], 'Project 2')
        self.assertEquals(response.data['results'][4]['name'], 'Project 1')

    def test_project__ordered_by_primary_contact_user__project_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'primary_contact_user'
        }

        request = self.factory.get(reverse('project-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Project 1')
        self.assertEquals(response.data['results'][1]['name'], 'Project 5')
        self.assertEquals(response.data['results'][2]['name'], 'Project 2')
        self.assertEquals(response.data['results'][3]['name'], 'Project 4')
        self.assertEquals(response.data['results'][4]['name'], 'Project 3')

    def test_project__reverse_ordered_by_primary_contact_user_project_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-primary_contact_user'
        }

        request = self.factory.get(reverse('project-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = ProjectViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['name'], 'Project 3')
        self.assertEquals(response.data['results'][1]['name'], 'Project 4')
        self.assertEquals(response.data['results'][2]['name'], 'Project 2')
        self.assertEquals(response.data['results'][3]['name'], 'Project 5')
        self.assertEquals(response.data['results'][4]['name'], 'Project 1')

class DatasetSortingTest(APITestCase):
    fixtures = ['sort']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_dataset__ordered_by_title__dataset_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'title'
        }

        request = self.factory.get(reverse('dataset-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['title'], 'Dataset 1')
        self.assertEquals(response.data['results'][1]['title'], 'Dataset 2')
        self.assertEquals(response.data['results'][2]['title'], 'Dataset 3')
        self.assertEquals(response.data['results'][3]['title'], 'Dataset 4')
        self.assertEquals(response.data['results'][4]['title'], 'Dataset 5')

    def test_dataset__reverse_ordered_by_title_dataset_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-title'
        }

        request = self.factory.get(reverse('dataset-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['title'], 'Dataset 5')
        self.assertEquals(response.data['results'][1]['title'], 'Dataset 4')
        self.assertEquals(response.data['results'][2]['title'], 'Dataset 3')
        self.assertEquals(response.data['results'][3]['title'], 'Dataset 2')
        self.assertEquals(response.data['results'][4]['title'], 'Dataset 1')

    def test_dataset__ordered_by_study_site__dataset_2_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'study_site'
        }

        request = self.factory.get(reverse('dataset-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['title'], 'Dataset 2')
        self.assertEquals(response.data['results'][1]['title'], 'Dataset 1')
        self.assertEquals(response.data['results'][2]['title'], 'Dataset 3')
        self.assertEquals(response.data['results'][3]['title'], 'Dataset 4')
        self.assertEquals(response.data['results'][4]['title'], 'Dataset 5')

    def test_dataset__reverse_ordered_by_study_site_dataset_2_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-study_site'
        }

        request = self.factory.get(reverse('dataset-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = DatasetViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(response.data['results'][0]['title'], 'Dataset 5')
        self.assertEquals(response.data['results'][1]['title'], 'Dataset 4')
        self.assertEquals(response.data['results'][2]['title'], 'Dataset 3')
        self.assertEquals(response.data['results'][3]['title'], 'Dataset 1')
        self.assertEquals(response.data['results'][4]['title'], 'Dataset 2')

class GroupViewGrantSortingTest(APITestCase):
    fixtures = ['sort']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_groupviewgrant__ordered_by_group__groupviewgrant_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'group'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 1')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 2')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 5')

    def test_groupviewgrant__reverse_ordered_by_group_groupviewgrant_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-group'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 5')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 2')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 1')

    def test_groupviewgrant__ordered_by_dataset__groupviewgrant_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'dataset'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 5')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 2')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 1')

    def test_groupviewgrant__reverse_ordered_by_dataset_groupviewgrant_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-dataset'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 1')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 2')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 5')

    def test_groupviewgrant__ordered_by_fields__groupviewgrant_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'fields'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 2')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 1')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 5')

    def test_groupviewgrant__reverse_ordered_by_fields_groupviewgrant_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-fields'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 5')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 1')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 2')

    def test_groupviewgrant__ordered_by_date_starts__groupviewgrant_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'date_starts'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 5')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 1')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 2')

    def test_groupviewgrant__reverse_ordered_by_date_starts_groupviewgrant_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-date_starts'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 2')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 1')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 5')

    def test_groupviewgrant__ordered_by_date_expires__groupviewgrant_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'date_expires'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 5')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 1')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 2')

    def test_groupviewgrant__reverse_ordered_by_date_expires_groupviewgrant_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-date_expires'
        }

        request = self.factory.get(reverse('groupviewgrant-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = GroupViewGrantViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][0]['group']).name, 'Group 2')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][1]['group']).name, 'Group 3')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][2]['group']).name, 'Group 1')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][3]['group']).name, 'Group 4')
        self.assertEquals(ResearchGroup.objects.get(id=response.data['results'][4]['group']).name, 'Group 5')

class UserAgentSortingTest(APITestCase):
    fixtures = ['sort']

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.get(username='admin')

    def test_useragent__ordered_by_location__useragent_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'location'
        }

        request = self.factory.get(reverse('useragent-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserAgentViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(Location.objects.get(id=response.data['results'][0]['location']).display_name, 'Location 1')
        self.assertEquals(Location.objects.get(id=response.data['results'][1]['location']).display_name, 'Location 2')
        self.assertEquals(Location.objects.get(id=response.data['results'][2]['location']).display_name, 'Location 3')

    def test_useragent__reverse_ordered_by_location_useragent_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-location'
        }

        request = self.factory.get(reverse('useragent-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserAgentViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)

        self.assertEquals(Location.objects.get(id=response.data['results'][0]['location']).display_name, 'Location 3')
        self.assertEquals(Location.objects.get(id=response.data['results'][1]['location']).display_name, 'Location 2')
        self.assertEquals(Location.objects.get(id=response.data['results'][2]['location']).display_name, 'Location 1')

    def test_useragent__ordered_by_user__useragent_1_first(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': 'user'
        }

        request = self.factory.get(reverse('useragent-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserAgentViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)
        self.assertEquals(Location.objects.get(id=response.data['results'][0]['location']).display_name, 'Location 2')
        self.assertEquals(Location.objects.get(id=response.data['results'][1]['location']).display_name, 'Location 3')
        self.assertEquals(Location.objects.get(id=response.data['results'][2]['location']).display_name, 'Location 1')

    def test_useragent__reverse_ordered_by_user_useragent_1_last(self):
        params = {
            'page': 1,
            'page_size': 10,
            'ordering': '-user'
        }

        request = self.factory.get(reverse('useragent-list'), params)
        request.user = self.user
        force_authenticate(request, user=request.user)

        response = UserAgentViewSet.as_view({'get': 'list'})(request)

        self.assertContains(response=response, text='', status_code=200)

        self.assertEquals(Location.objects.get(id=response.data['results'][0]['location']).display_name, 'Location 1')
        self.assertEquals(Location.objects.get(id=response.data['results'][1]['location']).display_name, 'Location 3')
        self.assertEquals(Location.objects.get(id=response.data['results'][2]['location']).display_name, 'Location 2')
