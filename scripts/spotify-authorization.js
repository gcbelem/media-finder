/*

SPOTIFY AUTHORIZATION

Handles Spotify OAuth (PKCE), token validation, refresh, and persistence.

*/  

export async function handleSpotifyAuthorization() {
  
  
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  
  const clientId = "e470d39d401c43719bbcddbef6ea1d01";

  if (checkValidToken() === true) {
    return;
  }

  if (code) {
    await getToken(code, clientId);
    return;
  }

  if (localStorage.getItem("refresh_token")) {
    await refreshToken(clientId);
    return;
  }

  await requestSpotifyAuthorization(clientId);
};

async function requestSpotifyAuthorization(clientId) {
  const codeVerifier = generateRandomString(64);
  const hashed = await encodeString(codeVerifier);
  const codeChallenge = base64Encode(hashed);

  localStorage.setItem("code_verifier", codeVerifier);

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: "http://127.0.0.1:5500/index.html",
    scope: "",
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location.href = authUrl.toString();
}
  
function generateRandomString (length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

async function encodeString (plain) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(plain));
};

function base64Encode (input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};
  
export function checkValidToken() {
  const token = localStorage.getItem("access_token");
  const expiresAt = localStorage.getItem("expires_at");

  if (!token || !expiresAt) {
    return false;
  }

  return Date.now() < Number(expiresAt);
}

async function getToken (code, clientId) {
  const codeVerifier = localStorage.getItem('code_verifier');

  const url = "https://accounts.spotify.com/api/token";
  const redirectUri = 'http://127.0.0.1:5500/index.html';

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  }

  const body = await fetch(url, payload);
  const response = await body.json();

  localStorage.setItem("access_token", response.access_token);
  localStorage.setItem("refresh_token", response.refresh_token);
  localStorage.setItem(
    "expires_at",
    Date.now() + response.expires_in * 1000
  );
}

async function refreshToken (clientId) {
  const refreshToken = localStorage.getItem('refresh_token');
  const url = "https://accounts.spotify.com/api/token";

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
      }),
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem(
      "expires_at",
      Date.now() + response.expires_in * 1000
    );

    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    };
}
