"""Глобальные pytest fixtures для тестов backend."""

import pytest


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def free_user(db):
    from django.contrib.auth.models import Group
    from er_generator.models import User, UserProfile
    grp, _ = Group.objects.get_or_create(name='free_user')
    u = User.objects.create_user(
        username='free_user_test',
        email='free@test.local',
        password='testpass123',
        is_email_verified=True,
    )
    u.groups.add(grp)
    UserProfile.objects.create(user=u)
    return u


@pytest.fixture
def pro_user(db):
    from django.contrib.auth.models import Group
    from er_generator.models import User, UserProfile
    grp, _ = Group.objects.get_or_create(name='pro_user')
    u = User.objects.create_user(
        username='pro_user_test',
        email='pro@test.local',
        password='testpass123',
        is_email_verified=True,
    )
    u.groups.add(grp)
    UserProfile.objects.create(user=u)
    return u


def _auth(client, user):
    from er_generator.auth_views import generate_jwt_token
    client.cookies['access_token'] = generate_jwt_token(user)
    return client


@pytest.fixture
def authed_client(api_client, free_user):
    return _auth(api_client, free_user)


@pytest.fixture
def pro_client(api_client, pro_user):
    return _auth(api_client, pro_user)


@pytest.fixture
def author_user(db):
    from django.contrib.auth.models import Group
    from er_generator.models import User
    grp, _ = Group.objects.get_or_create(name='free_user')
    u = User.objects.create_user(
        username='author1', email='author@test.local',
        password='testpass123', is_email_verified=True,
    )
    u.groups.add(grp)
    return u


@pytest.fixture
def system_tag(db):
    from er_generator.models import Tag
    return Tag.objects.create(user=None, name='billing', color='#a855f7')


@pytest.fixture
def template(db, author_user, system_tag):
    from er_generator.models import SchemaTemplate
    er_data = {
        'nodes': [
            {'id': 'workspaces', 'type': 'tableNode',
             'position': {'x': 0, 'y': 0},
             'data': {'tableName': 'workspaces',
                      'columns': [{'name': 'id', 'type': 'UUID',
                                   'isPrimary': True, 'isForeign': False,
                                   'references': None}]}},
        ],
        'edges': [],
    }
    t = SchemaTemplate.objects.create(
        author=author_user,
        name='Биллинг SaaS',
        description='Workspaces, подписки, инвойсы.',
        category='SaaS',
        er_data=er_data,
        sql='CREATE TABLE workspaces (id UUID PRIMARY KEY);',
        sql_dialect='PostgreSQL',
        fork_count=10,
    )
    t.tags.add(system_tag)
    return t


@pytest.fixture
def saved_schema(db, free_user):
    from er_generator.models import SavedSchema
    return SavedSchema.objects.create(
        user=free_user,
        name='Моя схема',
        description='Тестовая схема',
        er_data={'nodes': [], 'edges': []},
        sql='CREATE TABLE x (id UUID);',
        sql_dialect='PostgreSQL',
    )
