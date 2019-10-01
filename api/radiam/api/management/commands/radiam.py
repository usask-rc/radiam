import time

from django.core.management.base import BaseCommand, CommandError
from radiam.api.documents import GeoDataDoc

from elasticsearch.exceptions import ConnectionError

class Command(BaseCommand):

    help = "Initialize the Elasticsearch indexes"

    def handle(self, *args, **options):

        # for _ in range(60):
        #     try:
        #         GeoDataDoc.init()
        #     except ConnectionError:
        #         time.sleep1(1)
        GeoDataDoc.init()

        self.stdout.write(self.style.SUCCESS('Created Elasticsearch Indexes for Radiam'))
