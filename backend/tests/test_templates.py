"""Тесты публичных шаблонов: list, search, filter, fork."""

import pytest
from er_generator.models import SavedSchema, SchemaTemplate, Tag
from er_generator.views import FREE_SCHEMA_LIMIT


@pytest.mark.django_db
class TestTemplateList:
    def test_anon_can_list(self, api_client, template):
        r = api_client.get('/api/templates/')
        assert r.status_code == 200
        assert 'results' in r.data
        assert r.data['count'] == 1

    def test_search_q_param(self, api_client, template, author_user):
        SchemaTemplate.objects.create(
            author=author_user, name='Блог', description='Блог-платформа.',
            category='CMS', er_data={'nodes': [], 'edges': []},
            sql='', sql_dialect='PostgreSQL',
        )
        r = api_client.get('/api/templates/?q=Блог')
        assert r.status_code == 200
        names = [t['name'] for t in r.data['results']]
        assert 'Блог' in names
        assert 'Биллинг SaaS' not in names

    def test_filter_category(self, api_client, template, author_user):
        SchemaTemplate.objects.create(
            author=author_user, name='Магазин', description='shop',
            category='E-commerce', er_data={'nodes': [], 'edges': []},
            sql='', sql_dialect='PostgreSQL',
        )
        r = api_client.get('/api/templates/?category=SaaS')
        assert r.status_code == 200
        assert r.data['count'] == 1
        assert r.data['results'][0]['category'] == 'SaaS'

    def test_filter_tags(self, api_client, template, system_tag, author_user):
        other_tag = Tag.objects.create(user=None, name='other-tag', color='#fff')
        other = SchemaTemplate.objects.create(
            author=author_user, name='Other', description='other',
            category='Other', er_data={'nodes': [], 'edges': []},
            sql='', sql_dialect='PostgreSQL',
        )
        other.tags.add(other_tag)

        r = api_client.get(f'/api/templates/?tags={system_tag.id}')
        assert r.status_code == 200
        ids = {t['id'] for t in r.data['results']}
        assert str(template.id) in ids
        assert str(other.id) not in ids


@pytest.mark.django_db
class TestTemplateFork:
    def test_anon_cannot_fork(self, api_client, template):
        r = api_client.post(f'/api/templates/{template.id}/fork/')
        # Без auth → IsAuthenticated → 401 (когда auth-credentials не предоставлены)
        assert r.status_code in (401, 403)

    def test_authed_fork_creates_schema(self, authed_client, template, free_user):
        before = SavedSchema.objects.filter(user=free_user).count()
        r = authed_client.post(f'/api/templates/{template.id}/fork/')
        assert r.status_code == 201
        assert SavedSchema.objects.filter(user=free_user).count() == before + 1

        template.refresh_from_db()
        assert template.fork_count == 11  # был 10, инкремент

        new_schema = SavedSchema.objects.filter(user=free_user).first()
        assert new_schema.name.startswith(template.name)
        assert new_schema.er_data == template.er_data

    def test_fork_respects_free_limit(self, authed_client, template, free_user):
        # Заполняем лимит
        for i in range(FREE_SCHEMA_LIMIT):
            SavedSchema.objects.create(
                user=free_user, name=f'limit{i}',
                er_data={'nodes': [], 'edges': []}, sql='',
            )
        r = authed_client.post(f'/api/templates/{template.id}/fork/')
        assert r.status_code == 403
        assert r.data['error'] == 'limit_reached'
