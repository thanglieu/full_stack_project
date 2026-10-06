import axios from 'axios';

/*
// chỉ chạy trực tiếp các phương thức axios, không cấu hình withCredentials thì không gửi token qua api được.
export const api = {
  get: (path) => axios.get(path),
  post: (path, body) => axios.post(path, body),
  put: (path, body) => axios.put(path, body),
  delete: (path) => axios.delete(path),
};
*/



const BASE = import.meta.env.VITE_API_URL || '';

// CẤU HÌNH CHO AXIOS
const instance = axios.create({
  baseURL: BASE,
  withCredentials: true,    // cho phép axios gửi cookie httpOnly qua api '(nếu không dùng tham số này thì không đăng nhập qua token được)
  headers: {
    'Content-Type': 'application/json',
  },
});

// XỬ LÝ LỖI
// Interceptor xử lý lỗi tập trung — để giữ NGUYÊN hành vi cũ (throw Error với message rõ ràng)
// giúp các file gọi api (Login.jsx, Register.jsx...) không cần sửa gì thêm
instance.interceptors.response.use(
  (res) => res.data, // axios trả cả response object, chỉ lấy .data để giống res.json() của fetch
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  get: (path) => instance.get(path),
  post: (path, body) => instance.post(path, body),
  put: (path, body) => instance.put(path, body),
  delete: (path) => instance.delete(path),
};
