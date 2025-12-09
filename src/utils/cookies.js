/**
 * Cookie utility functions for secure cookie management
 */

const parseDuration = (duration) => {
  if (!duration) return 0;
  if (typeof duration === 'number') return duration;

  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return parseInt(duration); // assume ms if just number

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return value;
  }
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  // Use COOKIE_SECURE from env if set, otherwise default to production check
  const secureCookie = process.env.COOKIE_SECURE === 'true';

  const accessTokenExpires = parseDuration(process.env.JWT_EXPIRES_IN) || 15 * 60 * 1000;
  const refreshTokenExpires = parseDuration(process.env.JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60 * 1000;

  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: accessTokenExpires,
    path: '/',
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: refreshTokenExpires,
    path: '/api/auth/refresh', // Only accessible to refresh endpoint
  });

  // Set a loggedIn flag for client-side detection (non-httpOnly)
  res.cookie('loggedIn', 'true', {
    httpOnly: false,
    secure: secureCookie,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: accessTokenExpires,
    path: '/',
  });
};

const clearTokenCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 0,
    path: '/',
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 0,
    path: '/api/auth/refresh',
  });

  res.cookie('loggedIn', 'false', {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 0,
    path: '/',
  });
};

const getTokenFromCookies = (req) => {
  return req.cookies.accessToken || null;
};

const getRefreshTokenFromCookies = (req) => {
  return req.cookies.refreshToken || null;
};

module.exports = {
  setTokenCookies,
  clearTokenCookies,
  getTokenFromCookies,
  getRefreshTokenFromCookies,
};