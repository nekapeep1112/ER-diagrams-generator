"""Тесты publish/unpublish flow для SavedSchema."""

import pytest
from er_generator.models import SchemaTemplate


@pytest.mark.django_db
class TestPublish:
    def test_publish_creates_template(self, authed_client, saved_schema):
        r = authed_client.post(
            f'/api/schemas/{saved_schema.id}/publish/',
            data={'category': 'SaaS', 'description': 'Тест публикации.'},
            format='json',
        )
        assert r.status_code == 201
        assert r.data['category'] == 'SaaS'
        saved_schema.refresh_from_db()
        assert saved_schema.is_published is True
        assert SchemaTemplate.objects.filter(source_schema=saved_schema).exists()

    def test_double_publish_returns_400(self, authed_client, saved_schema):
        first = authed_client.post(
            f'/api/schemas/{saved_schema.id}/publish/',
            data={'category': 'SaaS'},
            format='json',
        )
        assert first.status_code == 201
        second = authed_client.post(
            f'/api/schemas/{saved_schema.id}/publish/',
            data={'category': 'SaaS'},
            format='json',
        )
        assert second.status_code == 400
        assert second.data['error'] == 'already_published'

    def test_unpublish_removes_template(self, authed_client, saved_schema):
        authed_client.post(
            f'/api/schemas/{saved_schema.id}/publish/',
            data={'category': 'SaaS'},
            format='json',
        )
        r = authed_client.delete(f'/api/schemas/{saved_schema.id}/publish/')
        assert r.status_code == 204

        saved_schema.refresh_from_db()
        assert saved_schema.is_published is False
        assert not SchemaTemplate.objects.filter(source_schema=saved_schema).exists()
