import { useState } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../api/client';

export default function CodeRunner() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('print("Hello PTITShare")');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  const handleRun = async (e) => {
    e.preventDefault();
    setRunning(true);
    setOutput('');
    setError('');
    try {
      const data = await api.post('/api/practice/run-code', {
        language_type: language,
        code,
        input,
      });
      setOutput(data.output || '');
      setError(data.error || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Layout>
      <div className="page-container" style={{ maxWidth: 900 }}>
        <div style={{ textAlign: 'center', marginBottom: 28, paddingBottom: 16, borderBottom: '3px solid var(--green)' }}>
          <h1 style={{ marginBottom: 5 }}>Code Runner</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Viết code, nhập input và nhấn Run để chạy thử.</p>
        </div>

        <form onSubmit={handleRun}>
          <div className="form-card" style={{ marginBottom: 24 }}>
            <div style={{ background: '#f0f0f0', padding: '12px 20px', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid var(--border)' }}>
              Editor
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Ngôn ngữ</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c++">C++</option>
                </select>
              </div>
              <div className="form-group">
                <label>Input</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  style={{ minHeight: 80, fontFamily: "'Source Code Pro', monospace", fontSize: 13 }}
                />
              </div>
              <div className="form-group">
                <label>Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ minHeight: 320, fontFamily: "'Source Code Pro', monospace", fontSize: 13 }}
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-green" disabled={running} style={{ marginBottom: 24 }}>
            {running ? 'Running...' : 'Run'}
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          <div>
            <div style={{ background: 'var(--green-light)', color: 'var(--green-dark)', fontSize: 12.5, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', padding: '10px 16px', borderRadius: '6px 6px 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
              ✓ Output
            </div>
            <pre style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 13, padding: '14px 16px', borderRadius: '0 0 6px 6px', border: '1px solid var(--border)', minHeight: 80, whiteSpace: 'pre-wrap', background: '#fff' }}>
              {output || ''}
            </pre>
          </div>
          <div>
            <div style={{ background: '#fff4f4', color: '#c0392b', fontSize: 12.5, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', padding: '10px 16px', borderRadius: '6px 6px 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
              ✕ Error
            </div>
            <pre style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 13, padding: '14px 16px', borderRadius: '0 0 6px 6px', border: '1px solid var(--border)', minHeight: 80, whiteSpace: 'pre-wrap', background: '#fff9f9', color: '#c0392b' }}>
              {error || ''}
            </pre>
          </div>
        </div>
      </div>
    </Layout>
  );
}
