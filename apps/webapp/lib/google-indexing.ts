/**
 * Google Indexing API integration
 * Notifies Google when new blog posts are published for faster indexing
 * 
 * Setup: https://developers.google.com/search/apis/indexing-api/v3/quickstart
 * 
 * Required environment variables:
 * - GOOGLE_INDEXING_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_INDEXING_PRIVATE_KEY (base64 encoded or raw)
 */

interface GoogleIndexingRequest {
  url: string
  type: 'URL_UPDATED' | 'URL_DELETED'
}

export async function notifyGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<boolean> {
  const serviceAccountEmail = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY

  // Skip if not configured
  if (!serviceAccountEmail || !privateKey) {
    console.log('Google Indexing API not configured, skipping notification')
    return false
  }

  try {
    // Get OAuth2 access token
    const accessToken = await getAccessToken(serviceAccountEmail, privateKey)
    
    if (!accessToken) {
      console.error('Failed to get Google OAuth2 access token')
      return false
    }

    // Notify Google Indexing API
    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        type: type,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Google Indexing API error:', response.status, error)
      return false
    }

    console.log(`✅ Google Indexing API notified: ${type} for ${url}`)
    return true
  } catch (error) {
    console.error('Error notifying Google Indexing API:', error)
    return false
  }
}

async function getAccessToken(serviceAccountEmail: string, privateKey: string): Promise<string | null> {
  try {
    const jwt = await createJWT(serviceAccountEmail, privateKey)
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OAuth2 token error:', error)
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting OAuth2 token:', error)
    return null
  }
}

async function createJWT(serviceAccountEmail: string, privateKey: string): Promise<string> {
  // Decode base64 private key if needed
  const decodedKey = privateKey.includes('-----BEGIN') 
    ? privateKey 
    : Buffer.from(privateKey, 'base64').toString('utf-8')

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccountEmail,
    sub: serviceAccountEmail,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
    scope: 'https://www.googleapis.com/auth/indexing',
  }

  // Use Node.js crypto for JWT signing
  const crypto = await import('crypto')
  
  const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signatureInput = `${encodedHeader}.${encodedPayload}`

  const signature = crypto.createSign('RSA-SHA256')
    .update(signatureInput)
    .sign(decodedKey, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${signatureInput}.${signature}`
}

