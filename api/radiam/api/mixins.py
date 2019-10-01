

class UserPermissionMixin(object):
    """
    Permissions mixin object to be used with User model
    """

    @staticmethod
    def has_read_permission(request):
        """
        Global 'Model' permission:
        All users with access to Radiam can read User lists
        """

        return True

    @staticmethod
    def has_write_permission(request):
        """
        Global 'Model' permission:
        Only superuser or admin in at least one of their group memberships
        can create new User instances.
        """

        return True

    @staticmethod
    def has_create_permission(request):

        if request.user.is_superuser \
                or request.user.is_admin():
            return True
        else:
            return False

    def has_object_read_permission(self, request):
        """
        Object 'Instance' permission:
        All users with access to Radiam can read User instances
        """

        if request.user.is_superuser \
                or request.user == self \
                or request.user.is_admin():
            return True
        else:
            return False

    def has_object_write_permission(self, request):
        """
        Object 'Instance' permission:
        Only superuser, admin users or self are allowed to update a given
        User instance.
        """

        if request.user.is_superuser \
                or request.user == self \
                or request.user.is_admin():
            return True
        else:
            return False

    #     # May want to allow admin users to change User details?
    #     # Can this be done without getting into field-level permissions?

    def has_object_update_permission(self, request):
        if request.user.is_superuser \
                or request.user == self \
                or request.user.is_admin():
            return True
        else:
            return False

    def has_object_destroy_permission(self, request):
        # if not request.user == self \
        #     and request.user.is_admin():
        #     return True
        # else:
        #     return False
        if not request.user.is_superuser \
                or request.user == self:
            return False
        else:
            return True


class ResearchGroupPermissionMixin(object):
    """
    Permissions mixin object to be used with ResearchGroup model
    """

    @staticmethod
    def has_read_permission(request):
        """
        Global read permissions for Research Groups
        """
        return True

    @staticmethod
    def has_write_permission(request):
        """
        Global write permissions for Research Groups
        """
        if request.user.is_superuser or request.user.is_admin():
            return True
        else:
            return False

    def has_object_read_permission(self, request):
        """
        Detail read permissions for Research Groups
        """
        return True

    def has_object_write_permission(self, request):
        """
        Detail write permissions for Research Groups
        """
        if request.user.is_superuser or request.user.is_group_admin(self):
            return True
        else:
            return False


class GroupMemberPermissionMixin(object):
    """
    GroupMember mixin object to be used with GroupMember model
    """

    @staticmethod
    def has_read_permission(request):
        """
        Global 'Model' permission. All users can read the groupmember lists
        """
        return True

    @staticmethod
    def has_write_permission(request):
        """
        Global 'Model' permission. Superuser and Admin user can create new groupmembers.
        """
        # # query here to see if the current user is an admin for the project connected to the group that they are
        # # trying to write....How to do this
        # group = request.data.get('group')

        if request.user.is_superuser or request.user.is_admin():
            return True
        else:
            return False

    @staticmethod
    def has_create_permission(request):
        """
        GroupMember Instance create permission.
        """

        # get the UUID from the full linked object URL

        if request.user.is_superuser \
                or request.user.is_admin():
            return True
        else:
            return False

    def has_object_read_permission(self, request):
        """
        GroupMember Instance read permission. All user can read instances
        """

        return True

    def has_object_write_permission(self, request):
        """
        GroupMember Instance write permission.
        Superusers or Group admins can write groupmember-detail
        """

        if request.user.is_superuser  \
                or request.user.is_group_admin(self.group):
            return True
        else:
            return False


class GroupViewGrantPermissionMixin(object):
    """
    Permission mixin object to be used with GroupViewGrant model
    """

    @staticmethod
    def has_read_permission(request):
        """
        Global 'Model' permission. All users can read the groupmember lists
        """
        if request.user.is_superuser \
                or request.user.is_admin():
            return True
        else:
            return False

    @staticmethod
    def has_write_permission(request):
        """
        Global 'Model' permission. Superuser and Admin user can create new groupmembers.
        """
        if request.user.is_superuser \
                or request.user.is_admin():
            return True
        else:
            return False

    def has_object_read_permission(self, request):
        """
        GroupViewGrant Instance read permission. All user can read instances
        """
        if request.user.is_superuser \
                or request.user.is_group_admin(self.group):
            return True
        else:
            return False

    def has_object_write_permission(self, request):
        """
        GroupViewGrant Instance write permission.
        Superusers or Group admins can write groupmember-detail
        """
        if request.user.is_superuser \
                or request.user.is_group_admin(self.group):
            return True
        else:
            return False



class ProjectPermissionMixin(object):
    """
    Permission mixin object to be used with the Project model
    """

    @staticmethod
    def has_read_permission(request):
        """
        Global 'Model' permission. All users can read the project lists
        """
        return True

    @staticmethod
    def has_write_permission(request):
        """
        Global 'Model' permission. Superuser and Admin user can create new projects.
        """
        if request.user.is_superuser or request.user.is_admin():
            return True
        else:
            return False

    def has_object_read_permission(self, request):
        """
        Object 'Instance' permission. All user can read instances
        """
        return True

    def has_object_write_permission(self, request):
        """
        Object 'Instance' permission:
        """
        if request.user.is_superuser or request.user.is_project_admin(self):
            return True
        else:
            return False


class SuperuserOnlyPermissionMixin(object):
    """
    Permission mixin object that restricts all access unless user is superuser
    """

    @staticmethod
    def has_read_permission(request):
        """
        Global 'READ' permission.
        """
        return True

    @staticmethod
    def has_write_permission(request):
        """
        Global 'WRITE' permission.
        """
        if request.user.is_superuser:
            return True
        else:
            return False

    def has_object_read_permission(self, request):
        """
        Object 'Instance' permission. All user can read instances
        """
        return True

    def has_object_write_permission(self, request):
        """
        Object 'Instance' permission:
        """
        if request.user.is_superuser:
            return True
        else:
            return False


class ProjectDetailPermissionMixin(object):
    """
    Permission Detail Permission mixin object that allows Global Read and
    superuser or ProjectAdmin write.
    """

    @staticmethod
    def has_read_permission(request):
        """
        Global 'READ' permission.
        """
        return True

    @staticmethod
    def has_write_permission(request):
        """
        Global 'WRITE' permission.
        """
        if request.user.is_superuser or request.user.is_admin():
            return True
        else:
            return False

    def has_object_read_permission(self, request):
        """
        Object 'Instance' permission. All user can read instances
        """
        return True

    def has_object_write_permission(self, request):
        """
        Object 'Instance' permission:
        """

        if request.user.is_superuser or request.user.is_project_admin(self.project):
            return True
        else:
            return False

class DatasetPermissionMixin(object):
    """
    Permission mixin object to be used with the Dataset model
    """

    @staticmethod
    def has_read_permission(request):
        """
        Global 'Model' permission. All users can read the project lists
        """
        return True

    @staticmethod
    def has_write_permission(request):
        """
        Global 'Model' permission. Superuser and Admin user can create new projects.
        """
        if request.user.is_superuser or request.user.is_admin():
            return True
        else:
            return False

    def has_object_read_permission(self, request):
        """
        Object 'Instance' permission. All user can read instances
        """
        return True

    def has_object_write_permission(self, request):
        """
        Object 'Instance' permission:
        """
        if request.user.is_superuser or request.user.is_project_member(self.project):
            return True
        else:
            return False

class DatasetDetailPermissionMixin(object):
    """
    Permission Detail Permission mixin object that allows Global Read and
    superuser or ProjectAdmin write. This is used on
    DatasetDataCollectionMethod, DatasetSensitivityLevel, etc.
    """

    @staticmethod
    def has_read_permission(request):
        """
        Global 'READ' permission.
        """
        return True

    @staticmethod
    def has_write_permission(request):
        """
        Global 'WRITE' permission.
        """
        if request.user.is_superuser or request.user.is_admin():
            return True
        else:
            return False

    def has_object_read_permission(self, request):
        """
        Object 'Instance' permission. All user can read instances
        """
        return True

    def has_object_write_permission(self, request):
        """
        Object 'Instance' permission:
        """

        if request.user.is_superuser or request.user.is_project_admin(self.dataset.project):
            return True
        else:
            return False