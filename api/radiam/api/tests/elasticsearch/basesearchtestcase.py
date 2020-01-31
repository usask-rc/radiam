import unittest
import time

from django.test import TestCase
from elasticsearch_dsl import Index

from radiam.api.search import _SearchService, _IndexService, _DocumentService


class BaseSearchTestCase(TestCase):

    TEST_INDEX_ID = '094ee941-3c2b-4e73-953b-85cf1585dab5'
    TOTAL_INDEXING_WAIT_PERIOD = 5  # seconds
    INDEXING_RETRY_INTERVAL = 0.1  # seconds

    def setUp(self):
        self.indexservice = _IndexService(self.TEST_INDEX_ID)
        self.documentservice = _DocumentService()

        result = self.indexservice.create_index(self.TEST_INDEX_ID)
        self.assertTrue(self.indexservice.index_exists(self.TEST_INDEX_ID))

    def tearDown(self):
        if self.indexservice.index_exists(self.TEST_INDEX_ID):
            result = self.indexservice.delete_index(self.TEST_INDEX_ID)
        self.assertFalse(self.indexservice.index_exists(self.TEST_INDEX_ID))

    def index_test_docs(self, data):

        """
        There is some lag time between the indexing call, and the point where
        the documents are available in the index. Fail if documents are not
        available within specified time.
        """

        docs = data

        #
        result = self.documentservice.create_many_docs(self.TEST_INDEX_ID, docs)

        stats = self.indexservice.get_stats()

        count = stats['indices'][self.TEST_INDEX_ID]['primaries']['docs']['count']
        t0 = time.time()

        while (count != len(data)) and (time.time()-t0 < self.TOTAL_INDEXING_WAIT_PERIOD):
            # print('Waiting for docs...')
            stats = self.indexservice.get_stats()
            count = stats['indices'][self.TEST_INDEX_ID]['primaries']['docs']['count']
            time.sleep(self.INDEXING_RETRY_INTERVAL)

        if count != len(data):
            self.fail('Documents were not indexed'
                      'within the specified time limit.')
