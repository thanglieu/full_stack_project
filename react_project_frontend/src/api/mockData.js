export const MOCK_USER = {
  id: 1,
  username: 'demo',
  name: 'Nguyễn Văn Demo',
  email: 'demo@ptit.edu.vn',
  gender: 'Nam',
  birth: '2003-05-15',
  mark: 128,
};

export const MOCK_TOPICS = [
  { id: 1, name: 'Lập trình' },
  { id: 2, name: 'Thuật toán' },
  { id: 3, name: 'Cơ sở dữ liệu' },
  { id: 4, name: 'Mạng máy tính' },
  { id: 5, name: 'Trí tuệ nhân tạo' },
];

export const MOCK_ARTICLES = [
  {
    id: 1,
    title: 'Hướng dẫn React Router v7 cho SPA',
    content: '<p>React Router giúp bạn xây dựng Single Page Application dễ dàng...</p><p>Bài viết này hướng dẫn cách cấu hình routes, nested routes và data loading.</p>',
    author: { id: 1, name: 'Nguyễn Văn Demo', username: 'demo' },
    authorId: 1,
    createdAt: '2026-08-20T10:00:00Z',
    like: 15,
    topics: [{ id: 1, name: 'Lập trình' }, { id: 5, name: 'Trí tuệ nhân tạo' }],
  },
  {
    id: 2,
    title: 'Cấu trúc dữ liệu Queue và ứng dụng',
    content: '<p>Queue (hàng đợi) là cấu trúc dữ liệu FIFO...</p>',
    author: { id: 2, name: 'Trần Thị B', username: 'tranb' },
    authorId: 2,
    createdAt: '2026-08-18T14:30:00Z',
    like: 8,
    topics: [{ id: 2, name: 'Thuật toán' }],
  },
  {
    id: 3,
    title: 'Tối ưu truy vấn SQL với Index',
    content: '<p>Index giúp tăng tốc truy vấn nhưng cần sử dụng đúng cách...</p>',
    author: { id: 1, name: 'Nguyễn Văn Demo', username: 'demo' },
    authorId: 1,
    createdAt: '2026-08-15T09:00:00Z',
    like: 22,
    topics: [{ id: 3, name: 'Cơ sở dữ liệu' }],
  },
];

export const MOCK_TESTS = [
  {
    id: 1,
    title: 'Kiểm tra giữa kỳ Cấu trúc dữ liệu',
    quantity: 10,
    author: { id: 1, username: 'demo' },
    topics: [{ id: 2, name: 'Thuật toán' }],
  },
  {
    id: 2,
    title: 'Quiz JavaScript ES6+',
    quantity: 15,
    author: { id: 2, username: 'tranb' },
    topics: [{ id: 1, name: 'Lập trình' }],
  },
];

export const MOCK_PRACTICES = [
  {
    id: 1,
    title: 'Two Sum',
    content: 'Cho mảng số nguyên nums và target, tìm hai chỉ số i, j sao cho nums[i] + nums[j] = target.',
    author: { id: 1, username: 'demo' },
    topics: [{ id: 2, name: 'Thuật toán' }],
  },
  {
    id: 2,
    title: 'Reverse Linked List',
    content: 'Đảo ngược một danh sách liên kết đơn.',
    author: { id: 2, username: 'tranb' },
    topics: [{ id: 2, name: 'Thuật toán' }],
  },
];

export const MOCK_USERS = [
  MOCK_USER,
  { id: 2, username: 'tranb', name: 'Trần Thị B', email: 'tranb@ptit.edu.vn', gender: 'Nữ', mark: 95 },
  { id: 3, username: 'levanc', name: 'Lê Văn C', email: 'levanc@ptit.edu.vn', gender: 'Nam', mark: 80 },
];

export const MOCK_COMMENTS = [
  {
    id: 1,
    content: 'Bài viết rất hữu ích, cảm ơn bạn!',
    authorId: 2,
    author: { name: 'Trần Thị B' },
    createdAt: '2026-08-21T08:00:00Z',
  },
];
