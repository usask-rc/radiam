# Insert Location Types and Group Roles into DB

from django.db import migrations


class Migration(migrations.Migration):
    # Migration script to insert default metadata dependencies for Projects, Datasets, Files and Folders

    dependencies = [
        ('api', '0009_add_metadata'),
    ]

    operations = [
        # Metadata UI Types
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('8f27c9ed-2869-4487-9c52-75e413989107', 'boolean', 'metadata.ui.type.boolean');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('e2c6f819-5ef3-4104-ae04-480f3fd48d73', 'container', 'metadata.ui.type.container');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('d46f100f-be56-4eef-b395-832f07252122', 'date', 'metadata.ui.type.date');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('00a8ffb6-0124-4ec1-846e-e27fd3c7ae03', 'dateYear', 'metadata.ui.type.dateYear');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('8d191eeb-1bc1-45d2-b56a-52724ddb72bb', 'email', 'metadata.ui.type.email');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('329bc479-0b2d-4612-9b2c-2f62c35da375', 'integer', 'metadata.ui.type.integer');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('4de681a6-0462-41bf-8151-8d58e047b67e', 'float', 'metadata.ui.type.float');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('97011600-29aa-4450-af6c-6777e2a6ef4a', 'select', 'metadata.ui.type.select');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('9a8b45b0-ed13-4524-8f7d-0059ec3c156e', 'text', 'metadata.ui.type.text');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_ui_types (id, key, label) VALUES ('c832143b-9cc4-40c3-82c2-6bb4dc0ebc39', 'url', 'metadata.ui.type.url');"),

        # Metadata Value Types
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('036281cb-da27-49cf-a453-13e9701c47a7', 'boolean', 'metadata.value.type.boolean');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('b2e7ecd5-2fe8-4c8b-b063-624e2162f262', 'date', 'metadata.value.type.date');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('5cc0dbb7-f68d-47e5-a01c-2558a9a2febc', 'double', 'metadata.value.type.double');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('3b0f0c91-f5fd-4d5c-aaa8-40a61d822e97', 'float', 'metadata.value.type.float');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('a0cf8d2e-e4ab-4c15-8e5f-c2670ba19db8', 'integer', 'metadata.value.type.integer');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('8f6a6b5d-4353-448d-b931-2b559d8b281d', 'keyword', 'metadata.value.type.keyword');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('7be5e07e-1b3f-47df-a8ac-bd7dd59d865a', 'long', 'metadata.value.type.long');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('03bf8631-94a1-41e5-b91d-e8c7c4902125', 'object', 'metadata.value.type.object');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('e4b56687-b5b0-4c98-b6ff-aa4cac801f80', 'nested', 'metadata.value.type.nested');"),
        migrations.RunSQL("INSERT INTO rdm_metadata_value_types (id, key, label) VALUES ('e079c97d-9f5c-4dbc-8acb-b21c21827f1b', 'text', 'metadata.value.type.text');"),

    ]
