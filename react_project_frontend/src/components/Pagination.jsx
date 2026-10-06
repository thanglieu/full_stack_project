import { Link } from 'react-router-dom';

export default function Pagination({ page, totalPages, basePath = '' }) {
  if (totalPages <= 1) return null;

  const buildUrl = (p) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', p);
    return url.pathname + url.search;
  };

  return (
    <div className="pagination">
      {page > 1 && (
        <Link to={buildUrl(page - 1)}>← Trang trước</Link>
      )}
      <span>
        Trang {page}/{totalPages}
      </span>
      {page < totalPages && (
        <Link to={buildUrl(page + 1)}>Trang sau →</Link>
      )}
    </div>
  );
}
