from datetime import datetime
from elasticsearch_dsl import Document, Date, Nested, Boolean, \
    analyzer, InnerDoc, Completion, Keyword, Text, Object, GeoShape

class DatasetMetadataDoc(Document):
    """
    Document class for Dataset Metadata
    """

    name = Keyword()
    project = Keyword()
    title = Keyword()
    abstract = Keyword()
    study_site = Keyword()
    distribution_restriction =  Keyword()
    data_collection_status = Keyword()
    date_created = Date()
    date_modified = Date()

    class Index:
        name = 'dataset_metadata'


class GeoJSONFeature(InnerDoc):
    """
    InnerDoc describing GeoJSON Feature
    """
    geometry = GeoShape()
    type = Keyword()
    properties = Object()


class GeoDataDoc(Document):
    """
    Document class for GeoData model
    """

    model_id = Keyword()
    object_id = Keyword()
    content_type = Keyword()

    geojson = Object(GeoJSONFeature)

    class Index:
        name = 'geodata'

    def save(self, **kwargs):

        self.created_at = datetime.now()
        return super().save(**kwargs)


class ProjectMetadataDoc(Document):
    """
    Document class for Project metadata
    """

    name = Keyword()
    group = Keyword()
    keywords = Keyword()
    primary_contact_user = Keyword()
    date_modified = Date()
    date_updated = Date()

    class Index:
        name = 'project_metadata'


class ResearchGroupMetadataDoc(Document):
    """
    Document class for Research Group metadata
    """

    name = Keyword()
    description = Keyword()
    date_created = Date()
    date_updated = Date()
    is_active = Boolean()

    class Index:
        name = 'research_group_metadata'
