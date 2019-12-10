
from .documents import ESDataset

class _DocumentService:
    """_DocumentService dispatches commands using elasticsearch-dsl Document API
    """
    def __init__(self):
        pass

    def create_doc(self, index_name, doc):
        """
        Create an object and index it

        :param index_name: The Elasticsearch index name
        :param doc: The document to index
        :return: True of the operation succeeded; False otherwise
        """

        result = doc.save(index=index_name)
        return result


    def create_single_doc(self, index_name, doc):
        result = doc.save(index=index_name)
        return result


    def create_many_docs(self, index_name, docs):
        results = []

        for doc in docs:
            dataset = ESDataset(**doc)

            result = dataset.save(index=index_name)
            results.append({"docname": dataset.name, "result": result})

        return results


    def update_doc(self, index_name, pk, updated_doc):
        """
        Update a document

        :param index_name: The Elasticsearch index name
        :param pk: The id of the document to update
        :param updated_doc: The updated document
        :return:
        """
        doc = ESDataset.get(index=index_name, id=pk)
        doc.update(index=index_name, refresh=True, **updated_doc)
        return doc


    def update_doc_partial(self, index_name, pk, doc_updates):
        """
        Update part of a document

        :param index_name: The Elasticsearch index name
        :param pk: The id of the document to update
        :param doc_updates: The parts of the document to update
        """

        # At the moment this functions exactly the same way as update_doc.
        # do we need to distinguish between a full update and a partial update?...
        doc = ESDataset.get(index=index_name, id=pk)
        result = doc.update(index=index_name, refresh=True, **doc_updates)
        return result

    def delete_doc(self, index_name, pk):
        """
        Delete a document

        :param index_name: The Elasticsearch index name
        :param pk: The id of the document to delete
        :return:
        """
        doc = ESDataset.get(index=index_name, id=pk)
        result = doc.delete(index=index_name, refresh=True)
        return result

        # check for existence of deleted doc
        # - would throw NotFoundError
