/**
 * ViewTube Backend API Integration Test Suite
 * Tests REST API routes: /api/videos, /api/videos/search, /api/auth, /api/comments
 */

import { app } from '../../backend/src/app';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function assert(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err?.message || String(err) });
    console.error(`  ✗ ${name}: ${err?.message || err}`);
  }
}

async function runTests() {
  console.log('\n--- Running ViewTube Backend Integration Tests ---');

  // We can test the app directly using node fetch or simulated request
  // Let's spin up an ephemeral listener or test services
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3000;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // 1. Health check
    await assert('GET /api/health returns 200 and healthy status', async () => {
      const res = await fetch(`${baseUrl}/health`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (body.status !== 'healthy') throw new Error(`Expected healthy, got ${body.status}`);
    });

    // 2. Videos list
    await assert('GET /api/videos returns list of videos with count', async () => {
      const res = await fetch(`${baseUrl}/videos`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !Array.isArray(body.data) || body.data.length === 0) {
        throw new Error('Expected video array with elements');
      }
    });

    // 3. Search videos
    await assert('GET /api/videos?search=bunny returns matched video', async () => {
      const res = await fetch(`${baseUrl}/videos?search=bunny`);
      const body = await res.json();
      if (!body.success || body.data.length === 0) {
        throw new Error('Expected bunny search results');
      }
      if (!body.data[0].title.toLowerCase().includes('bunny')) {
        throw new Error(`Unexpected title: ${body.data[0].title}`);
      }
    });

    // 4. Auth login
    await assert('POST /api/auth/login validates identifier and authenticates', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrHandle: 'alex@viewtube.io' }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !body.data || !body.token) {
        throw new Error('Expected user data and token in login response');
      }
    });

    // 5. Comments retrieval
    await assert('GET /api/videos/:id/comments returns comments for video', async () => {
      const res = await fetch(`${baseUrl}/videos/vid-1/comments`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !Array.isArray(body.data)) {
        throw new Error('Expected comments array');
      }
    });

  } finally {
    server.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log(`\nResults: ${passedCount}/${results.length} tests passed.\n`);

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
