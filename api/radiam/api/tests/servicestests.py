from unittest import TestCase, mock
from rest_framework.request import Request

from elasticsearch_dsl import Search
from elasticsearch_dsl.response import Response, Hit

from radiam.api.services import SearchService, GeoSearchService

class TestGeoSearchService(TestCase):
    """
    Unit tests for GeoSearchService.
    """

    def setUp(self):
        self.search_index = 'test_index'
        self.query_key = 'query'
        self.geo_query_key = 'geo_query'
        self.geodata_index = 'geodata_index'

    def get_geosearchservice(self):
        return GeoSearchService(
            self.search_index,
            self.query_key,
            self.geo_query_key,
            self.geodata_index
        )

    def test_geosearchservice_init(self):
        gss = self.get_geosearchservice()

        self.assertEquals(self.search_index, gss.search_index)
        self.assertEquals(self.query_key, gss.query_key)
        self.assertEquals(self.geo_query_key, gss.geo_query_key)
        self.assertEquals(self.geodata_index, gss.geodata_index)

    def test_filter_by_ids_applies_filter(self):
        """
        Test that a filter is correctly applies to the Search object.
        """
        gss = self.get_geosearchservice()

        search = Search()
        search = gss.add_id_filter(search, ['123'])

        self.assertEquals(
            search.to_dict(),
            {'query': {'bool': {'filter': [{'terms': {'_id': ['123']}}]}}}
        )

    @mock.patch('radiam.api.services.Search')
    def test_get_ids_from_geoquery(self, mock_search):
        """
        Test that the object ids are correctly extracted from the results of the
        geoquery.
        """
        object_id = "6cc2a207-12f4-41c6-9eff-6d5d67ef0691"
        hit = Hit({
                "_source": {
                    "object_id": object_id,
                }
            })

        mock_response = mock.MagicMock(spec=Response)
        mock_response.__iter__.return_value = [hit,]

        # mock the chained calls for ES Search object
        from_dict = mock_search.return_value.from_dict
        index = from_dict.return_value.index
        execute = index.return_value.execute
        execute.return_value = mock_response

        gss = self.get_geosearchservice()

        result = gss.get_ids_from_geoquery({'geo_query':{}})

        self.assertEquals(result, [object_id])


class TestSearchService(TestCase):
    def setUp(self):
        self.search_index = 'test_index'
        self.query_key = 'query'

    def test_searchservice_init(self):
        gss = SearchService(
            self.search_index,
            self.query_key
        )

        self.assertEquals(self.search_index, gss.search_index)
        self.assertEquals(self.query_key, gss.query_key)
