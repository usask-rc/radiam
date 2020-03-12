# Insert Location Types and Group Roles into DB

from django.db import migrations


class Migration(migrations.Migration):
    # Migration script to insert default metadata dependencies for Projects, Datasets, Files and Folders

    dependencies = [
        ('api', '0018_add_hubzero_locationtype'),
    ]

    operations = [
        # Metadata 
        migrations.RunSQL("UPDATE rdm_research_groups set name = 'Radiam' where id = 'cb03b55d-873f-4a0e-8208-07f960fa5032';"),
    ]
