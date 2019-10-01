from unittest.mock import patch, MagicMock
from django.test import TestCase

from radiam.api.permissions import *

class TestPermissions(TestCase):
    """
    Test the custom permissions classes.
    """

    @patch('radiam.api.models.User.objects')
    def test_issuperuserorself_returns_true_when_user_is_admin(self, mock_user_manager):

        permission = IsSuperuserOrSelf()

        request = MagicMock(user=MagicMock())
        view = MagicMock()
        request.user.is_superuser = True

        self.assertTrue(permission.has_permission(request, view))

    @patch('radiam.api.models.User.objects')
    def test_issuperuserorself_returns_false_when_user_not_admin(self, mock_user_manager):

        permission = IsSuperuserOrSelf()

        request = MagicMock(user=MagicMock())
        view = MagicMock()
        request.user.is_superuser = False

        self.assertFalse(permission.has_permission(request, view))

    @patch('radiam.api.models.User.objects')
    def test_issuperuserorself_returns_true_when_user_is_request_user(self, mock_user_manager):
        user = MagicMock()
        mock_user_manager.get.return_value = user

        permission = IsSuperuserOrSelf()

        request = MagicMock(user=MagicMock())
        view = MagicMock()
        request.user = user
        request.user.is_superuser = False

        self.assertTrue(permission.has_permission(request, view))

    @patch('radiam.api.models.User.objects')
    def test_issuperuserorself_returns_true_when_user_not_request_user(self, mock_user_manager):
        user = MagicMock()
        mock_user_manager.get.return_value = user

        permission = IsSuperuserOrSelf()

        request = MagicMock(user=MagicMock())
        view = MagicMock()
        request.user = MagicMock()
        request.user.is_superuser = False

        self.assertFalse(permission.has_permission(request, view))

    def test_issuperuser_returns_true_when_user_is_superuser(self):
        permission = IsSuperuser()

        request = MagicMock(user=MagicMock())
        request.user.is_superuser = True

        view = MagicMock()

        self.assertTrue(permission.has_permission(request, view))

    def test_issuperuser_returns_false_when_user_not_superuser(self):
        permission = IsSuperuser()

        request = MagicMock(user=MagicMock())
        request.user.is_superuser = False

        view = MagicMock()

        self.assertFalse(permission.has_permission(request, view))
