from datetime import datetime
from elasticsearch_dsl import Document, Date, Nested, Boolean, \
    analyzer, InnerDoc, Completion, Keyword, Text, Integer, tokenizer


class ESDataset(Document):
    """
    Very simple dataset class to test ES with
    """
    # _id = Integer()
    # title = Text()

    # agnostic_path is the same content as path but all backslashes (\) which
    # are found in windows paths have been replaced by forward slashes (/). This
    # allows us to use the same analyzer (linux_path_analyzer) to break paths
    # into their parts based on directories but display them with the proper
    # windows paths.
    linux_analyzer = analyzer('linux_path_analyzer',
        tokenizer=tokenizer('linux_path_tokenizer', type='path_hierarchy')
    )
    path = Text(analyzer=linux_analyzer,
            fields={ "keyword" : Keyword(),
                "agnostic": Text(analyzer=linux_analyzer, fields={ "keyword" : Keyword() }) })
    path_parent = Text(analyzer=linux_analyzer, fields={"keyword": Keyword()})
    # Type is set to a keyword so that it will be possible to sort on it.
    type = Keyword()

    class Meta:
        doc_type = "_doc"

    def save(self, **kwargs):
        self.indexed_date = datetime.now()
        if self.path_parent:
            self.path_parent_keyword = self.path_parent
        if self.path:
            self.path_keyword = self.path
            agnostic = self.path.replace('\\', '/')
            self.path_agnostic = agnostic
            self.path_agnostic_keyword = agnostic
        return super().save(**kwargs)

    def update(self, **kwargs):
        kwargs['last_modified'] = datetime.now()
        if self.path_parent:
            self.path_parent_keyword = self.path_parent
        if self.path:
            self.path_keyword = self.path
            agnostic = self.path.replace('\\', '/')
            self.path_agnostic = agnostic
            self.path_agnostic_keyword = agnostic
        return super().update(**kwargs)
