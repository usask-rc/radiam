
from elasticsearch.exceptions import NotFoundError
from elasticsearch_dsl import Index
from .exceptions import IndexNotCreatedException

class _IndexService:
    """_IndexService dispatches commands using elasticsearch-dsl Index API
    """

    def __init__(self, index_name):
        self.index = Index(index_name)

    def create_index(self, index_name):
        """
        Create an index of the given name

        :param index_name: The name of the index to create
        :return:
        """

        index = Index(index_name)
        index.create()

        if not index.exists():
            raise IndexNotCreatedException
        # ES-dsl Index create does not return a message

    def delete_index(self, index_name):
        """
        Delete the index with the given name

        :param index_name: The Elasticsearch index name
        :return:
        """

        index = Index(index_name)

        try:
            index.delete()
        except NotFoundError:
            pass
            # print('Index {} not found. Deleting Project'.format(index_name))
            # TODO this may need to be refactored. Should any logging be done?

        # what gets returned?

    def index_exists(self, index_name):
        index = Index(index_name)
        return index.exists()

    def get_stats(self):
        return self.index.stats()