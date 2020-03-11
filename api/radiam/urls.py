"""radiam URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from rest_framework import routers
from rest_framework.documentation import include_docs_urls

from radiam.api import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

router = routers.DefaultRouter()
router.register(r'choicelists', views.ChoiceListViewSet)
router.register(r'choicelistvalues', views.ChoiceListValueViewSet)
router.register(r'datacollectionmethod', views.DataCollectionMethodViewSet)
router.register(r'datacollectionstatus', views.DataCollectionStatusViewSet)
router.register(r'datasets', views.DatasetViewSet)
router.register(r'datasetdatacollectionmethod', views.DatasetDataCollectionMethodViewSet)
router.register(r'datasetsensitivity', views.DatasetSensitivityViewSet)
router.register(r'distributionrestriction', views.DistributionRestrictionViewSet)
router.register(r'entities', views.EntityViewSet)
router.register(r'entityschemafields', views.EntitySchemaFieldViewSet)
router.register(r'fields', views.FieldViewSet)
router.register(r'groupmembers', views.GroupMemberViewSet)
router.register(r'grouproles', views.GroupRoleViewSet)
router.register(r'groupviewgrants', views.GroupViewGrantViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'locationprojects', views.LocationProjectViewSet)
router.register(r'locationtypes', views.LocationTypeViewSet)
router.register(r'metadatauitypes', views.MetadataUITypeViewSet)
router.register(r'metadatavaluetypes', views.MetadataValueTypeViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'projectavatars', views.ProjectAvatarViewSet)
router.register(r'projectstatistics', views.ProjectStatisticsViewSet)
router.register(r'researchgroups', views.ResearchGroupViewSet)
router.register(r'schemas', views.SchemaViewSet)
router.register(r'searchmodels', views.SearchModelViewSet)
router.register(r'selectedfields', views.SelectedFieldViewSet)
router.register(r'selectedschemas', views.SelectedSchemaViewSet)
router.register(r'sensitivitylevel', views.SensitivityLevelViewSet)
router.register(r'useragents', views.UserAgentViewSet)
router.register(r'users', views.UserViewSet)

router.register(r'useragents/(?P<useragent_id>[-\w]+)/tokens/(?P<action>[\w]+)',
                views.UserAgentTokenViewSet,
                basename='useragenttokens')

# router.register(r'useragents/osf_configs',
#                 views.OSFConfigsViewSet,
#                 basename='osf_configs')

router.register(r'projects/(?P<project_id>[-\w]+)/docs',
                views.ProjectSearchViewSet,
                basename='radiamprojectdocs')

router.register(r'datasets/(?P<dataset_id>[-\w]+)/docs',
                views.DatasetDocsViewSet,
                basename='radiamdatasetdocs')

router.register(r'datasets/(?P<dataset_id>[-\w]+)/search',
                views.DatasetSearchViewSet,
                basename='radiamdatasetsearch')

router.register(r'datasets/(?P<dataset_id>[-\w]+)/export',
                views.DatasetExportViewSet,
                basename='radiamdatasetexport')

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api/token/$', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    url(r'^api/token/refresh/$', TokenRefreshView.as_view(), name='token_refresh'),
    url(r'^api/token/verify/$', TokenVerifyView.as_view(), name='token_verify'),
    url(r'^api/oauth/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    url(r'^api/docs/', include_docs_urls(title='Radiam API', public=False, description="Radiam API documentation")),
    url(r'^api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset'))
]
