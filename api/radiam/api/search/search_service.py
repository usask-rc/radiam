
from elasticsearch_dsl import Search
from radiam.api.exceptions import *

from .documents import ESDataset

class _SearchService:
    """_SearchService dispatches commands using elasticsearch-dsl Search API
    """

    def __init__(self, index_name):
        self.search = Search(index=index_name)
        self.search.extra(explain=True)

    def add_filter(self, key, value):
        self.search.filter('term', **{ key : value })
        return self

    def add_match(self, key, value):
        """
        Add a Match query for a 'keyword/unanalyzed' search on the given field. This
        will perform an exact match.

        :param param: tuple containing param name and value
        :return:
        """
        self.search = self.search.query('match', **{key+'__keyword': value})
        return self

    def add_id_match(self, id):
        """
        Add a Match query for a specific document id

        :param id:
        :return:
        """
        self.search = self.search.query('match', **{'_id': id})  # these have to be 'keyword' to be exact matches
        # print(self.search.to_dict())
        return self

    def add_generic_search(self, value):
        """
        Add a MultiMatch query. By default, this query will search over eligible fields.

        :param value: The term to search for
        :return:
        """
        self.search = self.search.query('multi_match', query=value)

        return self

    def add_source_filter(self):
        # TODO: source can be used to exclude certain fields from the results. may need for auth.
        self.search.source(['name','description'])
        return self

    def execute(self):
        return self.search.execute()


    #TODO: Authorization and Permissions requirements will probably affect this class
