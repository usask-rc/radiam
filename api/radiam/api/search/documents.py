from datetime import datetime
from elasticsearch_dsl import Document, Date, Nested, Boolean, \
    analyzer, InnerDoc, Completion, Keyword, Text, Integer


class ESDataset(Document):
    """
    Very simple dataset class to test ES with
    """
    # _id = Integer()
    # title = Text()

    class Meta:
        doc_type = "_doc"

    def save(self, **kwargs):
        self.indexed_date = datetime.now()
        return super().save(**kwargs)

    def update(self, **kwargs):
        kwargs['last_modified'] = datetime.now()
        return super().update(**kwargs)
