# PTITShare React SPA

Frontend React (Vite + React Router) chuyển đổi từ EJS templates của project Express PTITShare.

## Cài đặt

```bash
cd ptitshare-react
npm install
npm run dev
```

Mở http://localhost:5173

## Cấu trúc

```
src/
  components/     # Navbar, Footer, Layout, Pagination, TopicTags
  context/        # AuthContext (JWT/localStorage)
  pages/
    blog/         # Home, Article, Create, Filter, Search, Login, Register, Profile, Ranking
    exam/         # ExamHome, CreateTest, TakeTest, TestResult, UserTestList
    practice/     # PracticeHome, CreatePractice, TakePractice, CodeRunner, UserPracticeList
  api/            # client.js + mockData.js (demo)
  utils/          # date helpers
```

## Routing (SPA)

| Path | Page |
|------|------|
| `/blog` | Danh sách bài viết |
| `/blog/articles/:id` | Chi tiết bài viết |
| `/blog/articles/new` | Tạo bài |
| `/blog/filter` | Lọc chủ đề |
| `/blog/search` | Tìm kiếm |
| `/blog/login` | Đăng nhập |
| `/blog/register` | Đăng ký |
| `/blog/users/:id` | Trang cá nhân |
| `/blog/users/rank` | Bảng xếp hạng |
| `/exam` | Danh sách test |
| `/exam/create` | Tạo test |
| `/exam/take/:id` | Làm bài |
| `/exam/test/result/:id` | Kết quả |
| `/practice` | Danh sách practice |
| `/practice/create` | Tạo practice |
| `/practice/:id/take` | Làm practice |
| `/practice/run-code` | Code Runner |

## Tích hợp Backend Express

Hiện tại dùng **mock data** để demo SPA độc lập.

Để nối với Express:

1. Backend chuyển các `res.render(...)` thành `res.json(...)` API endpoints.
2. Trong React, thay các chỗ `// TODO: api.get/post` bằng gọi thật qua `src/api/client.js`.
3. Đặt `VITE_API_URL=http://localhost:3000` trong `.env`.
4. Vite đã cấu hình proxy `/api` → `localhost:3000`.

### Gợi ý API endpoints (từ controller)

```
POST   /api/blog/login
POST   /api/blog/register
POST   /api/blog/logout
GET    /api/blog                    # articles list + pagination
GET    /api/blog/articles/:id
POST   /api/blog/articles
PUT    /api/blog/articles/:id
DELETE /api/blog/articles/:id
POST   /api/blog/articles/:id/like
POST   /api/blog/articles/:id/comment
GET    /api/blog/filter?topics=
GET    /api/blog/search?keyword=
GET    /api/blog/users/:id
GET    /api/blog/users/rank

GET    /api/exam
POST   /api/exam/create
GET    /api/exam/take/:id
POST   /api/exam/take/:id
GET    /api/exam/test/:id
GET    /api/exam/test/result/:id

GET    /api/practice
POST   /api/practice/create
GET    /api/practice/:id/take
POST   /api/practice/:id/take
POST   /api/practice/run-code
```

## Theme

Giữ nguyên CSS variables từ EJS gốc:
- `--green: #04AA6D`
- `--dark: #282A35`
- Navbar sticky, layout 3 cột, form styles...

## Build production

```bash
npm run build
```

Express serve thư mục `dist/`:

```js
app.use(express.static(path.join(__dirname, 'ptitshare-react/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'ptitshare-react/dist/index.html'));
});
```
