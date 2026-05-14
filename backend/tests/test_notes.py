"""Тесты CRUD заметок и XOR-ограничения."""

import pytest
from django.db import IntegrityError
from er_generator.models import TableNote


@pytest.mark.django_db
class TestNotesCRUD:
    def test_create_note_for_schema(self, authed_client, saved_schema):
        r = authed_client.post(
            f'/api/schemas/{saved_schema.id}/notes/',
            data={'type': 'idea', 'table_name': 'users', 'body': 'Add index'},
            format='json',
        )
        assert r.status_code == 201
        assert r.data['type'] == 'idea'

        note = TableNote.objects.get(id=r.data['id'])
        assert note.schema_id == saved_schema.id
        assert note.template_id is None

    def test_patch_note_owner_only(self, authed_client, saved_schema, free_user):
        note = TableNote.objects.create(
            schema=saved_schema, author=free_user,
            type='info', body='original',
        )
        r = authed_client.patch(
            f'/api/notes/{note.id}/',
            data={'body': 'updated'},
            format='json',
        )
        assert r.status_code == 200
        note.refresh_from_db()
        assert note.body == 'updated'

    def test_xor_constraint_blocks_double_fk(self, db, free_user, saved_schema, template):
        with pytest.raises(IntegrityError):
            TableNote.objects.create(
                schema=saved_schema,
                template=template,  # одновременно нельзя
                author=free_user,
                type='info',
                body='broken',
            )
