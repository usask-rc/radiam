"""
Django settings for radiam project.

Generated by 'django-admin startproject' using Django 2.0.9.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""

import os

from datetime import timedelta

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/

# Get settings from secrets loaded into our container from docker.
if os.path.isdir('/run/secrets/'):
    for filename in os.listdir('/run/secrets/'):
        with open(os.path.join('/run/secrets/', filename), 'r') as secrets_file:
            os.environ[filename] = secrets_file.read()

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('PROD_SECRET_KEY', 'i_d58xix$0l%c0b^@lz%1#f@61^12yomsf27d3_n%s^tva*pk9')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DJANGO_DEBUG', "True") == "True"

TRACE = False

# By default try to send emails, turn off in development environments.
SEND_EMAIL = os.environ.get('SEND_EMAIL', "True") == "True"

FROM_EMAIL = 'noreply@radiam.ca'

ALLOWED_HOSTS = ['.radiam.ca', '.computecanada.ca', '127.0.0.1', 'localhost', 'testserver', '.frdr.ca', 'nginx','radiamapi']

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Application definition

INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.messages',
    'django.contrib.sessions',
    'django.contrib.staticfiles',
    'django_filters',
    'oauth2_provider',
    'rest_framework',
    'django_rest_passwordreset',
    'dry_rest_permissions',
    'radiam.api',
    'mptt',
    'django_nose',
    'drf_yasg',
]

# Uncomment this line to use Nose for coverage tests
# TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

# Tell nose to measure coverage on the 'foo' and 'bar' apps
NOSE_ARGS = [
    '--with-coverage',
    '--cover-package=radiam.api',
    '--cover-html'
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        }
    },
    'formatters': {
        'verbose': {
            'format': '%(asctime)s %(levelname)s [%(name)s:%(lineno)s] %(module)s %(message)s'
        }
    },
    'handlers': {
        'console_debug_false': {
            'level': 'INFO',
            'filters': ['require_debug_false'],
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console_debug_false'],
            'level': 'INFO'
        }
    }
}

MIDDLEWARE = [
    # Cors Middleware should be as high as possible
    # CSRF middleware protection not needed due to JWT implementation.
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.gzip.GZipMiddleware' #new 1/6/2020
]

ROOT_URLCONF = 'radiam.urls'

CORS_ORIGIN_WHITELIST = (
    'https://radiam.ca',
    'http://localhost:8000',
    'http://localhost:3000',
    'http://localhost:8100',
    'http://localhost:8080',
    'http://localhost:80'
)

CORS_ALLOW_HEADERS = (
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
)

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [ os.path.join(os.path.dirname(__file__), 'templates') ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'radiam.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

DATABASES = {
    'default': {
        'NAME': 'db',
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': 'db',
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'example'),
        'PORT': '5432'
    }
}


# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/

# Reserve /static in Nginx container for React app static files
STATIC_ROOT = os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), 'django/static')

STATIC_URL = '/django/static/'

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # By default session auth not in this list
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        # Uncomment to only allow authenticated access
        'rest_framework.permissions.IsAuthenticated',
        # 'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',
        'user': '10000/hour'
    },
    'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',)
    # 'DEFAULT_PARSER_CLASSES': {
    #     'rest_framework.parsers.JSONParser'
    # }
}

# Allow session auth to be enabled for browseable API in local development
if str(os.environ.get('SESSIONAUTH')) == "1":
    REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = (
        'rest_framework.authentication.SessionAuthentication',
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )

MEMCACHE = 'memcached:11211'

# Caching required for throttling of rest requests. Recommended to use either
# database or memcaching in production. Mem should decrease load on database.
# Will want to switch to IP
# https://docs.djangoproject.com/en/2.1/topics/cache/#setting-up-the-cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': MEMCACHE,
    }
}

OAUTH2_PROVIDER = {
    # this is the list of available scopes
    'SCOPES': {
        'read': 'Read scope',
        'write': 'Write scope',
        'groups': 'Access to your groups'
    }
}

# https://github.com/davesque/django-rest-framework-simplejwt
with open('/code/privkey.pem', 'r') as private_key_file:
    private_key = private_key_file.read()

with open('/code/public.pub', 'r') as public_key_file:
    public_key = public_key_file.read()

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(weeks=4),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,

    'ALGORITHM': 'RS512',
    'SIGNING_KEY': private_key,
    'VERIFYING_KEY': public_key,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# Local User Model
AUTH_USER_MODEL = 'api.User'

# Define this to send email to developers instead of the email address defined in the user model
# DEV_EMAIL_ADDRESSES = ['','']

# Uncomment this to send emails to the console/application logs for dev purposes
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # During development only

# Uncomment this to send email via SMTP
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.server.com'
# EMAIL_HOST_USER = 'smtpperson@email.com'
# EMAIL_HOST_PASSWORD = 'smtppassword'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True

# Uncomment this to send email via SendGrid mail service
# EMAIL_BACKEND = 'sgbackend.SendGridBackend'
# SENDGRID_API_KEY = ''

SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', None)

if SENDGRID_API_KEY is None:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    # Add other dev SMTP settings here here.
else:
    EMAIL_BACKEND = 'sgbackend.SendGridBackend'

# Django doesn't have any knowledge of the client-side app URLs. Add Client-side
# URLs here as necessary.
CLIENT_APP_URLS = {
    "PASSWORD_RESET_BASE_URL": '/#/reset/',
    "LOGIN_URL": '/#/login/'
}

# Config settings for 'django_rest_passwordreset'
DJANGO_REST_PASSWORDRESET_TOKEN_CONFIG = {
    "CLASS": "django_rest_passwordreset.tokens.RandomStringTokenGenerator"
}
