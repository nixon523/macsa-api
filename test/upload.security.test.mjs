import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import http from 'node:http';
import fs from 'fs';
import path from 'path';
import { signToken } from '../src/security/jwt.js';

let server;
let baseUrl;
let rootUrl;

test.before((_, done) => {
  server = http.createServer(app);
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/api`;
    rootUrl = `http://127.0.0.1:${port}`;
    done();
  });
});

test.after((_, done) => {
  server.close(done);
});

test('Upload Endpoint: Requires Authentication', async () => {
  const res = await fetch(`${baseUrl}/activos/upload-imagen`, {
    method: 'POST',
  });
  assert.equal(res.status, 401);
});

test('Upload Endpoint: Uploads valid image and serves it via static route', async () => {
  const token = signToken({
    sub: 1,
    username: 'admin',
    displayName: 'Admin',
    role: 'admin',
    permissions: ['all'],
  });

  // Create a 1x1 dummy PNG buffer
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82
  ]);

  const formData = new FormData();
  formData.append('image', new Blob([pngHeader], { type: 'image/png' }), 'test_icon.png');

  const res = await fetch(`${baseUrl}/activos/upload-imagen`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.imageUrl.startsWith('/image/'));
  assert.ok(data.filename.endsWith('.png'));

  // Verify static retrieval
  const getRes = await fetch(`${rootUrl}${data.imageUrl}`);
  assert.equal(getRes.status, 200);
  assert.equal(getRes.headers.get('content-type'), 'image/png');

  // Clean up test file
  const filePath = path.join(process.cwd(), 'src', 'image', data.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});
