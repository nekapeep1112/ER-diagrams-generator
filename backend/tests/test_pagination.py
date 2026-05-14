"""Тесты DRF-пагинации (PAGE_SIZE=12)."""

import pytest
from er_generator.models import SchemaTemplate


@pytest.mark.django_db
class TestPagination:
    def test_page_size_12_and_page_2(self, api_client, author_user):
        for i in range(16):
            SchemaTemplate.objects.create(
                author=author_user, name=f'tpl-{i:02d}',
                description='x', category='SaaS',
                er_data={'nodes': [], 'edges': []},
                sql='', sql_dialect='PostgreSQL',
                fork_count=100 - i,
            )
        r1 = api_client.get('/api/templates/?page=1')
        assert r1.status_code == 200
        assert r1.data['count'] == 16
        assert len(r1.data['results']) == 12

        r2 = api_client.get('/api/templates/?page=2')
        assert r2.status_code == 200
        assert len(r2.data['results']) == 4
