
from .search_service import _SearchService
from .document_service import _DocumentService
from .index_service import _IndexService

class RadiamService:
    """RadiamService acts as a Facade to other ES-related services.

    This class helps separate responsibilities while providing a single
    interface to ES related functions.

    Args:
        index_name: The Radiam project/Elasticsearch Index name

    Attributes:
        search_service: _SearchService object
        index_service: _IndexService object
        document_service: _DocumentService object
    """

    def __init__(self, index_name):
        self.search_service = _SearchService(index_name)
        self.index_service = _IndexService(index_name)
        self.document_service = _DocumentService()

    def create_index(self, index_name):
        self.index_service.create_index(index_name)

    def delete_index(self, index_name):
        self.index_service.delete_index(index_name)

    def index_exists(self, index_name):
        return self.index_service.index_exists(index_name)

    def index_stats(self, index_name):
        self.index_service.get_stats()

    def execute(self):
        return self.search_service.execute()

    def add_search_id_match(self, id):
        return self.search_service.add_id_match(id)

    def create_single_doc(self, index_name, data):
        return self.document_service.create_single_doc(index_name, data)

    def create_many_docs(self, index_name, data):
        return self.document_service.create_many_docs(index_name, data)

    def update_doc(self, index_name, pk, updated_doc):
        return self.document_service.update_doc(index_name, pk, updated_doc)

    def update_doc_partial(self, index_name, pk, doc_updates):
        return self.document_service.update_doc(index_name, pk, doc_updates)

    def delete_doc(self, index_name, pk):
        return self.document_service.delete_doc(index_name, pk)

    def add_match(self, key, value):
        return self.search_service.add_match(key, value)

    def add_filter(self, key, value):
        return self.search_service.add_filter(key, value)

    def add_generic_search(self, value):
        return self.search_service.add_generic_search(value)

    def get_search(self):
        return self.search_service.search
