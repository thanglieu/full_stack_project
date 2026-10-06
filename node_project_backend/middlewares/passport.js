// middlewares/passport.js : đăng ký strategy cho Passport

const passport = require('passport');   // import instance object trong thư viện passport
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const blogModel = require('../models/blog_model');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';

/*
// Lấy JWT từ cookie accessToken hoặc header Authorization: Bearer
const cookieOrBearerExtractor = (req) => {
  if (req?.cookies?.accessToken) return req.cookies.accessToken;
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};
*/
const cookieExtractor = (req) => req?.cookies?.accessToken || null;


// ----- Local: so sánh username/password, chỉ dùng lúc login -----
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await blogModel.findUserByUsername(username);
      if (!user) return done(null, false, { message: 'Sai tài khoản' });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return done(null, false, { message: 'Sai mật khẩu' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// ----- JWT: verify access token (Passport-JWT) -----
passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: ACCESS_SECRET,   // chuỗi mã hóa của access token. Client luôn gửi token verify khớp với chuỗi mã hóa 
                                    // => (nhờ đó payload luôn là access token)
    },
    async (payload, done) => {
      try {
        // Chỉ nhận access token
        if (payload.type && payload.type !== 'access') {
          return done(null, false, { message: 'Không phải access token' });
        }
        const user = await blogModel.findUserById(payload.id);
        
        // nếu không có user : đăng nhập thất bại
        if (!user) return done(null, false);

        // nếu có, trả về user (không gửi kèm password để bảo mật)
        const { password, ...safeUser } = user;
        return done(null, safeUser);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

module.exports = passport;    // xuất đối tượng passport để các file khác sử dụng