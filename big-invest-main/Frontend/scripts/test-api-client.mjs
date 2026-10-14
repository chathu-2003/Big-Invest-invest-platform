import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postJson, retryAfterSeconds } from '../src/api/client.js';

const baseUrl = 'http://localhost:8000/api/';
test('JSON payload, headers and configured URL', async () => {
  const result = await postJson('/enquiries', { consent: true }, { baseUrl, fetchImpl: async (url, options) => {
    assert.equal(url, 'http://localhost:8000/api/enquiries');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(options.body), { consent: true });
    return Response.json({ success: true, data: { id: 1 } }, { status: 201 });
  } });
  assert.equal(result.data.id, 1);
});
test('Laravel validation errors are preserved', async () => {
  await assert.rejects(postJson('/enquiries', {}, { baseUrl, fetchImpl: async () => Response.json({ message: 'Invalid', errors: { email: ['Invalid email'] } }, { status: 422 }) }), error => error.status === 422 && error.errors.email[0] === 'Invalid email');
});
test('rate limiting supports seconds, HTTP dates and fallback', async () => {
  assert.equal(retryAfterSeconds('5'), 5);
  assert.equal(retryAfterSeconds('Wed, 01 Jan 2025 00:00:10 GMT', Date.parse('2025-01-01T00:00:00Z')), 10);
  assert.equal(retryAfterSeconds(null), 60);
  await assert.rejects(postJson('/enquiries', {}, { baseUrl, fetchImpl: async () => Response.json({}, { status: 429, headers: { 'Retry-After': '7' } }) }), error => error.status === 429 && error.retryAfter === 7);
});
test('network and server failures are useful without internal details', async () => {
  await assert.rejects(postJson('/enquiries', {}, { baseUrl, fetchImpl: async () => { throw new TypeError('Failed to fetch'); } }), /Unable to connect/);
  await assert.rejects(postJson('/enquiries', {}, { baseUrl, fetchImpl: async () => Response.json({ message: 'private details' }, { status: 500 }) }), /temporarily unavailable/);
});
test('unexpected success content and missing configuration cannot display success', async () => {
  await assert.rejects(postJson('/enquiries', {}, { baseUrl, fetchImpl: async () => new Response('html') }), /unexpected response/);
  await assert.rejects(postJson('/enquiries', {}, { baseUrl: '' }), /not configured/);
});
