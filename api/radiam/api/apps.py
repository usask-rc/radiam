from django.apps import AppConfig
from elasticsearch_dsl import connections

class RadiamConfig(AppConfig):
    name = 'radiam.api'

    def ready(self):

        # Create connection to the Elasticseatch service
        connections.create_connection(hosts=['elasticsearch:9200'], timeout=120)
