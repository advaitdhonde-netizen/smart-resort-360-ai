import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'BACKEND_URL service binding not configured' }));
    return;
  }

  try {
    const targetUrl = new URL(req.url || '', backendUrl);
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value && key.toLowerCase() !== 'host') {
        headers[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
    }
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

    const resp = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
    });

    res.statusCode = resp.status;
    resp.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    if (resp.body) {
      const reader = resp.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      res.end();
    }
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to communicate with backend service', details: err?.message }));
  }
}
