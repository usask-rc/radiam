import time

from django.core.management.base import BaseCommand, CommandError
from radiam.api.documents import GeoDataDoc, ProjectMetadataDoc, DatasetMetadataDoc

from elasticsearch.exceptions import ConnectionError

class Command(BaseCommand):

    help = "Initialize the Elasticsearch indexes"

    def handle(self, *args, **options):
        GeoDataDoc.init()
        ProjectMetadataDoc.init()
        DatasetMetadataDoc.init()

        self.stdout.write(self.style.SUCCESS('Created Elasticsearch Indexes for Radiam'))
