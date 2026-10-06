//------ Nạp biến môi trường từ file .env-----------
require('dotenv').config();

//------------ Import các thư viện / module cần thiết------------------
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { loginRequired } = require('./middlewares/auth');
const passport = require('./middlewares/passport');

// -----------Khởi tạo ứng dụng Express--------------
const app = express();

// Cho phép React (chạy port khác) gọi API kèm cookie
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware để parse dữ liệu JSON và form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// KHÔNG dùng EJS view engine nữa — backend giờ chỉ trả JSON,
// giao diện do React đảm nhiệm hoàn toàn (SPA)

// tạo đối tượng passport để thực hiện xác thực
app.use(passport.initialize());
// JWT: gắn currentUser từ cookie/header (mọi request)
app.use(loginRequired);

//--------- chia thành các module - định tuyến URL cấp module -----------
const blogRouters = require('./routers/blog_routers');
const examRouters = require('./routers/exam_routers');
const practiceRouters = require('./routers/practice_routers');

// Toàn bộ API nằm dưới prefix /api để khớp với proxy '/api' đã cấu hình
// sẵn trong react_project_frontend/my-react-app/vite.config.js
app.use('/api/blog', blogRouters);
app.use('/api/exam', examRouters);
app.use('/api/practice', practiceRouters);

// 404 riêng cho API không tồn tại (đặt sau các router /api ở trên)
app.use('/api', (req, res) => res.status(404).json({ message: 'Không tìm thấy API' }));

// ====== PRODUCTION: cho Express serve luôn bản build của React ======
// Bỏ comment 3 dòng dưới sau khi đã chạy `npm run build` ở react_project_frontend/my-react-app
// const distPath = path.join(__dirname, '../react_project_frontend/my-react-app/dist');
// app.use(express.static(distPath));
// app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(distPath, 'index.html')));

module.exports = app;
