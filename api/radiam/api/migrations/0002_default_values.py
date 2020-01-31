# Insert Location Types and Group Roles into DB

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        # The ALL USERS Group
        migrations.RunSQL("INSERT INTO rdm_research_groups (id, name, description, date_created, date_updated, is_active, lft, rght, tree_id, level) VALUES ('cb03b55d-873f-4a0e-8208-07f960fa5032', 'Admin Group', 'The top level group in this Radiam instance', NOW(), NOW(), true, 1, 2, 1, 0);"),

        # Location Types
        migrations.RunSQL("INSERT INTO rdm_location_types (id, label) VALUES ('fd39b7e6-86f9-4b26-8563-32eb3cb88a22', 'location.type.desktop');"),
        migrations.RunSQL("INSERT INTO rdm_location_types (id, label) VALUES ('faaaed1d-dc31-4047-ae08-9571b93b0e2f', 'location.type.laptop');"),
        migrations.RunSQL("INSERT INTO rdm_location_types (id, label) VALUES ('4ef2bf5a-ee68-4e5a-911f-31bb04058627', 'location.type.server');"),
        migrations.RunSQL("INSERT INTO rdm_location_types (id, label) VALUES ('3a16f0c7-7be9-4fb8-9ee8-7248395e06e7', 'location.type.database');"),
        migrations.RunSQL("INSERT INTO rdm_location_types (id, label) VALUES ('4acec0b3-d1e3-48d7-848b-b724b56cdb2b', 'location.type.portal');"),
        migrations.RunSQL("INSERT INTO rdm_location_types (id, label) VALUES ('cb856b59-0a7a-4f47-891f-7632ee3fec16', 'location.type.instrument');"),
        migrations.RunSQL("INSERT INTO rdm_location_types (id, label) VALUES ('8851d904-c6e7-4d95-b189-c06b85bfb8d9', 'location.type.other');"),

        # Group Roles
        migrations.RunSQL("INSERT INTO rdm_group_roles (id, label, description) VALUES ('a59be619-fd9b-462b-8643-486e68f38613', 'group.role.admin.label', 'group.role.admin.description');"),
        migrations.RunSQL("INSERT INTO rdm_group_roles (id, label, description) VALUES ('bb7792ee-c7f6-4815-ae24-506fc00d3169', 'group.role.member.label', 'group.role.member.description');"),
        migrations.RunSQL("INSERT INTO rdm_group_roles (id, label, description) VALUES ('c4e21cc8-a446-4b38-9879-f2af71c227c3', 'group.role.datamanager.label', 'group.role.datamanager.description');"),

        # Sensitivity Levels
        migrations.RunSQL("INSERT INTO rdm_sensitivity_level (id, label) VALUES ('52723147-3796-428f-899e-2865ab676a0f', 'sensitivity.level.none');"),
        migrations.RunSQL("INSERT INTO rdm_sensitivity_level (id, label) VALUES ('595d06b2-d05e-4d63-a842-bbfe205134c7', 'sensitivity.level.humansubjects');"),
        migrations.RunSQL("INSERT INTO rdm_sensitivity_level (id, label) VALUES ('3365e6c7-5ada-4357-a3e7-42bd9ba1a9a6', 'sensitivity.level.intellectualproperty');"),
        migrations.RunSQL("INSERT INTO rdm_sensitivity_level (id, label) VALUES ('ad724976-f8c9-4cda-9e04-72773071f2d4', 'sensitivity.level.harmtopublic');"),
        migrations.RunSQL("INSERT INTO rdm_sensitivity_level (id, label) VALUES ('1f096e8e-0ba5-48ca-93f4-a84b8286b04d', 'sensitivity.level.preexisting');"),
        migrations.RunSQL("INSERT INTO rdm_sensitivity_level (id, label) VALUES ('d4808bdd-dc33-4f92-aaaf-e7fd19180789', 'sensitivity.level.industrypartnership');"),
        migrations.RunSQL("INSERT INTO rdm_sensitivity_level (id, label) VALUES ('72d5242a-75b4-461f-9c19-ce84495a4ca7', 'sensitivity.level.governmentpartnership');"),

        # Data Collection Methods
        migrations.RunSQL("INSERT INTO rdm_data_collection_methods (id, label) VALUES ('a99a3a24-da63-4e46-94e9-c1e3a8c46fee', 'datacollection.method.census');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_methods (id, label) VALUES ('b5917e5d-919a-4f92-9d0f-3defdff85dc4', 'datacollection.method.fieldwork');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_methods (id, label) VALUES ('25590403-1b2c-46fd-96e8-09151a129d76', 'datacollection.method.focusgroup');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_methods (id, label) VALUES ('6c744133-ac64-447b-9153-6b470a7dcdc3', 'datacollection.method.interview');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_methods (id, label) VALUES ('37ca2eb7-a6ed-4724-a33d-dc9674316aee', 'datacollection.method.labwork');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_methods (id, label) VALUES ('1a27ea05-d56a-492b-a05b-21f9877ad674', 'datacollection.method.modelling');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_methods (id, label) VALUES ('f653a6ea-1262-4e0b-9524-1d5a822efee0', 'datacollection.method.simulation');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_methods (id, label) VALUES ('9c035ae8-7f18-41f3-b493-7fc786559140', 'datacollection.method.survey');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_methods (id, label) VALUES ('b6c7f018-4aaf-48ae-9b6f-a090e6c73894', 'datacollection.method.other');"),

        # Distribution Restrictions
        migrations.RunSQL("INSERT INTO rdm_distribution_restriction (id, label) VALUES ('8e9e49ff-a307-4373-98fc-d8fac1c22859', 'distribution.restriction.none');"),
        migrations.RunSQL("INSERT INTO rdm_distribution_restriction (id, label) VALUES ('365f998e-d525-4505-8728-90fb5c99d598', 'distribution.restriction.embargo');"),
        migrations.RunSQL("INSERT INTO rdm_distribution_restriction (id, label) VALUES ('9a0164ea-3c1e-4355-8c9b-283aeed9c036', 'distribution.restriction.projectmembersonly');"),
        migrations.RunSQL("INSERT INTO rdm_distribution_restriction (id, label) VALUES ('f0776576-bb4a-418f-9559-1f82239fb3ce', 'distribution.restriction.needpermissionfromprincipal');"),
        migrations.RunSQL("INSERT INTO rdm_distribution_restriction (id, label) VALUES ('a4e124cd-e2c5-4938-aaa5-c43fd6eef09e', 'distribution.restriction.needpermissionfromgovernment');"),
        migrations.RunSQL("INSERT INTO rdm_distribution_restriction (id, label) VALUES ('5334f652-45bf-49cd-bc7f-a529847cbe7c', 'distribution.restriction.needpermissionfromindustry');"),

        # Data Collection Status
        migrations.RunSQL("INSERT INTO rdm_data_collection_status (id, label) VALUES ('144a7ee6-3b14-46e1-adbb-5f1034b31fd1', 'datacollection.status.planned');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_status (id, label) VALUES ('db4dec28-85cb-4511-a938-1484e2f639f7', 'datacollection.status.inprogress');"),
        migrations.RunSQL("INSERT INTO rdm_data_collection_status (id, label) VALUES ('ad06a00e-21d9-4e65-8453-61f35befd9bb', 'datacollection.status.complete');"),

    ]
