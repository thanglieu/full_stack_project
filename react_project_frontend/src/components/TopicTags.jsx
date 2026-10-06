import { Link } from 'react-router-dom';

export default function TopicTags({ topics = [], solid = false }) {
  if (!topics?.length) return null;
  return (
    <div style={{ marginTop: 4 }}>
      {topics.map((t) => (
        <Link
          key={t.id}
          to={`/blog/filter?topics=${t.id}`}
          className={`topic-tag${solid ? ' solid' : ''}`}
        >
          {t.name}
        </Link>
      ))}
    </div>
  );
}
