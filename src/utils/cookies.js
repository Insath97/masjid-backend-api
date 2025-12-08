/**
 * Cookie utility functions for secure cookie management
 */

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const accessTokenExpires = parseInt(process.env.JWT_EXPIRES_IN_MINUTES) || 15 * 60 * 1000; // 15 minutes
  const refreshTokenExpires = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 7 * 24 * 60 * 60 * 1000; // 7 days

  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: accessTokenExpires,
    path: '/',
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: refreshTokenExpires,
    path: '/api/auth/refresh', // Only accessible to refresh endpoint
  });

  // Set a loggedIn flag for client-side detection (non-httpOnly)
  res.cookie('loggedIn', 'true', {
    httpOnly: false,
    secure: isProduction,
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