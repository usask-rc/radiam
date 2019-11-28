from datetime import datetime
from elasticsearch_dsl import Document, Date, Nested, Boolean, \
    analyzer, InnerDoc, Completion, Keyword, Text, Integer


class ESDataset(Document):
    """
    Very simple dataset class to test ES with
    """
    # _id = Integer()
    # title = Text()
    #from elasticsearch_dsl import analyzer, tokenizer
    #linux_analyzer = analyzer('linux_path_analyzer',
    #    tokenizer=tokenizer('linux_path_tokenizer', type='path_hierarchy')
    #)
    #agnostic_path = Text(analyzer=linux_analyzer)
    agnostic_path = Text(analyzer='linux_path_analyzer')
    path = Keyword()

    class Meta:
        doc_type = "_doc"

    def save(self, **kwargs):
        self.indexed_date = datetime.now()
        print("Path is" + self.path)
        if self.path:
            self.agnostic_path = self.path.replace('\\', '/')
        return super().save(**kwargs)

    def update(self, **kwargs):
        kwargs['last_modified'] = datetime.now()
        if self.path:
            self.agnostic_path = self.path.replace('\\', '/')
        return super().update(**kwargs)
