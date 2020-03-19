# Generated by Django 2.2.10 on 2020-03-11 19:41

from django.db import migrations, models
import radiam.api.mixins
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_add_hubzero_locationtype'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExportRequest',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(help_text='The status of this export request', max_length=100)),
                ('export_reference', models.UUIDField(blank=True, default=uuid.uuid4, help_text='The reference to the exported contents', null=True)),
            ],
            options={
                'db_table': 'rdm_export_requests',
            },
            bases=(models.Model, radiam.api.mixins.DatasetPermissionMixin),
        ),
    ]
