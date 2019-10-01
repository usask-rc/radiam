from datetime import datetime
from elasticsearch_dsl import Document, Date, Nested, Boolean, \
    analyzer, InnerDoc, Completion, Keyword, Text, Object, GeoShape


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
