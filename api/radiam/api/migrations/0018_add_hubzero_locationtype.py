# Insert Location Types and Group Roles into DB

from django.db import migrations


class Migration(migrations.Migration):
    # Migration script to insert default metadata dependencies for Projects, Datasets, Files and Folders

    dependencies = [
        ('api', '0017_locationproject'),
    ]

    operations = [
        # Metadata 
        migrations.RunSQL("INSERT INTO rdm_location_types (id, label) VALUES ('54d23b99-d5ce-48dd-abd2-053538c2f945', 'location.type.hubzero');"),
    ]
