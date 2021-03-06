# Generated by Django 2.2.3 on 2019-07-25 21:31

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_project_avatars'),
    ]

    operations = [
        migrations.AddField(
            model_name='useragent',
            name='version',
            field=models.CharField(default='0.0.0', help_text='The version of the Agent', max_length=20),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name='UserAgentProjectConfig',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('config', django.contrib.postgres.fields.jsonb.JSONField(help_text='JSON config key/value pairs')),
                ('agent', models.ForeignKey(help_text='The User Agent', on_delete=django.db.models.deletion.PROTECT, to='api.UserAgent')),
                ('project', models.ForeignKey(help_text='The Project', on_delete=django.db.models.deletion.PROTECT, to='api.Project')),
            ],
            options={
                'db_table': 'rdm_user_agent_project_config',
            },
        ),
    ]
