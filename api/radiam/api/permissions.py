from rest_framework.permissions import BasePermission

from .models import User

class IsSuperuserOrSelf(BasePermission):
    """
    Permission class to restrict access unless Superuser or self
    """

    def has_permission(self, request, view):
        """
        Return True if user is Superuser or current user making request
        """

        request_user = request.user

        # This may need to be improved. The Browsable API
        # seems to break in some cases as it is not passed 'pk'
        # but it still check permissions on the UserViewset
        try:
            user = User.objects.get(id=view.kwargs['pk'])
        except KeyError:
            return False

        if request_user.is_superuser or request_user==user :
            return True
        else:
            return False

class IsSuperuser(BasePermission):
    """
    Return false if user is not superuser
    """

    def has_permission(self, request, view):
        """
        Return True if user is Superuser, false otherwise
        """

        return request.user.is_superuser

# class IsSuperUserOrGroupAdmin(BasePermission):
#     """
#     Permissions class to restrict access unless superuser or group admin
#     """
#
#     def has_permission(self, request, view):
#         """
#         Return True if superuser or current user is a group admin
#         """
#
#         if request_user.is_superuser:
#             return True
#         else:
#             return False
