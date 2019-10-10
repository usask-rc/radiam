from elasticsearch_dsl import Search


class GeoSearchService:
    """
    Service class for handling the GeoQueries.

    This search performs the Application-side join required to link
    GeoData documents to documents in another index.
    """

    def __init__(self, search_index, query_key, geo_query_key, geodata_index):
        self.search_index = search_index
        self.query_key = query_key
        self.geo_query_key = geo_query_key
        self.geodata_index = geodata_index

    def search(self, request_data):
        """
        Perform the GeoSearch
        """
        search = Search.from_dict(request_data.pop(self.query_key))
        search = search.index(self.search_index)

        ids = self.get_ids_from_geoquery(request_data.pop(self.geo_query_key))
        search = self.add_id_filter(search, ids)

        results = search.execute()
        return results

    def get_ids_from_geoquery(self, geo_query):
        """

        :param geo_query:
        :return:
        """
        geo_search = Search().from_dict(geo_query)
        geo_search = geo_search.index(self.geodata_index)

        geo_results = geo_search.execute()

        ids = [ r.object_id for r in geo_results ]

        return ids

    # def perform_search(self, search):
    #     return search.execute()

    def add_id_filter(self, search, ids):
        """
        Add elasticsearch filter query to restrict by id
        """
        search = search.filter("terms", _id=ids)

        return search


class SearchService:
    """
    Service class for performing standard queries.
    """

    def __init__(self, search_index, query_key):
        self.search_index = search_index
        self.query_key = query_key

    def search(self, request_data):
        """
        Perform the search
        """
        search = Search.from_dict(request_data.pop(self.query_key))
        search = search.index(self.search_index)

        results = search.execute()
        return results
