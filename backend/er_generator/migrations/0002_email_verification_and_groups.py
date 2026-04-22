from django.db import migrations, models


def create_groups(apps, schema_editor):
    """Создаёт группы free_user и pro_user с нужными permissions."""
    Group = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')

    # Permissions — стандартные CRUD на ключевые модели
    base_perm_codes = [
        'view_chat', 'add_chat', 'change_chat', 'delete_chat',
        'view_message', 'add_message',
        'view_savedschema', 'add_savedschema', 'change_savedschema', 'delete_savedschema',
    ]
    base_perms = list(Permission.objects.filter(codename__in=base_perm_codes))

    free_group, _ = Group.objects.get_or_create(name='free_user')
    free_group.permissions.set(base_perms)

    pro_group, _ = Group.objects.get_or_create(name='pro_user')
    export_perm = Permission.objects.filter(codename='can_export_schema').first()
    pro_perms = list(base_perms)
    if export_perm:
        pro_perms.append(export_perm)
    pro_group.permissions.set(pro_perms)


def delete_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=['free_user', 'pro_user']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('er_generator', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_email_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='email_verification_token',
            field=models.UUIDField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='email_verification_sent_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterModelOptions(
            name='savedschema',
            options={
                'ordering': ['-created_at'],
                'permissions': [('can_export_schema', 'Can export SQL schema to file')],
            },
        ),
        migrations.RunPython(create_groups, delete_groups),
    ]
