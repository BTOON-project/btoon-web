import type { VercelRequest, VercelResponse } from '@vercel/node';

// Dynamic import to handle potential loading issues
let btoon: any = null;
let btoonError: string | null = null;

async function loadBtoon() {
  if (btoon) return btoon;

  try {
    const module = await import('btoon');
    // CommonJS modules are under .default when using ESM dynamic import
    btoon = module.default || module;
    console.log('✓ Loaded btoon package successfully');
    console.log('Available methods:', Object.keys(btoon));
    return btoon;
  } catch (err: any) {
    btoonError = err.message || 'Failed to load btoon package';
    console.error('✗ Failed to load btoon:', btoonError);
    throw err;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS protection - only allow requests from btoon.net
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = ['https://btoon.net', 'https://www.btoon.net'];

  if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. This API is only accessible from btoon.net'
    });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin || 'https://btoon.net');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  // Load btoon package
  try {
    await loadBtoon();
  } catch (err) {
    return res.status(503).json({
      success: false,
      error: btoonError || 'btoon package not available',
      details: 'The native addon failed to load. This may be due to missing prebuilt binaries.',
    });
  }

  // Process decode request
  try {
    const { data, options } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: data',
      });
    }

    // Convert base64 or hex string to Buffer
    let buffer: Buffer;
    if (typeof data === 'string') {
      if (data.startsWith('0x') || /^[0-9a-fA-F]+$/.test(data)) {
        // Hex string
        buffer = Buffer.from(data.replace(/^0x/, ''), 'hex');
      } else {
        // Base64 string
        buffer = Buffer.from(data, 'base64');
      }
    } else {
      buffer = Buffer.from(data);
    }

    const decoded = btoon.decode(buffer, options || {});

    return res.status(200).json({
      success: true,
      data: decoded,
    });
  } catch (error: any) {
    console.error('Decode error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Decoding failed',
    });
  }
}
