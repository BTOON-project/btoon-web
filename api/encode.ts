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

  // Process encode request
  try {
    const { data, options } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: data',
      });
    }

    const encoded = btoon.encode(data, options || { autoTabular: true });

    // Convert Buffer to base64 for JSON response
    const base64 = encoded.toString('base64');
    const size = encoded.length;

    return res.status(200).json({
      success: true,
      data: base64,
      size,
      hex: encoded.toString('hex'),
    });
  } catch (error: any) {
    console.error('Encode error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Encoding failed',
    });
  }
}
