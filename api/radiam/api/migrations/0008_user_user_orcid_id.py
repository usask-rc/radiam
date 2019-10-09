# Generated by Django 2.2.6 on 2019-10-08 22:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_auto_20190920_0546'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='user_orcid_id',
            field=models.CharField(blank=True, help_text='The users ORCID identifier', max_length=50, null=True),
        ),

        migrations.AlterField(
            model_name='useragentprojectconfig',
            name='config',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True,
                                                                 help_text='JSON configuration for this project - key/value pairs',
                                                                 null=True),
        )
    ]
