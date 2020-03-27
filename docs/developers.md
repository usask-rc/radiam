# Developers

## API Browsing and Docs

To view live data for the Radiam API, point your web browser to your locally installed instance and append /api to the end of the URL.

For example:  https://localhost:8100/api/

You can then log in using your admin credentials.

To view the API docs, append /docs to the above URL.

For example: https://localhost:8100/api/docs/


## API Throttling

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


## API Caching

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

### Flushing The Cache

`echo "from django.core.cache import cache; cache._cache.flush_all()" | ./manage.py shell [--settings=myapp.settings_live]`


## API Permissions

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


## Token Authentication

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
{"refresh":"LONG_REFRESH_TOKEN_STRING",
"access":"LONG_ACCESS_TOKEN_STRING"}
```

Use Token:
```
curl \
  -H "Authorization: Bearer LONG_ACCESS_TOKEN_STRING" \
  http://localhost:8000/api/some-protected-view/
```

Which is: `curl -H "Authorization: Bearer TOKEN"   http://localhost:8000/users/`

Verify Token:
```
curl \
  -v \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"LONG_ACCESS_TOKEN_STRING"}' \
  http://localhost:8000/api/token/verify/
```

Refresh Token:
```
curl \
  -v \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"refresh":"LONG_REFRESH_TOKEN_STRING"}' \
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
