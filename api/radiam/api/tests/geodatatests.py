import json
import uuid
from unittest import mock

from django.contrib.contenttypes.models import ContentType

from elasticsearch import exceptions as es_exceptions

from django.test import TestCase
from radiam.api.models import GeoData
from radiam.api.documents import GeoDataDoc
from radiam.api.serializers import (
    DatasetSerializer, GeoDataSerializer, ContentObjectNameForeignKey
)


class BaseTestCase(TestCase):

    # These may have to be FeatureCollections
    point_geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -106.67724609375,
                    52.14697334064471
                ]
            }
        }]
    }

    polygon_geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -108.74267578125,
                            49.653404588437894
                        ],
                        [
                            -102.63427734374999,
                            49.653404588437894
                        ],
                        [
                            -102.63427734374999,
                            53.31774904749089
                        ],
                        [
                            -108.74267578125,
                            53.31774904749089
                        ],
                        [
                            -108.74267578125,
                            49.653404588437894
                        ]
                    ]
                ]
            }
        }]
    }

    @staticmethod
    def get_model_data(geojson, object_id, content_type):
        return {
            'geojson': geojson,
            'object_id': object_id,
            'content_type': content_type
        }

class TestGeoDataAPI(BaseTestCase):
    """
    Test GeoData object
    """

    fixtures = [
        'grouphierarchy',
        'geodata'
    ]

    @mock.patch("radiam.api.models.GeoData._save_geodata_doc")
    def test_create_geodata_object(self, mock_save_geodata_doc):
        """
        Test that the GeoData object is created properly and that a call to
        create a GeoDataDoc is performed.
        """

        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(self.point_geojson, dataset_id, ctype)

        # geodata = GeoData(geojson=self.point_geojson['geometry'], object_id=dataset_id, content_type=ctype)
        geodata = GeoData(**model_data)
        geodata.save()

        self.assertIsInstance(geodata, GeoData)
        self.assertDictEqual(geodata.geojson, self.point_geojson)
        self.assertEqual(geodata.content_type, ctype)
        self.assertEqual(geodata.object_id, dataset_id)
        mock_save_geodata_doc.assert_called_once()

    @mock.patch("radiam.api.models.GeoData._delete_geodata_doc")
    def test_delete_geodata_object(self, mock_delete_geodata_doc):
        """
        Test that the GeoData object is deleted properly and that a call to
        delete the GeoDataDoc is performed.
        """

        id = '92c6e59b-0654-4ec0-8729-8888f6116c70'
        geodata = GeoData.objects.get(id=id)
        geodata.delete()

        with self.assertRaises(GeoData.DoesNotExist):
            GeoData.objects.get(id=id)
        mock_delete_geodata_doc.assert_called_once()

    @mock.patch("radiam.api.models.GeoDataDoc.get")
    def test_save_geodata_doc_update(self, mock_geodata_doc_get):
        """
        Test that _save_geodata_doc updates an existing GeoDataDoc
        """
        mock_geodata_doc = mock.MagicMock(spec=GeoDataDoc)
        mock_geodata_doc_get.return_value = mock_geodata_doc

        id = '92c6e59b-0654-4ec0-8729-8888f6116c70'
        geodata = GeoData.objects.get(id=id)

        geodata._save_geodata_doc()

        mock_geodata_doc_get.assert_called_once()
        mock_geodata_doc.update.assert_called_once_with(
            model_id=geodata.id,
            geojson=geodata.geojson['features'],
            object_id=geodata.object_id,
            content_type=geodata.content_type.model
        )

    @mock.patch("radiam.api.models.GeoDataDoc.save")
    @mock.patch("radiam.api.models.GeoDataDoc.get")
    def test_save_geodata_doc_create(self, mock_get, mock_save):
        """
        Test that _save_geodata_doc creates a new GeoDataDoc object
        """
        mock_get.side_effect = es_exceptions.NotFoundError

        id = '92c6e59b-0654-4ec0-8729-8888f6116c70'
        geodata = GeoData.objects.get(id=id)
        geodata._save_geodata_doc()

        mock_get.assert_called_once()
        mock_save.assert_called_once()



class TestGeoDataSerializers(BaseTestCase):
    """
    Test GeoData serializer
    """

    fixtures = [
        'grouphierarchy',
    ]

    @mock.patch("radiam.api.models.GeoData._save_geodata_doc")
    def test_create_geodata_serializer(self, mock_save_geodatadoc):
        """
        Test creating GeoData object using the Serializer
        """

        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(self.point_geojson, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        if not gs.is_valid():
            print(gs.errors)
            self.fail('Invalid data supplied to GeoDataSerializer')

        data = gs.validated_data

        geodata_obj = gs.save()

        self.assertTrue(isinstance(geodata_obj, GeoData))
        self.assertEquals(geodata_obj.geojson, self.point_geojson)
        self.assertEquals(str(geodata_obj.object_id), dataset_id)
        self.assertEquals(geodata_obj.content_type_id, ctype.id)

    @mock.patch("radiam.api.models.GeoData._save_geodata_doc")
    def test_update_geometry_geodata_serializer(self, mock_save_geodatadoc):
        """
        Test updating GeoData geometry object using the serializer
        """

        # create a GeoData object
        point_geojson = self.point_geojson
        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(point_geojson, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        if not gs.is_valid():
            self.fail('Invalid data supplied to GeoDataSerializer')

        geodata_obj = gs.save()

        # update the GeoData object
        polygon_geojson = self.polygon_geojson
        model_update_data = self.get_model_data(polygon_geojson, dataset_id, ctype.model)

        gs_update = GeoDataSerializer(instance=geodata_obj, data=model_update_data)
        if not gs_update.is_valid():
            self.fail('Invalid data supplied to GeoDataSerializer')

        geodata_obj = gs_update.save()

        self.assertTrue(isinstance(geodata_obj, GeoData))
        self.assertEquals(geodata_obj.geojson, polygon_geojson)
        self.assertEquals(str(geodata_obj.object_id), dataset_id)
        self.assertEquals(geodata_obj.content_type_id, ctype.id)

    @mock.patch("radiam.api.models.GeoData._save_geodata_doc")
    def test_update_linked_dataset_geodata_serializer(self, mock_save_geodatadoc):
        """
        Test updating linked Dataset using the serializer
        """

        # create a GeoData object
        point_geojson = self.point_geojson
        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(point_geojson, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        if not gs.is_valid():
            self.fail('Invalid data supplied to GeoDataSerializer')

        geodata_obj = gs.save()

        # update the GeoData object
        dataset_id_update = '46e686c6-551a-4b31-a0e5-6a862d43bfce'
        model_update_data = self.get_model_data(point_geojson, dataset_id_update, ctype.model)

        gs_update = GeoDataSerializer(instance=geodata_obj, data=model_update_data)
        if not gs_update.is_valid():
            self.fail('Invalid data supplied to GeoDataSerializer')

        geodata_obj = gs_update.save()

        self.assertTrue(isinstance(geodata_obj, GeoData))
        self.assertEquals(geodata_obj.geojson, point_geojson)
        self.assertEquals(str(geodata_obj.object_id), dataset_id_update)
        self.assertEquals(geodata_obj.content_type_id, ctype.id)

    @mock.patch("radiam.api.models.GeoData._save_geodata_doc")
    def test_update_linked_object_geodata_serializer(self, mock_save_geodatadoc):
        """
        Test updating linked object to Project using serializer
        """

        # create a GeoData object
        point_geojson = self.point_geojson
        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(point_geojson, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        if not gs.is_valid():
            self.fail(gs.errors)

        geodata_obj = gs.save()

        # update the GeoData object
        project_id = '41ee7d02-28be-449f-912f-06fe3590b210'
        ctype_update = ContentType.objects.get(model='project')
        model_update_data = self.get_model_data(point_geojson, project_id, ctype_update.model)

        gs_update = GeoDataSerializer(instance=geodata_obj, data=model_update_data)
        if not gs_update.is_valid():
            self.fail(gs_update.errors)

        geodata_obj = gs_update.save()

        self.assertTrue(isinstance(geodata_obj, GeoData))
        self.assertEquals(geodata_obj.geojson, point_geojson)
        self.assertEquals(str(geodata_obj.object_id), project_id)
        self.assertEquals(geodata_obj.content_type_id, ctype_update.id)

    @mock.patch("radiam.api.models.GeoData._save_geodata_doc")
    def test_create_invalid_geodata_serializer_fail(self, mock_save_geodatadoc):
        """
        Test validation correctly fails in GeoData Serializer during creation
        for incorrect content_type.
        """

        ctype = ContentType.objects.get(model='project')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(self.point_geojson, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)

        if gs.is_valid():
            self.fail("Input should have been invalid")

        self.assertIsNotNone(gs.errors)
        self.assertIn("No Project found with id", json.dumps(gs.errors))

    def test_create_invalid_geojson_string(self):
        """
        Test Validation of geojson field with string value.
        """

        invalid_feature_collection = "Invalid GeoJSON FeatureCollection"

        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(
            invalid_feature_collection, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        gs.is_valid()

        self.assertIsNotNone(gs.errors)
        self.assertIn(
            "This field should contain a GeoJSON FeatureCollection",
            json.dumps(gs.errors))

    def test_create_invalid_geojson_feature(self):
        """
        Test Validation of geojson field with a single GeoJSON Feature.
        """

        invalid_feature_collection = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -106.63330078125,
                    52.13348804077147
                ]
            },
            "properties": {}
        }

        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(
            invalid_feature_collection, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        gs.is_valid()

        self.assertIsNotNone(gs.errors)
        self.assertIn(
            "This field should contain a GeoJSON FeatureCollection",
            json.dumps(gs.errors))

    def test_create_invalid_geojson_incomplete_featurecollection(self):
        """
        Test Validation of geojson field with an incomplete GeoJSON
        FeatureCollection.
        """

        invalid_feature_collection = {
            "type": "FeatureCollection"
        }

        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(
            invalid_feature_collection, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        gs.is_valid()

        self.assertIsNotNone(gs.errors)
        self.assertIn(
            "FeatureCollection should have a 'features' key",
            json.dumps(gs.errors))

    @mock.patch("radiam.api.models.GeoData._save_geodata_doc")
    def test_update_linked_dataset_geodata_serializer_fail(self, mock_save_geodatadoc):
        """
        Test validation correctly fails in GeoData serializer during update
        for non-existent Dataset ID.
        """

        # create a GeoData object
        point_geojson = self.point_geojson
        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(point_geojson, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        if not gs.is_valid():
            self.fail('Invalid data supplied to GeoDataSerializer')

        geodata_obj = gs.save()

        # update the GeoData object
        dataset_id_update = uuid.uuid4()
        model_update_data = self.get_model_data(point_geojson, dataset_id_update, ctype.model)

        gs_update = GeoDataSerializer(instance=geodata_obj, data=model_update_data)
        if gs_update.is_valid():
            self.fail("Input should have been invalid")

        self.assertIsNotNone(gs.errors)
        self.assertIn("No Dataset found with id", json.dumps(gs_update.errors))


    @mock.patch("radiam.api.models.GeoData._save_geodata_doc")
    def test_update_dataset_contenttype_project_id_geodata_serializer_fail(
            self, mock_save_geodatadoc):
        """
        Test validation correctly fails in GeoData serializer during update
        for valid project ID with Dataset content type.
        """

        # create a GeoData object
        point_geojson = self.point_geojson
        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(point_geojson, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        if not gs.is_valid():
            self.fail('Invalid data supplied to GeoDataSerializer')

        geodata_obj = gs.save()

        # update the GeoData object
        project_id_update = "41ee7d02-28be-449f-912f-06fe3590b210"
        model_update_data = self.get_model_data(point_geojson, project_id_update, ctype.model)

        gs_update = GeoDataSerializer(instance=geodata_obj, data=model_update_data)
        if gs_update.is_valid():
            self.fail("Input should have been invalid")

        self.assertIsNotNone(gs_update.errors)
        self.assertIn("No Dataset found with id", json.dumps(gs_update.errors))

    @mock.patch("radiam.api.models.GeoData._save_geodata_doc")
    def test_update_datasetid_project_contenttype_geodata_serializer_fail(
            self, mock_save_geodatadoc):
        """
        Test validation correctly fails in GeoData serializer during update
        current Dataset ID with incorrect content type.
        """

        # create a GeoData object
        point_geojson = self.point_geojson
        ctype = ContentType.objects.get(model='dataset')
        dataset_id = '7492d321-10c7-4cba-9891-e5db63b20bce'
        model_data = self.get_model_data(point_geojson, dataset_id, ctype.model)

        gs = GeoDataSerializer(data=model_data)
        if not gs.is_valid():
            self.fail('Invalid data supplied to GeoDataSerializer')

        geodata_obj = gs.save()

        # update the GeoData object
        project_ctype = ContentType.objects.get(model='project')
        model_update_data = self.get_model_data(
            point_geojson, dataset_id, project_ctype.model)

        gs_update = GeoDataSerializer(instance=geodata_obj, data=model_update_data)
        if gs_update.is_valid():
            self.fail("Input should have been invalid")

        self.assertIsNotNone(gs_update.errors)
        self.assertIn("No Project found with id", json.dumps(gs_update.errors))


class TestContentObjectForeignKeyField(TestCase):
    """
    Test the behavior of the custom ContentType serializer field.
    """

    def test_to_representation(self):
        dataset_ctype = ContentType.objects.get(model='dataset')

        field = ContentObjectNameForeignKey(queryset=ContentType.objects.all())
        representation = (field.to_representation(dataset_ctype))

        self.assertEqual(dataset_ctype.model, representation)

    def test_to_internal_value(self):
        dataset_ctype = ContentType.objects.get(model='dataset')

        field = ContentObjectNameForeignKey(queryset=ContentType.objects.all())
        internal_value = field.to_internal_value(dataset_ctype.model)

        self.assertEqual(dataset_ctype.id, internal_value.id)