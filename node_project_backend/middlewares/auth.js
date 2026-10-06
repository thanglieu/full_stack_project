// TA SẼ LƯU ACCESS TOKEN VÀ REFRESH TOKEN TRÊN COOKIE


// middlewares/auth.js
const jwt = require('jsonwebtoken');
const passport = require('./passport');       // import đối tượng passport đã cấu hình trong middleware/passport.js
const blogModel = require('../models/blog_model');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';





// --------- Tạo và quản lý token ---------------
// cấu hình cho COOKIE (chú ý rằng đây chỉ là nhưng đối tượng thuộc kiểu object bình thường
// chỉ khi gắn vào đối tượng res.cookie() thì mới thành đối tượng cookie)
const accessCookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};


/*
// tạo access token
function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, type: 'access' },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

// tạo refresh token
function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
}

// lưu access token và refresh token vào cookie của respone
function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, accessCookieOpts);
  res.cookie('refreshToken', refreshToken, refreshCookieOpts);
}

// xóa cookie
function clearTokenCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

// cấp lại token và lưu vào cookie
function issueTokens(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setTokenCookies(res, accessToken, refreshToken);
  return { accessToken, refreshToken };
}







// -------------- Xử lý refresh token -----------
// lấy refresh token từ cookie hoặc HTTP Post body
function extractRefreshToken(req) {
  if (req.cookies?.refreshToken) return req.cookies.refreshToken;
  if (req.body?.refreshToken) return req.body.refreshToken;
  return null;
}

// refresh token cấp lại access token
async function tryRefresh(req, res) {
  console.log("Gọi refresh token cấp lại access token")
  const refreshToken = extractRefreshToken(req);
  if (!refreshToken) return null;

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    if (payload.type !== 'refresh') return null;

    const user = await blogModel.findUserById(payload.id);
    if (!user) return null;

    issueTokens(user, res); // cấp cặp mới (rotation cookie)

    const { password, ...safeUser } = user;
    return safeUser;
  } catch {
    return null;
  }
}
*/


// cấp và lưu token vào cookie
function issueTokens(user, res) {
  // mã hóa đối tượng kiểu object thành đối tượng token
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, type: 'access' },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { id: user.id, username: user.username, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );

  // tạo đối tượng cookie và gắn token vào cookie
  res.cookie('accessToken', accessToken, accessCookieOpts);
  res.cookie('refreshToken', refreshToken, refreshCookieOpts);

  return { accessToken, refreshToken };
}

// xóa token cookie
function clearTokens(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

// refresh token để cấp lại access token
async function tryRefresh(req, res) {
  // console.log("Gọi refresh token cấp lại access token " + req.url + " " + req.method)

  // dùng thư viện cookie-parser để parse dữ liệu cookie trong req
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return null;

  try {
    // giải mã token 
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    // if (payload.type !== 'refresh') return null;

    // tìm user theo id trong token
    const user = await blogModel.findUserById(payload.id);
    if (!user) return null;

    // cấp cặp access/refresh token mới
    const tokens = issueTokens(user, res); 
    const { password, ...safeUser } = user;
    return { ...safeUser, ...tokens };
  } catch {
    return null;
  }
}






// -------- Xác thực bằng token ---------------
// duy trì đăng nhập (chú ý là duy trì đăng nhập chứ không phải đăng nhập)
function loginRequired(req, res, next) {

  /* ===== SESSION (cũ) =====
  // nếu đã đăng nhập thì tiếp tục thực thi
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  if (req.session?.userId) return next();
  return res.redirect('/blog/login');
  */

  // dùng passport 'jwt' để xác thực thông qua token (access token đã cấu hình trong passport.js)
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err) return next(err);

    // nếu access token hợp lệ (đã đăng nhập), tiếp tục thực thi
    if (user) {
      req.user = user;
      res.locals.currentUser = user;
      return next();
    }

    // Không có / access hết hạn / sai → thử refresh
    const refreshed = await tryRefresh(req, res);
    if (refreshed) {
      req.user = refreshed;
      res.locals.currentUser = refreshed;
      return next();
    }

    // nếu cả refresh token cũng hết hạn => xóa cookie, trả 401 JSON (trừ /login và /register)
    // (đổi từ redirect sang JSON vì client giờ là React, không phải trình duyệt submit form/EJS)
    if (req.path === '/api/blog/login' || req.path === '/api/blog/register') return next();
    clearTokens(res);
    return res.status(401).json({ message: 'Chưa đăng nhập hoặc phiên đã hết hạn' });
  })(req, res, next);
}


/*
function optionalAuth(req, res, next) {
  // dùng passport-jwt để xác thực Passport bằng JWT (jwt này đã cấu hình trong passport.js)
  passport.authenticate('jwt', { session: false }, async (err, user) => {
    
    // nếu access token hợp lệ
    if (user) {
      req.user = user;
      res.locals.currentUser = user;
      return next();
    }

    // refresh token cấp phát lại access token nếu hết hạn 
    const refreshed = await tryRefresh(req, res);
    if (refreshed) {
      req.user = refreshed;
      res.locals.currentUser = refreshed;
      return next();
    }

    // nếu cả refresh token cũng hết hạn => user bằng null (các hàm sẽ nhận null và chuyển sang /login)
    req.user = null;
    res.locals.currentUser = null;
    next();
  })(req, res, next);
}


function jwtRequired(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Unauthorized' });
    }
    req.user = user;
    next();
  })(req, res, next);
}

*/

module.exports = {
  // signAccessToken,
  // signRefreshToken,
  issueTokens,
  // setTokenCookies,
  clearTokens,
  tryRefresh,
  loginRequired,
  // optionalAuth,
  // jwtRequired,
};