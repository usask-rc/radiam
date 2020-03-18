# API

## Throttling

Based upon:

https://www.django-rest-framework.org/api-guide/throttling/

There are two main configurations for throttling at the moment which are both located in settings.py configuration file under the "REST_FRAMEWORK" object. DEFAULT_THROTTLE_CLASSES which specifies the classes that are involved in the throttling and the defaults can be overridden to get different results. Currently we are just using two different rates, for authenticated and anonymous users.

```
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    )
}
```

The other is DEFAULT_THROTTLE_RATES which controls when users get throttled. Can be in second, minute, hour, and day.

```
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10/hour',
        'user': '1000/hour'
    }
}
```

The Django REST Framework throttling supports using scopes to define unique throttling rates for different parts of the REST API in case we need them. Just requires a particular object to be specified in each view and then have that scope defined.

Throttling depends on both Permissions and on Caching.

Example normal response from users endpoint:

`{"count":0,"next":null,"previous":null,"results":[]}`

Example throttled header response:

```
HTTP/1.1 429 Too Many Requests
Date: Tue, 20 Nov 2018 21:56:00 GMT
Server: WSGIServer/0.2 CPython/3.7.1
Content-Type: application/json
Retry-After: 3501
Vary: Accept, Cookie
Allow: GET, POST, HEAD, OPTIONS
X-Frame-Options: SAMEORIGIN
Content-Length: 71
```

Example throttled response:

`{"detail":"Request was throttled. Expected available in 3600 seconds."}`


## Caching

Based upon:

https://docs.djangoproject.com/en/2.1/topics/cache/#setting-up-the-cache

Default caching not recommended for production. Memcaching is used by very large orgs for performance improvements. We could move to database caching if we want to use our database for that purpose.

There are two suggested implementations for memory caching, memcached and pylibmc. Although pylibmc looks more active it appears to have a race condition problem: https://github.com/antonagestam/collectfast/issues/103 and is used as a secondary example after memcached. 

Configuration for caching is in a CACHES object in settings.yml.

```
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': 'api_memcached_1:11211',
    }
}
```

There is a memcached service running in its own docker container. This is currently only setup to use a single container but we could setup a cluster of them going forward. A cluster is specified by a comma separated list. We might load balance them using docker swarm / kubernetes if necessary.

### Flush Cache

`echo "from django.core.cache import cache; cache._cache.flush_all()" | ./manage.py shell [--settings=myapp.settings_live]`


## Permissions

Based upon:

https://www.django-rest-framework.org/api-guide/permissions/

Added DEFAULT_PERMISSION_CLASSES to settings.yml

```
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        # Uncomment to only allow authenticated access
        # 'rest_framework.permissions.IsAuthenticated'
        'rest_framework.permissions.AllowAny',
    )
}
```

Can set permissions based upon view or view set:

```

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
 
class ExampleView(APIView):
    permission_classes = (IsAuthenticated&IsAdminUser,)
 
    def get(self, request, format=None):
        content = {
            'status': 'request was permitted'
        }
        return Response(content)
```

The full list of options for permissions can be seen in the above Django page.


## Testing

Tests:
- Located in the /tests module of a Django app
- Tests are currently organized according to Model
- Tests should adhere to the 'Arrange, Act, Assert' pattern
- Feel free to modify or add tests/assertions that they deem valuable
- Test running examples:

```
docker exec -it api_web_1 /bin/bash
 
# Run all test suites
python manage.py test -v3 radiamsec.radiamusers
 
# Run individual test suites
python manage.py test -v3 radiamsec.radiamusers.tests.TestResearchGroupAPI
 
# run individual test method in a particular suite
python manage.py test -v3 radiamsec.radiamusers.tests.TestResearchGroupAPI.test_create_researchgroup_blank_description
```

Fixtures:
- Django creates a test database for each test run and destroys it upon the test run's completion
- Data is loaded into this test database via test fixtures, specified in your test files. These are JSON representations of the initial models that a test database should contain as a precondition for a test suite.
- Fixtures are located in the /fixtures module of an individual Django app (ie: /radiamsec/radiamusers/fixtures)
- Example generation of fixtures:

```
docker exec -it api_radiamapi_1 bash
python manage.py dumpdata radiamusers.user --indent=4 > ./radiamsec/radiamusers/fixtures/users.json
```

Loading data into the main Database via data fixture:

- Used as an alternative for the 'oneshot.yml' script for loading initial data into the database for development.

```
docker exec -it api_radiamapi_1 bash
python manage.py loaddata radiamsec/radiamusers/fixtures/<yourfixtures>.json
```


# Email

Email can be sent from Radiam by either configuring an SMTP backend in settings.py:

```
# SMTP settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.server.com'
EMAIL_HOST_USER = 'smtpperson@email.com'
EMAIL_HOST_PASSWORD = 'smtppassword'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
```

OR by configuring the SendGrid backend with an API Key:

```
# SendGrid Mail Service
EMAIL_BACKEND = 'sgbackend.SendGridBackend'
SENDGRID_API_KEY = 'PUT_YOUR_SENDGRID_API_KEY_HERE'
```

Developers may want to use the console email backend, which simply prints out the Email content to the console/application logs.

```
# Send emails to the console/application logs for dev purposes
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # During development only
```

Developers can also specify DEV_EMAIL_ADDRESSES = [ ] if they want to send to emails other than the one specified in the User.email attribute for dev/testing/debugging purposes:

```
# Dev email addresses
DEV_EMAIL_ADDRESSES = ['someone1@somewhere.edu','someone2@somewhere.edu']
```


## Token Auth

### JWT Tokens

From https://github.com/davesque/django-rest-framework-simplejwt

In settings.py see the above link for what settings are possible.

Currently using public key encyrption by loading the private and public keys from files. Can change once we have secrets in place.

Request token:
```
curl \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "password"}' \
    http://localhost:8000/api/token/
```

Response:
```
{"refresh":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTU0MzAwNzUzMCwianRpIjoiNDM5MTNlNzM0NTc3NDJlZTk1MjA1MGQ1MWZhNGE5NDYiLCJ1c2VyX2lkIjoxfQ.9YavFSy2S1cpiFs7uEUa9LTDZXiBSe_CAVrKOcrpAPa9I6V0Bfseo4BNWrMizyUqxzbq5vSF9H1dLHqr9pZJwDR1Qgj9WF6x2NiaeO4S5Tk0gT481kzuttpnyRmsDGhKwnVJsWuW5WbvzmBNHHxdUo0LlgoEZKFdc2Z1aKiwkDcUHFFs3UnwR5ROvrg8DMTtQPdZ81Q34jNDFaoSEBGvUqHwliGUzSlJcE4y1EEOlYFBCPy6fCJ9BWSEHdyZN0GTIryrznXSH4VRqeIyx5y9EyvstJ6zggn9FTGguw83kSghquHPJlzm4c80vN1_hVWe7bj4NMI4xYsjWT470VjyJA",
"access":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNTQyOTIxNDMwLCJqdGkiOiJlY2RhMWJjNDg3ZGY0ODM3ODVkMTQ3MTYzNmQ3ZGNmMiIsInVzZXJfaWQiOjF9.69aOciRUR54pIpO-4qxqrUV_ADXi70Ml3fi2nOilpRfJs7o6yendTeKOt2zJ41FhU-41DN7uFYWsDAZocMj6H4i3C8C7vBdqqs2a53jQFB5j_WQr8asGy4vM_XclxAR_gluZV0ibquCpYzrw3jS-mRpJsTI50sROtugKLKPbjn7GElgSECrZ32l1BwIPApYKMF_QsBqh3XOwIaVy6oklAVJWY-diqfrTxJTQp1m8cP0egcnVcGma7AROeJsS3CxNc2mELXXI41XMwOdSYHIj3tGClVMEAUf9_z9P-JGaIEnyDNY1sNTePJDA5HWN3Hf8lAXyl8X9DNZ8GAqPLjxPcg"}
```

Use Token:
```
curl \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNTQyOTIxNDMwLCJqdGkiOiJlY2RhMWJjNDg3ZGY0ODM3ODVkMTQ3MTYzNmQ3ZGNmMiIsInVzZXJfaWQiOjF9.69aOciRUR54pIpO-4qxqrUV_ADXi70Ml3fi2nOilpRfJs7o6yendTeKOt2zJ41FhU-41DN7uFYWsDAZocMj6H4i3C8C7vBdqqs2a53jQFB5j_WQr8asGy4vM_XclxAR_gluZV0ibquCpYzrw3jS-mRpJsTI50sROtugKLKPbjn7GElgSECrZ32l1BwIPApYKMF_QsBqh3XOwIaVy6oklAVJWY-diqfrTxJTQp1m8cP0egcnVcGma7AROeJsS3CxNc2mELXXI41XMwOdSYHIj3tGClVMEAUf9_z9P-JGaIEnyDNY1sNTePJDA5HWN3Hf8lAXyl8X9DNZ8GAqPLjxPcg" \
  http://localhost:8000/api/some-protected-view/
```

Which is: `curl -H "Authorization: Bearer TOKEN"   http://localhost:8000/users/`

Verify Token:
```
curl \
  -v \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNTQzNTI2NzQzLCJqdGkiOiJlZGU3ZWNjN2IzMGI0MTZmOTc5NTgyOGI2NDY3NjU0YyIsInVzZXJfaWQiOjF9.bZ5mxqtWGNreF0ocJOpb1FhCE2e7PO6L8bD5bENLDKEttm4j8U2HxrYUKmEUFWkUwSguCN2E7Jm91mX8fhTNl-c-sh994b_Ig09wHhbna1T1eFSmTPEhvgeJnjDNW1y2SBAhGtgcCLN_ZKrwS-YuwIzlnt5cD-tTX2EeitDhz2PW76qr-iYy1B7UaWL22MZBodubNgo_mL6abweLxtgl7tQTpvpvAZusyUMdSXGlb-ziFrKiPrwerKWEL4OgYxt3bhWm9FpoBZAxcRSbMNVSo7PsjvPTzQkEKJ7nqo45nw-BzBgtdjRdnIrv2bWEuUUCuxYsQrt3EpEqpTzH6z3ZEQ"}' \
  http://localhost:8000/api/token/verify/
```

Refresh Token:
```
curl \
  -v \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"refresh":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTU0NTM0NDk1NSwianRpIjoiMGUxYWJjNDBiMmU3NDJlYjgwYzg5NjhkNTIzZjhiZGUiLCJ1c2VyX2lkIjoxfQ.ngA7K9PZuSPBDliV-K9ujBL1bAA8dzBP1UBXylw-SdjUvZ0uqykPY7X8ds07s5V3EIGMoLpULT9YfwmbXIJwGQ6lfums0uuvAlJ2pJIJIp51u-PY9yEs7ezRyVHjJSOO6rfcManiku8jGJECfNf3KelL86T-xv2LKqGukzI82hUgaByLYBSzfzdCrz7xz91L8iYtoBuD1IMUcVy4qiD0mLmFfgo-l8mLFn4Bl0ZqBIBqfQtSYh2L0LQZqsZfQkEY71vUnrd1B-asc9XkO5itW4UicrnX1u7RQO6Ypmdhm0_1WDg_WyC81F14OgaPYQm81iikzrVnbEyzmvKXCiK2Ew"}' \
  http://localhost:8000/api/token/refresh/
```

### OAUTH

https://django-oauth-toolkit.readthedocs.io/en/latest/rest-framework/getting_started.html

Register App: `http://localhost:8000/api/oauth/applications`

Get Token: `curl -X POST -d "grant_type=password&username=<user_name>&password=<password>" -u"<client_id>:<client_secret>" http://localhost:8000/api/oauth/token/`

Use Token:
```
# Retrieve users
curl -H "Authorization: Bearer <your_access_token>" http://localhost:8000/users/
curl -H "Authorization: Bearer <your_access_token>" http://localhost:8000/users/1/
 
# Retrieve groups
curl -H "Authorization: Bearer <your_access_token>" http://localhost:8000/groups/
 
# Insert a new user
curl -H "Authorization: Bearer <your_access_token>" -X POST -d"username=foo&password=bar" http://localhost:8000/users/
```
