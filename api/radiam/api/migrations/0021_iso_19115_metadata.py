# Insert Location Types and Group Roles into DB

from django.db import migrations, models


class Migration(migrations.Migration):
    # Migration script to insert Datacite 4.2 metadata schema

    dependencies = [
        ('api', '0020_exportrequest'),
    ]

    operations = [
        # Increase the size of the label
        migrations.AlterField('Field', 'label', models.CharField(max_length=255)),
        # Increase the size of the help
        migrations.AlterField('Field', 'help', models.CharField(max_length=255)),

        ## ISO 19115
        # Metadata Schema
        migrations.RunSQL("INSERT INTO rdm_schemas (id, label) VALUES ('b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', 'en.metadata.iso.19115.2014');"),

        # Metadata Fields
        # 1 MD Metadata
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                null, \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                'en.metadata.iso.19115.gmd.MD_Metadata', \
                'en.metadata.iso.19115.gmd.MD_Metadata.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                17);"),

        # 1.1 File Identifier
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                'dbde189b-08fa-4443-9e84-0e334864a9d6', \
                'en.metadata.iso.19115.gmd.fileIdentifier', \
                'en.metadata.iso.19115.gmd.fileIdentifier.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.1.1 File Identifier -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'dbde189b-08fa-4443-9e84-0e334864a9d6', \
                'd75b93b0-5922-431d-812b-300ce8193f46', \
                'en.metadata.iso.19115.gmd.fileIdentifier.CharacterString', \
                'en.metadata.iso.19115.gmd.fileIdentifier.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.2 Language
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                '0fa1f953-2bd4-4470-be72-7e2793269e0f', \
                'en.metadata.iso.19115.gmd.language', \
                'en.metadata.iso.19115.gmd.language.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),
        # 1.2.1 Language -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0fa1f953-2bd4-4470-be72-7e2793269e0f', \
                '6980e58f-9bcc-4f89-adfe-f0c2b83479c4', \
                'en.metadata.iso.19115.gmd.language.CharacterString', \
                'en.metadata.iso.19115.gmd.language.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),
        # 1.3 Characterset
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                '1059c1f3-09be-4d68-9c6c-fd1c7e08073c', \
                'en.metadata.iso.19115.gmd.characterSet', \
                'en.metadata.iso.19115.gmd.characterSet.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),
        # 1.3.1 Characterset -> CharacterSetCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '1059c1f3-09be-4d68-9c6c-fd1c7e08073c', \
                '92c9916d-84bb-4142-b7d8-72963d0a7bae', \
                'en.metadata.iso.19115.gmd.MD_CharacterSetCode', \
                'en.metadata.iso.19115.gmd.MD_CharacterSetCode.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),
        # 1.3.1.1 Characterset -> CharacterSetCode -> codeList
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '92c9916d-84bb-4142-b7d8-72963d0a7bae', \
                '901fd6ac-6b6f-43fb-a206-da1a91f533cc', \
                'en.metadata.iso.19115.gmd.MD_CharacterSetCode.CharacterSetCode.codeList', \
                'en.metadata.iso.19115.gmd.MD_CharacterSetCode.CharacterSetCode.codeList.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),
        # 1.3.1.2 Characterset -> CharacterSetCode -> codeListValue
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '92c9916d-84bb-4142-b7d8-72963d0a7bae', \
                'fa951597-c0e3-44c5-bc5d-e1a9982bf1e5', \
                'en.metadata.iso.19115.gmd.MD_CharacterSetCode.CharacterSetCode.codeListValue', \
                'en.metadata.iso.19115.gmd.MD_CharacterSetCode.CharacterSetCode.codeListValue.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                2);"),
        # 1.3.1.3 Characterset -> CharacterSetCode -> codeSpace
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '92c9916d-84bb-4142-b7d8-72963d0a7bae', \
                '65586f6f-4501-4afb-8f5c-b53044b293c3', \
                'en.metadata.iso.19115.gmd.MD_CharacterSetCode.CharacterSetCode.codeSpace', \
                'en.metadata.iso.19115.gmd.MD_CharacterSetCode.CharacterSetCode.codeSpace.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),
        # 1.4 hierarchyLevel
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                'fab1f655-2546-4850-aa39-fd502854c29b', \
                'en.metadata.iso.19115.gmd.hierarchyLevel', \
                'en.metadata.iso.19115.gmd.hierarchyLevel.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                4);"),
        # 1.4.1 hierarchyLevel -> MD_ScopeCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'fab1f655-2546-4850-aa39-fd502854c29b', \
                '660bea3d-9c67-426a-94af-3e9eef2ac3ea', \
                'en.metadata.iso.19115.gmd.hierarchyLevel.MD_ScopeCode', \
                'en.metadata.iso.19115.gmd.hierarchyLevel.MD_ScopeCode.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),
        # 1.4.1.1 hierarchyLevel -> MD_ScopeCode -> codeList
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '660bea3d-9c67-426a-94af-3e9eef2ac3ea', \
                '7dee6721-65e3-4451-968c-66668203fedd', \
                'en.metadata.iso.19115.gmd.hierarchyLevel.MD_ScopeCode.codeList', \
                'en.metadata.iso.19115.gmd.hierarchyLevel.MD_ScopeCode.codeList.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),
        # 1.4.1.2 hierarchyLevel -> MD_ScopeCode -> codeListValue
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '660bea3d-9c67-426a-94af-3e9eef2ac3ea', \
                '8324d29d-3657-4a89-b05e-a27c7e42b88f', \
                'en.metadata.iso.19115.gmd.hierarchyLevel.MD_ScopeCode.codeListValue', \
                'en.metadata.iso.19115.gmd.hierarchyLevel.MD_ScopeCode.codeListValue.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                2);"),
        # 1.4.1.3 hierarchyLevel -> MD_ScopeCode -> codeSpace
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '660bea3d-9c67-426a-94af-3e9eef2ac3ea', \
                '1dc0d316-67f9-4af1-9dc3-65d03ca9830a', \
                'en.metadata.iso.19115.gmd.hierarchyLevel.MD_ScopeCode.codeSpace', \
                'en.metadata.iso.19115.gmd.hierarchyLevel.MD_ScopeCode.codeSpace.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),

        # 1.5 contact
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                'cbeb3e95-ad5e-42bc-b6bc-33daf2c807ea', \
                'en.metadata.iso.19115.gmd.contact', \
                'en.metadata.iso.19115.gmd.contact.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                5);"),

        # 1.5.1 contact -> CI_ResponsibleParty
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'cbeb3e95-ad5e-42bc-b6bc-33daf2c807ea', \
                '7620fe8f-4f03-46e3-b076-d4315da4b0f2', \
                'en.metadata.iso.19115.gmd.CI_ResponsibleParty', \
                'en.metadata.iso.19115.gmd.CI_ResponsibleParty.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.5.1.1 contact -> CI_ResponsibleParty -> individualName
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '7620fe8f-4f03-46e3-b076-d4315da4b0f2', \
                '95e77b7c-75d3-4d76-8701-9e07a80498d9', \
                'en.metadata.iso.19115.gmd.individualName', \
                'en.metadata.iso.19115.gmd.individualName.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.5.1.1.1 contact -> CI_ResponsibleParty -> individualName -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '95e77b7c-75d3-4d76-8701-9e07a80498d9', \
                '7a1eae98-94d9-4c8e-b2f1-faa455caad43', \
                'en.metadata.iso.19115.gmd.individualName.CharacterString', \
                'en.metadata.iso.19115.gmd.individualName.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.5.1.2 contact -> CI_ResponsibleParty -> organisationName
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '7620fe8f-4f03-46e3-b076-d4315da4b0f2', \
                '970328f2-b13c-498e-b209-137994b5b04f', \
                'en.metadata.iso.19115.gmd.organisationName', \
                'en.metadata.iso.19115.gmd.organisationName.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.5.1.2.1 contact -> CI_ResponsibleParty -> organisationName -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '970328f2-b13c-498e-b209-137994b5b04f', \
                'af20b968-e213-43d5-a8f9-33f7f571ffad', \
                'en.metadata.iso.19115.gmd.organisationName.CharacterString', \
                'en.metadata.iso.19115.gmd.organisationName.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.5.1.3 contact -> CI_ResponsibleParty -> contactInfo
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '7620fe8f-4f03-46e3-b076-d4315da4b0f2', \
                '25a801b9-4507-4b4a-b6c5-8c4d8fbba2e1', \
                'en.metadata.iso.19115.gmd.contactInfo', \
                'en.metadata.iso.19115.gmd.contactInfo.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),

        # 1.5.1.3.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '25a801b9-4507-4b4a-b6c5-8c4d8fbba2e1', \
                '58a1c85d-5ea6-4f93-8c4d-0432f476ec96', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> phone
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '58a1c85d-5ea6-4f93-8c4d-0432f476ec96', \
                '71c07e63-599d-40c8-9db8-61553523b998', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.phone', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.phone.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.1.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> phone -> CI_Telephone
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '71c07e63-599d-40c8-9db8-61553523b998', \
                'a493b7cb-9d46-4fd5-8069-18951b7a5571', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.phone.CI_Telephone', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.phone.CI_Telephone.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.1.1.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> phone -> CI_Telephone -> voice
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'a493b7cb-9d46-4fd5-8069-18951b7a5571', \
                '6417ca65-2be2-49c8-9af1-3f5059752738', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.phone.CI_Telephone.voice', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.phone.CI_Telephone.voice.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.1.1.1.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> phone -> CI_Telephone -> voice -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '6417ca65-2be2-49c8-9af1-3f5059752738', \
                '6a8537d7-87dc-45b4-9bed-91727ce2ccf7', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.phone.CI_Telephone.voice.CharacterString', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.phone.CI_Telephone.voice.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.2 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '58a1c85d-5ea6-4f93-8c4d-0432f476ec96', \
                '687adcef-511e-463a-83ec-7102a8be58f6', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.5.1.3.1.2.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '687adcef-511e-463a-83ec-7102a8be58f6', \
                '638f46f7-0081-44d4-aacb-2efe36243c4c', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.2.1.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> deliveryPoint
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '638f46f7-0081-44d4-aacb-2efe36243c4c', \
                '0da9ee62-5dd7-45a3-8383-a9e1049c883a', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.deliveryPoint', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.deliveryPoint.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.2.1.1.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> deliveryPoint -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0da9ee62-5dd7-45a3-8383-a9e1049c883a', \
                'f931f4e2-d46f-43cc-a6ba-3fca22cb3fee', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.deliveryPoint.CharacterString', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.deliveryPoint.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.2.1.2 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> city
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0da9ee62-5dd7-45a3-8383-a9e1049c883a', \
                'f0ccaebe-49ce-44c6-8883-93119ed71f7d', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.city', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.city.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.5.1.3.1.2.1.2.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> city -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'f0ccaebe-49ce-44c6-8883-93119ed71f7d', \
                '199e3821-303a-429e-a67e-bdeb387eaf39', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.city.CharacterString', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.city.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.2.1.3 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> administrativeArea
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0da9ee62-5dd7-45a3-8383-a9e1049c883a', \
                '9f9e96fa-f53a-44c6-b77c-f60c0c0ded24', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.administrativeArea', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.administrativeArea.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),

        # 1.5.1.3.1.2.1.3.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> administrativeArea -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '9f9e96fa-f53a-44c6-b77c-f60c0c0ded24', \
                '0f50b620-9fc3-464f-95c7-c684c5d63857', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.administrativeArea.CharacterString', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.administrativeArea.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),

        # 1.5.1.3.1.2.1.4 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> postalCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0da9ee62-5dd7-45a3-8383-a9e1049c883a', \
                '7886ceec-63f9-4c2d-8014-97ec9d153cad', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.postalCode', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.postalCode.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                4);"),

        # 1.5.1.3.1.2.1.4.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> postalCode -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '7886ceec-63f9-4c2d-8014-97ec9d153cad', \
                'ee7290ee-c1b2-4ddd-9000-f390af223491', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.postalCode.CharacterString', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.postalCode.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.2.1.5 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> country
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0da9ee62-5dd7-45a3-8383-a9e1049c883a', \
                'dfc50a9e-4e42-445c-a0b8-1fcbc5d29a79', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.country', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.country.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                5);"),

        # 1.5.1.3.1.2.1.5.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> country -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'dfc50a9e-4e42-445c-a0b8-1fcbc5d29a79', \
                '25bb3293-d538-4149-adc2-177124aad88d', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.country.CharacterString', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.country.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.5.1.3.1.2.1.6 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> electronicMailAddress
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0da9ee62-5dd7-45a3-8383-a9e1049c883a', \
                'f7c56dd0-bf94-4dca-b4b5-3b6bdc69dece', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.electronicMailAddress', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.electronicMailAddress.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                6);"),

        # 1.5.1.3.1.2.1.6.1 contact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> electronicMailAddress -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'f7c56dd0-bf94-4dca-b4b5-3b6bdc69dece', \
                '94bb3efd-8b4e-4b12-ac62-4d6455c353b8', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.electronicMailAddress.CharacterString', \
                'en.metadata.iso.19115.gmd.contactInfo.CI_Contact.address.CI_Address.electronicMailAddress.CharacterString.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.5.1.4 contact -> CI_ResponsibleParty -> role
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '7620fe8f-4f03-46e3-b076-d4315da4b0f2', \
                '92aadbc6-f3f9-4d4a-b676-af00cd1c8202', \
                'en.metadata.iso.19115.gmd.role', \
                'en.metadata.iso.19115.gmd.role.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                4);"),

        # 1.5.1.4.1 contact -> CI_ResponsibleParty -> role -> CI_RoleCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '92aadbc6-f3f9-4d4a-b676-af00cd1c8202', \
                '41f5031a-d58c-4c86-9a05-e96feae60b85', \
                'en.metadata.iso.19115.gmd.role.CI_RoleCode', \
                'en.metadata.iso.19115.gmd.role.CI_RoleCode.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.5.1.4.1.1 contact -> CI_ResponsibleParty -> role -> CI_RoleCode -> codeList
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '41f5031a-d58c-4c86-9a05-e96feae60b85', \
                '7c749c85-c33e-4dd3-813b-f072ca494658', \
                'en.metadata.iso.19115.gmd.role.CI_RoleCode.codeList', \
                'en.metadata.iso.19115.gmd.role.CI_RoleCode.codeList.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.5.1.4.1.2 contact -> CI_ResponsibleParty -> role -> CI_RoleCode -> codeListValue
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '41f5031a-d58c-4c86-9a05-e96feae60b85', \
                'ea987049-ef65-43e6-a6f2-4ed6d83cfa9c', \
                'en.metadata.iso.19115.gmd.role.CI_RoleCode.codeListValue', \
                'en.metadata.iso.19115.gmd.role.CI_RoleCode.codeListValue.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                2);"),

        # 1.5.1.4.1.3 contact -> CI_ResponsibleParty -> role -> CI_RoleCode -> codeSpace
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '41f5031a-d58c-4c86-9a05-e96feae60b85', \
                '277e6745-152b-42f0-afb3-18945a403114', \
                'en.metadata.iso.19115.gmd.role.CI_RoleCode.codeSpace', \
                'en.metadata.iso.19115.gmd.role.CI_RoleCode.codeSpace.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),

        # 1.6 dateStamp
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                '54f2d59d-748c-4305-ae25-e8568dd732b2', \
                'en.metadata.iso.19115.gmd.dateStamp', \
                'en.metadata.iso.19115.gmd.dateStamp.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                6);"),

        # 1.6.1 dateStamp -> Date
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '54f2d59d-748c-4305-ae25-e8568dd732b2', \
                'fb1bb099-c1b7-47e9-b526-516fccade8fe', \
                'en.metadata.iso.19115.gmd.dateStamp.Date', \
                'en.metadata.iso.19115.gmd.dateStamp.Date.help', \
                '00a8ffb6-0124-4ec1-846e-e27fd3c7ae03', \
                'b2e7ecd5-2fe8-4c8b-b063-624e2162f262', \
                False, \
                null, \
                1);"),

        # 1.7 metadataStandardName
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                'db5cf0d0-11b3-44d3-b67d-07e91cc58c8f', \
                'en.metadata.iso.19115.gmd.metadataStandardName', \
                'en.metadata.iso.19115.gmd.metadataStandardName.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                7);"),

        # 1.7.1 metadataStandardName -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'db5cf0d0-11b3-44d3-b67d-07e91cc58c8f', \
                'e73966b4-593a-4a4a-8bd8-152fc047f45d', \
                'en.metadata.iso.19115.gmd.metadataStandardName.CharacterString', \
                'en.metadata.iso.19115.gmd.metadataStandardName.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.8 metadataStandardVersion
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                '71e6a92d-84a4-4eed-b81c-52fd62216619', \
                'en.metadata.iso.19115.gmd.metadataStandardVersion', \
                'en.metadata.iso.19115.gmd.metadataStandardVersion.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                8);"),

        # 1.8.1 metadataStandardVersion -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '71e6a92d-84a4-4eed-b81c-52fd62216619', \
                'ce8500b6-fcfe-4482-8206-1efb060a1874', \
                'en.metadata.iso.19115.gmd.metadataStandardVersion.CharacterString', \
                'en.metadata.iso.19115.gmd.metadataStandardVersion.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.9 dataSetURI
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                '46b65de9-7906-4ce0-9fb3-a4df36992a74', \
                'en.metadata.iso.19115.gmd.dataSetURI', \
                'en.metadata.iso.19115.gmd.dataSetURI.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                9);"),

        # 1.9.1 dataSetURI -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '46b65de9-7906-4ce0-9fb3-a4df36992a74', \
                'baacf7a3-47c0-4cc1-9b3d-088a3b4b82d1', \
                'en.metadata.iso.19115.gmd.dataSetURI.CharacterString', \
                'en.metadata.iso.19115.gmd.dataSetURI.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10 identificationInfo
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '82a940a8-9152-47bd-95f6-3cfbc2ce9901', \
                '78774c4c-250e-4d1f-b406-6be263022ad7', \
                'en.metadata.iso.19115.gmd.identificationInfo', \
                'en.metadata.iso.19115.gmd.identificationInfo.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                10);"),

        # 1.10.1 identificationInfo -> MD_DataIdentification
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '78774c4c-250e-4d1f-b406-6be263022ad7', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.1 identificationInfo -> MD_DataIdentification -> citation
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                'aaf1d959-0f49-40f1-ad19-3e13076587be', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.citation', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.citation.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.1.1 identificationInfo -> MD_DataIdentification -> citation -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'aaf1d959-0f49-40f1-ad19-3e13076587be', \
                '671c5b6e-e740-489f-a2cb-7b6628c43fab', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.citation.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.citation.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                True, \
                null, \
                1);"),

        # 1.10.1.2 identificationInfo -> MD_DataIdentification -> abstract
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                'f6e04925-83a2-4b7d-bf72-e00a248866dd', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.abstract', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.abstract.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.10.1.2.1 identificationInfo -> MD_DataIdentification -> abstract -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'f6e04925-83a2-4b7d-bf72-e00a248866dd', \
                'ea4f5ef3-4b0e-4c63-941d-eee2ee4f7eb0', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.abstract.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.abstract.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.3 identificationInfo -> MD_DataIdentification -> purpose
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                'db55f75a-771a-4c00-ab68-e239d28ee3d5', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.purpose', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.purpose.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                3);"),

        # 1.10.1.3.1 identificationInfo -> MD_DataIdentification -> purpose -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'db55f75a-771a-4c00-ab68-e239d28ee3d5', \
                '37413041-932b-4888-8b5b-94442b63fe6b', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.purpose.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.purpose.CharacterString,help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.4 identificationInfo -> MD_DataIdentification -> status
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                '6b2a2575-41d5-4d3d-a76c-348b2e809a42', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                4);"),

        # 1.10.1.4.1 identificationInfo -> MD_DataIdentification -> status -> MD_ProgressCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '6b2a2575-41d5-4d3d-a76c-348b2e809a42', \
                '4cf5f746-6e7e-4fb1-847f-e2de10d07305', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status.MD_ProgressCode', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status.MD_ProgressCode.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.4.1.1 identificationInfo -> MD_DataIdentification -> status -> MD_ProgressCode -> codeList
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '4cf5f746-6e7e-4fb1-847f-e2de10d07305', \
                '6f6512ad-aa3b-48fb-961c-7ab09cb5083c', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status.MD_ProgressCode.codeList', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status.MD_ProgressCode.codeList.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.4.1.2 identificationInfo -> MD_DataIdentification -> status -> MD_ProgressCode -> codeListValue
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '4cf5f746-6e7e-4fb1-847f-e2de10d07305', \
                '28358e27-f310-4292-b0bb-02e7ee7a9179', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status.MD_ProgressCode.codeListValue', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status.MD_ProgressCode..help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                2);"),

        # 1.10.1.4.1.3 identificationInfo -> MD_DataIdentification -> status -> MD_ProgressCode -> codeSpace
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '4cf5f746-6e7e-4fb1-847f-e2de10d07305', \
                '1a426580-daad-44db-b1b8-7d32892b59c8', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status.MD_ProgressCode.codeSpace', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.status.MD_ProgressCode.codeSpace.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),

        # 1.10.1.5 identificationInfo -> MD_DataIdentification -> pointOfContact
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                '4965e36a-623f-4141-83f5-75f5624090b6', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                5);"),

        # 1.10.1.5.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '4965e36a-623f-4141-83f5-75f5624090b6', \
                'f1083c08-f3c7-4dd6-a31d-65f99356ff6c', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                1);"),

        # 1.10.1.5.1.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> individualName
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'f1083c08-f3c7-4dd6-a31d-65f99356ff6c', \
                'a2091851-67be-4ca5-a613-bece6a5a0694', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.individualName', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.individualName.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.1.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> individualName -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'a2091851-67be-4ca5-a613-bece6a5a0694', \
                '5b95bdee-e3ac-4105-8115-d18f564f5a9a', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.individualName.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.individualName.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.2 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> organisationName
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'f1083c08-f3c7-4dd6-a31d-65f99356ff6c', \
                '91614cec-9fb5-4613-a1a8-212e0083d42c', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.organisationName', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.organisationName.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.10.1.5.1.2.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> organisationName -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '91614cec-9fb5-4613-a1a8-212e0083d42c', \
                '75bd334a-0d87-4322-82ee-804628a03a59', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.organisationName.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.organisationName.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'f1083c08-f3c7-4dd6-a31d-65f99356ff6c', \
                '8a1dfd5e-ff29-4767-8b12-7e82bda7e446', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),

        # 1.10.1.5.1.3.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '8a1dfd5e-ff29-4767-8b12-7e82bda7e446', \
                '06e753bc-236f-4009-ac63-a93f0f69af35', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> phone
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '06e753bc-236f-4009-ac63-a93f0f69af35', \
                'cbf47a78-dfde-4dde-b43e-fd05e33885b4', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.phone', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.phone.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.1.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> phone -> CI_Telephone
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'cbf47a78-dfde-4dde-b43e-fd05e33885b4', \
                '406618be-85c0-4edb-9510-a4410d611a26', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.phone.CI_Telephone', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.phone.CI_Telephone.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.1.1.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> phone -> CI_Telephone -> voice
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '406618be-85c0-4edb-9510-a4410d611a26', \
                '882c4b64-e00b-4de4-91ee-4648fd0103e4', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.phone.CI_Telephone.voice', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.phone.CI_Telephone.voice.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.1.1.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> phone -> CI_Telephone -> voice -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '882c4b64-e00b-4de4-91ee-4648fd0103e4', \
                '38fc73a2-9003-4703-b3f0-e8699cd54e80', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.phone.CI_Telephone.voice.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.phone.CI_Telephone.voice.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.2 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '06e753bc-236f-4009-ac63-a93f0f69af35', \
                '0f295fd7-4753-4bf8-9847-72d1c3326960', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.10.1.5.1.3.1.2.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0f295fd7-4753-4bf8-9847-72d1c3326960', \
                '0510eb20-8e0d-4d77-a204-f36a9c336868', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.2.1.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> deliveryPoint
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0510eb20-8e0d-4d77-a204-f36a9c336868', \
                '8dd94d36-9f3b-4e29-8018-52a7bd394eea', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.deliveryPoint', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.deliveryPoint.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.2.1.1.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> deliveryPoint -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '8dd94d36-9f3b-4e29-8018-52a7bd394eea', \
                '6f8a9fe0-d86e-4436-9d7d-8277fb65717a', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.deliveryPoint.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.deliveryPoint.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.2.1.2 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> city
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0510eb20-8e0d-4d77-a204-f36a9c336868', \
                '07351123-f6cc-4654-8622-c848610fc8bb', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.city', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.city.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.10.1.5.1.3.1.2.1.2.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> city -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '07351123-f6cc-4654-8622-c848610fc8bb', \
                'a2b5492e-4493-424f-8c85-deb4b3bcf274', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.city.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.city.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.2.1.3 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> administrativeArea
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0510eb20-8e0d-4d77-a204-f36a9c336868', \
                '5a10be99-f0f9-41e1-abca-81ab212d227c', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.administrativeArea', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.administrativeArea.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),

        # 1.10.1.5.1.3.1.2.1.3.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> administrativeArea -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '5a10be99-f0f9-41e1-abca-81ab212d227c', \
                '020586b3-9517-4f6c-8e6f-eb56535a0cda', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.administrativeArea.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.administrativeArea.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.2.1.4 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> postalCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0510eb20-8e0d-4d77-a204-f36a9c336868', \
                '12f34b44-8246-4bfb-9e5c-cf62dc8517d6', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.postalCode', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.postalCode.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                4);"),

        # 1.10.1.5.1.3.1.2.1.4.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> postalCode -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '12f34b44-8246-4bfb-9e5c-cf62dc8517d6', \
                '971b15c6-115e-45bd-9fae-f7ad03e44e01', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.postalCode.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.postalCode.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.2.1.5 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> country
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0510eb20-8e0d-4d77-a204-f36a9c336868', \
                'c66d71e2-4fee-4dd8-a4a9-dcfd4366072e', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.country', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.country.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                5);"),

        # 1.10.1.5.1.3.1.2.1.5.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> country -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'c66d71e2-4fee-4dd8-a4a9-dcfd4366072e', \
                '086dcf08-4ec2-492d-a801-f0a07eb6bed3', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.country.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.country.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.2.1.6 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> electronicMailAddress
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '0510eb20-8e0d-4d77-a204-f36a9c336868', \
                'a0062d3e-b974-4793-b75b-c3e2694c9f3b', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.electronicMailAddress', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.electronicMailAddress.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                6);"),

        # 1.10.1.5.1.3.1.2.1.6.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> address -> CI_Address -> electronicMailAddress -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'a0062d3e-b974-4793-b75b-c3e2694c9f3b', \
                '4c95a8ff-81cd-4a94-9aeb-4dbc35ff2506', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.electronicMailAddress.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.address.CI_Address.electronicMailAddress.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.3 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> onlineResource
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '06e753bc-236f-4009-ac63-a93f0f69af35', \
                '4e5f7363-9663-41b3-9ce4-0b8a09c16130', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),

        # 1.10.1.5.1.3.1.3.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> onlineResource -> linkage
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '4e5f7363-9663-41b3-9ce4-0b8a09c16130', \
                '6d4957ee-9b8b-4d3f-a690-054b5e0f56c8', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource.linkage', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource.linkage.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.3.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> onlineResource -> linkage -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '6d4957ee-9b8b-4d3f-a690-054b5e0f56c8', \
                '75b4ea9b-9810-4616-940b-9683b1238a1f', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource.linkage.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource.linkage.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.3.1.3.2 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> onlineResource -> linkage
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '4e5f7363-9663-41b3-9ce4-0b8a09c16130', \
                'b81edc9c-4d9e-4a55-a4ff-a03631800e08', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource.protocol', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource.protocol.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.10.1.5.1.3.1.3.2.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> contactInfo -> CI_Contact -> onlineResource -> linkage -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'b81edc9c-4d9e-4a55-a4ff-a03631800e08', \
                'ded583a4-d746-42a1-950e-f572f6374af7', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource.protocol.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.contactInfo.CI_Contact.onlineResource.protocol.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.4 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> role
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'f1083c08-f3c7-4dd6-a31d-65f99356ff6c', \
                '681d0205-92bd-4169-9d99-73be645b6699', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                4);"),

        # 1.10.1.5.1.4.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> role -> CI_RoleCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '681d0205-92bd-4169-9d99-73be645b6699', \
                'fa28d542-2baf-4eaa-8c41-ddada3ea598a', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role.CI_RoleCode', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role.CI_RoleCode.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.4.1.1 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> role -> CI_RoleCode -> codeList
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'fa28d542-2baf-4eaa-8c41-ddada3ea598a', \
                '2f0cea94-fad8-4202-aa2c-c7e405654f85', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role.CI_RoleCode.codeList', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role.CI_RoleCode.codeList.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.5.1.4.1.2 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> role -> CI_RoleCode -> codeListValue
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'fa28d542-2baf-4eaa-8c41-ddada3ea598a', \
                '7bb7872f-cac4-403f-b68f-855155018383', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role.CI_RoleCode.codeListValue', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role.CI_RoleCode.codeListValuehelp', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                2);"),

        # 1.10.1.5.1.4.1.3 identificationInfo -> MD_DataIdentification -> pointOfContact -> CI_ResponsibleParty -> role -> CI_RoleCode -> codeSpace
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'fa28d542-2baf-4eaa-8c41-ddada3ea598a', \
                'a1c44f59-ce90-49f0-8ea5-374afa99c439', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role.CI_RoleCode.codeSpace', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.pointOfContact.CI_ResponsibleParty.role.CI_RoleCode.codeSpace.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),

        # 1.10.1.6 identificationInfo -> MD_DataIdentification -> descriptiveKeywords
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                '258680d8-c753-4083-9a28-30839c44adee', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                6);"),

        # 1.10.1.6.1 identificationInfo -> MD_DataIdentification -> descriptiveKeywords -> MD_Keywords
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '258680d8-c753-4083-9a28-30839c44adee', \
                '378ba8c7-f6a4-480e-880f-9c4c5609a64b', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                1);"),


        # 1.10.1.6.1.1 identificationInfo -> MD_DataIdentification -> descriptiveKeywords -> MD_Keywords -> keyword
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '378ba8c7-f6a4-480e-880f-9c4c5609a64b', \
                '6cb535e3-739b-44c9-892a-979e48c3df86', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.keyword', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.keyword.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                1);"),

        # 1.10.1.6.1.1.1 identificationInfo -> MD_DataIdentification -> descriptiveKeywords -> MD_Keywords -> keyword -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '6cb535e3-739b-44c9-892a-979e48c3df86', \
                '8c47d4c5-bec3-43e6-bf7c-8c2b3d3bb8db', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.keyword.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.keyword.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.6.1.2 identificationInfo -> MD_DataIdentification -> descriptiveKeywords -> MD_Keywords -> type
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '378ba8c7-f6a4-480e-880f-9c4c5609a64b', \
                'b58ca5ea-cacb-41ba-aad5-0e95dfe762cc', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.10.1.6.1.2.1 identificationInfo -> MD_DataIdentification -> descriptiveKeywords -> MD_Keywords -> type -> MD_KeywordTypeCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'b58ca5ea-cacb-41ba-aad5-0e95dfe762cc', \
                'df8b51c8-cef4-42b4-bae0-dee3c5652019', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type.MD_KeywordTypeCode', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type.MD_KeywordTypeCode.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.6.1.2.1.1 identificationInfo -> MD_DataIdentification -> descriptiveKeywords -> MD_Keywords -> type -> MD_KeywordTypeCode -> codeList
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'df8b51c8-cef4-42b4-bae0-dee3c5652019', \
                'bbafadf5-2e6e-4d74-b4c2-6a17773a6251', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type.MD_KeywordTypeCode.codeList', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type.MD_KeywordTypeCode.codeList.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.6.1.2.1.2 identificationInfo -> MD_DataIdentification -> descriptiveKeywords -> MD_Keywords -> type -> MD_KeywordTypeCode -> codeListValue
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'df8b51c8-cef4-42b4-bae0-dee3c5652019', \
                'ae72ed43-7812-4ff2-9ffb-3e689f6790cf', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type.MD_KeywordTypeCode.codeListValue', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type.MD_KeywordTypeCode.codeListValue.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                2);"),

        # 1.10.1.6.1.2.1.3 identificationInfo -> MD_DataIdentification -> descriptiveKeywords -> MD_Keywords -> type -> MD_KeywordTypeCode -> codeSpace
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'df8b51c8-cef4-42b4-bae0-dee3c5652019', \
                'a510a2a9-e85c-4ba0-a3e9-991120f6f37e', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type.MD_KeywordTypeCode.codeSpace', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.type.MD_KeywordTypeCode.codeSpace.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),

        # 1.10.1.6.1.3 identificationInfo -> MD_DataIdentification -> descriptiveKeywords -> MD_Keywords -> thesaurusName
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '378ba8c7-f6a4-480e-880f-9c4c5609a64b', \
                '6a1d1b75-fb64-494c-99d6-ed569929cc2f', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.thesaurusName', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.descriptiveKeywords.MD_Keywords.thesaurusName.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),

        # 1.10.1.7 identificationInfo -> MD_DataIdentification -> resourceConstraints
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                'c479021a-d64d-419c-b3d2-d0c8b5dc9458', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                7);"),

        # 1.10.1.7.1 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'c479021a-d64d-419c-b3d2-d0c8b5dc9458', \
                '586a202d-9e97-4215-8efc-f7b9356d90da', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.7.1.1 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> accessConstraints
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '586a202d-9e97-4215-8efc-f7b9356d90da', \
                '5942b0e2-04d9-495c-bc0a-f7cbf95c93c2', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.7.1.1.1 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> accessConstraints -> MD_RestrictionCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '5942b0e2-04d9-495c-bc0a-f7cbf95c93c2', \
                '2626accb-5a6c-4c5e-9638-3dd577d8bb11', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints.MD_RestrictionCode', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints.MD_RestrictionCode.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.7.1.1.1.1 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> accessConstraints -> MD_RestrictionCode -> codeList
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '2626accb-5a6c-4c5e-9638-3dd577d8bb11', \
                '4ec2731c-8908-4318-a1df-e87dea49a1f1', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints.MD_RestrictionCode.codeList', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints.MD_RestrictionCode.codeList.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.7.1.1.1.2 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> accessConstraints -> MD_RestrictionCode -> codeListValue
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '2626accb-5a6c-4c5e-9638-3dd577d8bb11', \
                '3e5cc97d-483e-494f-9a53-7a9d5420aa56', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints.MD_RestrictionCode.codeListValue', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints.MD_RestrictionCode.codeListValue.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                2);"),

        # 1.10.1.7.1.1.1.3 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> accessConstraints -> MD_RestrictionCode -> codeSpace
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '2626accb-5a6c-4c5e-9638-3dd577d8bb11', \
                '3c3d2e33-9f5f-4e8e-b62d-4db242d7719c', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints.MD_RestrictionCode.codeSpace', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.accessConstraints.MD_RestrictionCode.codeSpace.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),

        # 1.10.1.7.1.2 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> useConstraints
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '586a202d-9e97-4215-8efc-f7b9356d90da', \
                '78729779-d7b2-4377-99dd-1ddc88701678', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.10.1.7.1.2.1 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> useConstraints -> MD_RestrictionCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '78729779-d7b2-4377-99dd-1ddc88701678', \
                '91270f06-9305-4670-ba56-d24e1dd382fd', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints.MD_RestrictionCode', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints.MD_RestrictionCode.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.7.1.2.1.1 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> useConstraints -> MD_RestrictionCode -> codeList
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '91270f06-9305-4670-ba56-d24e1dd382fd', \
                '87a303fb-5eff-4046-81ed-457c7c1b5bff', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints.MD_RestrictionCode.codeList', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints.MD_RestrictionCode.codeList.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.7.1.2.1.2 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> useConstraints -> MD_RestrictionCode -> codeListValue
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '91270f06-9305-4670-ba56-d24e1dd382fd', \
                '0d0e04d8-9d5f-4f97-8c89-823f106f8994', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints.MD_RestrictionCode.codeListValue', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints.MD_RestrictionCode.codeListValue.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                2);"),

        # 1.10.1.7.1.2.1.3 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> useConstraints -> MD_RestrictionCode -> codeSpace
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '91270f06-9305-4670-ba56-d24e1dd382fd', \
                'f03572ff-ea71-4651-91e7-5552773cb0e1', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints.MD_RestrictionCode.codeSpace', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.useConstraints.MD_RestrictionCode.codeSpace.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),

        # 1.10.1.7.1.3 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> otherConstraints
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '586a202d-9e97-4215-8efc-f7b9356d90da', \
                '152296d2-cdda-477d-bb5a-10b89d69bb21', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.otherConstraints', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.otherConstraints.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),

        # 1.10.1.7.1.3.1 identificationInfo -> MD_DataIdentification -> resourceConstraints -> MD_LegalConstraints -> otherConstraints -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '152296d2-cdda-477d-bb5a-10b89d69bb21', \
                '60927576-7113-4037-8746-3ba8e81b71e1', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.otherConstraints.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.resourceConstraints.MD_LegalConstraints.otherConstraints.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.8 identificationInfo -> MD_DataIdentification -> language
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                'a5001044-a34c-4458-9ce3-2055078ce68d', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.language', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.language.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                8);"),

        # 1.10.1.8.1 identificationInfo -> MD_DataIdentification -> language -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'a5001044-a34c-4458-9ce3-2055078ce68d', \
                '74dd1e36-d54d-4740-b535-fe5829e03b28', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.language.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.language.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                True, \
                null, \
                1);"),

        # 1.10.1.9 identificationInfo -> MD_DataIdentification -> topicCategory
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                'd2f4a6c0-5927-4e4e-9491-96f85635eeb7', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.topicCategory', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.topicCategory.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                9);"),

        # 1.10.1.9.1 identificationInfo -> MD_DataIdentification -> topicCategory -> MD_TopicCategoryCode
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'd2f4a6c0-5927-4e4e-9491-96f85635eeb7', \
                '8fd5dd16-8705-4664-8a3c-7b3fe508be47', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.topicCategory.MD_TopicCategoryCode', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.topicCategory.MD_TopicCategoryCode.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                True, \
                null, \
                1);"),

        # 1.10.1.10 identificationInfo -> MD_DataIdentification -> extent
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                'e7164399-396b-4cd3-b496-31c3242406ce', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                10);"),

        # 1.10.1.10.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'e7164399-396b-4cd3-b496-31c3242406ce', \
                '67b596af-e458-4cad-8dda-7d77646e2d4c', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                1);"),

        # 1.10.1.10.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> id
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '67b596af-e458-4cad-8dda-7d77646e2d4c', \
                '565377d3-578f-4074-b133-79a424aceb88', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.id', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.id.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.2 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '67b596af-e458-4cad-8dda-7d77646e2d4c', \
                'c0fa731c-73aa-45c7-bd06-86da2f6a283d', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                2);"),

        # 1.10.1.10.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'c0fa731c-73aa-45c7-bd06-86da2f6a283d', \
                'd5ba5379-42d5-4ebb-9e8d-7b8f843f4135', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                1);"),

        # 1.10.1.10.1.1.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox -> id
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'd5ba5379-42d5-4ebb-9e8d-7b8f843f4135', \
                'eae5c5d3-3b66-4821-83f0-cf95ae2f9510', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.id', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.id.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.1.1.2 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox -> westBoundLongitude
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'd5ba5379-42d5-4ebb-9e8d-7b8f843f4135', \
                'cd16d98d-51a4-448f-98e4-ec335c8be22c', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.westBoundLongitude', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.westBoundLongitude.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                2);"),

        # 1.10.1.10.1.1.1.2.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox -> westBoundLongitude -> Decimal
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'cd16d98d-51a4-448f-98e4-ec335c8be22c', \
                '033a1642-5a5b-4150-af4f-d8791171d63f', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.westBoundLongitude.Decimal', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.westBoundLongitude.Decimal.help', \
                '4de681a6-0462-41bf-8151-8d58e047b67e', \
                '3b0f0c91-f5fd-4d5c-aaa8-40a61d822e97', \
                False, \
                null, \
                2);"),

        # 1.10.1.10.1.1.1.3 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox -> eastBoundLongitude
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'd5ba5379-42d5-4ebb-9e8d-7b8f843f4135', \
                '38a69b85-5a49-4a85-a9ae-3114323ba2cb', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.eastBoundLongitude', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.eastBoundLongitude.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),

        # 1.10.1.10.1.1.1.3.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox -> eastBoundLongitude -> Decimal
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '38a69b85-5a49-4a85-a9ae-3114323ba2cb', \
                '99235e74-e4d7-4793-9dbb-422eafcc7e14', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.eastBoundLongitude.Decimal', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.eastBoundLongitude.Decimal.help', \
                '4de681a6-0462-41bf-8151-8d58e047b67e', \
                '3b0f0c91-f5fd-4d5c-aaa8-40a61d822e97', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.1.1.4 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox -> southBoundLatitude
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'd5ba5379-42d5-4ebb-9e8d-7b8f843f4135', \
                '62c42b4b-6165-465c-83c3-d7393c090110', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.southBoundLatitude', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.southBoundLatitude.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                4);"),

        # 1.10.1.10.1.1.1.4.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox -> southBoundLatitude -> Decimal
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '62c42b4b-6165-465c-83c3-d7393c090110', \
                '078b6022-0695-429c-80f6-bc03ec11f90e', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.southBoundLatitude.Decimal', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.southBoundLatitude.Decimal.help', \
                '4de681a6-0462-41bf-8151-8d58e047b67e', \
                '3b0f0c91-f5fd-4d5c-aaa8-40a61d822e97', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.1.1.5 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox -> northBoundLatitude
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'd5ba5379-42d5-4ebb-9e8d-7b8f843f4135', \
                '647811d6-f323-4e81-ba89-45d6fd707d32', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.northBoundLatitude', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.northBoundLatitude.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                5);"),

        # 1.10.1.10.1.1.1.5.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_GeographicBoundingBox -> northBoundLatitude -> Decimal
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '647811d6-f323-4e81-ba89-45d6fd707d32', \
                '9e20a8a6-4507-4ec7-b6df-2648eb5a9ca1', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.northBoundLatitude.Decimal', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_GeographicBoundingBox.northBoundLatitude.Decimal.help', \
                '4de681a6-0462-41bf-8151-8d58e047b67e', \
                '3b0f0c91-f5fd-4d5c-aaa8-40a61d822e97', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.2 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'c0fa731c-73aa-45c7-bd06-86da2f6a283d', \
                '77099c44-ac1a-4310-bbd5-a65b510c5388', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                2);"),

        # 1.10.1.10.1.2.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '77099c44-ac1a-4310-bbd5-a65b510c5388', \
                'e25f566f-1258-495e-b47c-1964b0ffd74f', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                1);"),

        # 1.10.1.10.1.2.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon -> Point
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'e25f566f-1258-495e-b47c-1964b0ffd74f', \
                '3e6e0bdd-cd55-469a-b64b-de2e40fdda88', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Point', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Point.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                1);"),

        # 1.10.1.10.1.2.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon -> Point -> coordinates
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '3e6e0bdd-cd55-469a-b64b-de2e40fdda88', \
                'e9619ca3-f180-4712-aa3b-2790699a29db', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Point.coordinates', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Point.coordinates.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.2.2 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon -> Polygon
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'e25f566f-1258-495e-b47c-1964b0ffd74f', \
                'cfdac22b-7558-4eb0-be74-377ac283a616', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                2);"),

        # 1.10.1.10.1.2.2.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon -> Polygon -> exterior
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'cfdac22b-7558-4eb0-be74-377ac283a616', \
                '422f06df-32be-4cf4-9f5e-dc3edbeca991', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.exterior', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.exterior.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.2.2.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon -> Polygon -> exterior -> LinearRing
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '422f06df-32be-4cf4-9f5e-dc3edbeca991', \
                '24b63491-7f0a-428e-ad11-6a4643657fb7', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.exterior.LinearRing', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.exterior.LinearRing.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.2.2.1.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon -> Polygon -> exterior -> LinearRing -> coordinates
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '24b63491-7f0a-428e-ad11-6a4643657fb7', \
                'dc3c20f9-0b6e-455f-879b-e03d3f6e4086', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.exterior.LinearRing.coordinates', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.exterior.LinearRing.coordinates.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.2.2.2.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon -> Polygon -> interior
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'cfdac22b-7558-4eb0-be74-377ac283a616', \
                '4421e53e-42f4-49ee-b206-a474a51f305f', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.interior', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.interior.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.2.2.2.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon -> Polygon -> interior -> LinearRing
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '4421e53e-42f4-49ee-b206-a474a51f305f', \
                '406dec1c-2812-4e66-a71e-dd763f1e7504', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.interior.LinearRing', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.interior.LinearRing.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.2.2.2.1.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> geographicElement -> EX_BoundingPolygon -> polygon -> Polygon -> interior -> LinearRing -> coordinates
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '406dec1c-2812-4e66-a71e-dd763f1e7504', \
                '3f83e053-76a9-4f7b-aac8-053335ca880e', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.interior.LinearRing.coordinates', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.geographicElement.EX_BoundingPolygon.polygon.Polygon.interior.LinearRing.coordinates.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.3 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> temporalElement
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '67b596af-e458-4cad-8dda-7d77646e2d4c', \
                '2e14a90b-0e59-41cf-b0e4-79d638931dc6', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                3);"),

        # 1.10.1.10.1.3.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> temporalElement -> EX_TemporalExtent
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '2e14a90b-0e59-41cf-b0e4-79d638931dc6', \
                '392679b8-d426-4c74-8a5f-80ec53d31b69', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.3.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> temporalElement -> EX_TemporalExtent -> extent
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '392679b8-d426-4c74-8a5f-80ec53d31b69', \
                '6f616be3-98db-4153-b896-2955d4125c40', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.3.1.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> temporalElement -> EX_TemporalExtent -> extent -> TimePeriod
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '6f616be3-98db-4153-b896-2955d4125c40', \
                '83acc232-11bd-4cbe-a442-9e972524b969', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                True, \
                null, \
                1);"),

        # 1.10.1.10.1.3.1.1.1.1 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> temporalElement -> EX_TemporalExtent -> extent -> TimePeriod -> id
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '83acc232-11bd-4cbe-a442-9e972524b969', \
                '4bd2b2ad-7cc1-4955-b1f3-09900310ce19', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod.id', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod.id.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                1);"),

        # 1.10.1.10.1.3.1.1.1.2 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> temporalElement -> EX_TemporalExtent -> extent -> TimePeriod -> description
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '83acc232-11bd-4cbe-a442-9e972524b969', \
                'b23176c0-3415-4604-8c86-5bfdf20dda04', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod.description', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod.description.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                2);"),

        # 1.10.1.10.1.3.1.1.1.3 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> temporalElement -> EX_TemporalExtent -> extent -> TimePeriod -> beginPosition
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '83acc232-11bd-4cbe-a442-9e972524b969', \
                '844525ea-8780-4893-a24f-6d6ffc044092', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod.beginPosition', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod.beginPosition.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                3);"),

        # 1.10.1.10.1.3.1.1.1.4 identificationInfo -> MD_DataIdentification -> extent -> EX_Extent -> temporalElement -> EX_TemporalExtent -> extent -> TimePeriod -> endPosition
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '83acc232-11bd-4cbe-a442-9e972524b969', \
                '2c4ac1aa-0c41-440c-8e12-109681d56c79', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod.endPosition', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.extent.EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod.endPosition.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                False, \
                null, \
                4);"),

        # 1.10.1.11 identificationInfo -> MD_DataIdentification -> supplementalInformation
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                '28f1d340-c5b1-4be0-89ef-fe1fb327db86', \
                'eabb2148-d540-48f0-beb3-a3978b950e57', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.supplementalInformation', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.supplementalInformation.help', \
                'e2c6f819-5ef3-4104-ae04-480f3fd48d73', \
                '03bf8631-94a1-41e5-b91d-e8c7c4902125', \
                False, \
                null, \
                11);"),

        # 1.10.1.11.1 identificationInfo -> MD_DataIdentification -> supplementalInformation -> CharacterString
        migrations.RunSQL("INSERT INTO rdm_fields (schema_id, parent_id, id, label, help, metadata_ui_type_id, metadata_value_type_id, many_values, choice_list_id, default_order) \
            VALUES ( \
                'b36b79b2-55bd-4e90-ad0e-b1b72086c2d6', \
                'eabb2148-d540-48f0-beb3-a3978b950e57', \
                '269f935b-ac7c-45ea-89e7-db0c91f30b33', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.supplementalInformation.CharacterString', \
                'en.metadata.iso.19115.gmd.identificationInfo.MD_DataIdentification.supplementalInformation.CharacterString.help', \
                '9a8b45b0-ed13-4524-8f7d-0059ec3c156e', \
                'e079c97d-9f5c-4dbc-8acb-b21c21827f1b', \
                True, \
                null, \
                1);"),

        ]

