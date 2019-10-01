
from rest_framework.exceptions import APIException

class BadRequestException(APIException):
    status_code = 400
    default_detail = 'No Request data included'
    default_code = 'bad request'


class ProjectNotFoundException(APIException):
    status_code = 404
    default_detail = 'Project not found.'
    default_code = 'not found'


class AuthorizationException(APIException):
    status_code = 401
    default_detail = 'Unauthorized'
    default_code = 'unauthorized'

class ProjectNotCreatedException(APIException):
    status_code = 400
    default_detail = "Project not created."
    default_code = 'bad request'

class ElasticSearchRequestError(Exception):
    """The Project could not be created"""

    @property
    def info(self):
        """ Extra error information as to why the project was not created """
        return self.args[0]