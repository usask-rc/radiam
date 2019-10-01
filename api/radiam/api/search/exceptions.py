from rest_framework.exceptions import APIException


class IndexNotCreatedException(APIException):
    status_code = 500
    default_detail = 'Index not created.'
    default_code = 'server_error'