import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryRepository, type User } from '../src/repo';

test('repo guarda y busca por id', () => {
  const repo = new InMemoryRepository<User>();
  repo.save({ id: 'u1', name: 'Ana', email: 'ana@demo.test' });
  assert.equal(repo.findById('u1')?.name, 'Ana');
  assert.equal(repo.findById('missing'), undefined);
});

test('repo lista elementos', () => {
  const repo = new InMemoryRepository<User>();
  repo.save({ id: 'u1', name: 'Ana', email: 'a@d.test' });
  repo.save({ id: 'u2', name: 'Luis', email: 'l@d.test' });
  assert.equal(repo.list().length, 2);
});
