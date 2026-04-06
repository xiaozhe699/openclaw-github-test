import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

const formatDateTimeLocal = (date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

const getTimeLeft = (targetDate) => {
  if (!targetDate) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00', completed: false, diff: null };
  }

  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00', completed: true, diff: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    completed: false,
    diff,
  };
};

function App() {
  const defaultTitle = '我的重要时刻';
  const [title, setTitle] = useState(defaultTitle);
  const [inputValue, setInputValue] = useState('');
  const [targetDate, setTargetDate] = useState(null);
  const [tick, setTick] = useState(Date.now());
  const [status, setStatus] = useState('还没开始。先选一个未来时间吧。');

  useEffect(() => {
    if (!targetDate) return;

    const timer = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  const timeLeft = useMemo(() => {
    void tick;
    return getTimeLeft(targetDate);
  }, [targetDate, tick]);

  useEffect(() => {
    const currentTitle = title.trim() || '目标事件';

    if (!targetDate) return;

    if (timeLeft.completed) {
      setStatus(`「${currentTitle}」时间到啦。`);
      return;
    }

    setStatus(
      `距离「${currentTitle}」还有 ${Number(timeLeft.days)} 天 ${Number(timeLeft.hours)} 小时 ${Number(
        timeLeft.minutes
      )} 分 ${Number(timeLeft.seconds)} 秒`
    );
  }, [timeLeft, targetDate, title]);

  const startCountdown = () => {
    if (!inputValue) {
      setStatus('先选择一个目标时间。');
      return;
    }

    const selected = new Date(inputValue);
    if (Number.isNaN(selected.getTime())) {
      setStatus('目标时间格式不对，请重新选择。');
      return;
    }

    if (selected.getTime() <= Date.now()) {
      setStatus('目标时间要在未来。');
      return;
    }

    setTargetDate(selected);
  };

  const usePreset = () => {
    const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setInputValue(formatDateTimeLocal(nextDay));
    setStatus('已帮你设成 24 小时后，点“开始倒计时”即可。');
  };

  const reset = () => {
    setTitle(defaultTitle);
    setInputValue('');
    setTargetDate(null);
    setTick(Date.now());
    setStatus('已重置。重新设置一个目标时间吧。');
  };

  return (
    <main className="card">
      <h1>React 倒计时页面</h1>
      <p className="subtitle">现在这是 React 版本。输入事件标题和目标时间，就能实时看到剩余的天、时、分、秒。</p>

      <section className="controls">
        <div className="field full">
          <label htmlFor="title">事件标题</label>
          <input
            id="title"
            type="text"
            placeholder="比如：新品发布 / 放假 / 生日"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="field full">
          <label htmlFor="targetTime">目标时间</label>
          <input
            id="targetTime"
            type="datetime-local"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
        </div>
      </section>

      <div className="actions">
        <button className="primary" onClick={startCountdown}>开始倒计时</button>
        <button className="secondary" onClick={usePreset}>设为 24 小时后</button>
        <button className="danger" onClick={reset}>重置</button>
      </div>

      <section className="countdown" aria-live="polite">
        {[
          ['天', timeLeft.days],
          ['时', timeLeft.hours],
          ['分', timeLeft.minutes],
          ['秒', timeLeft.seconds],
        ].map(([label, value]) => (
          <div className="time-box" key={label}>
            <span className="time-value">{value}</span>
            <span className="time-label">{label}</span>
          </div>
        ))}
      </section>

      <p className={`status ${timeLeft.completed ? 'done' : ''}`}>{status}</p>
    </main>
  );
}

const styles = `
  :root {
    color-scheme: dark;
    --bg: #0f172a;
    --card: rgba(15, 23, 42, 0.72);
    --text: #e2e8f0;
    --muted: #94a3b8;
    --accent: #22c55e;
    --accent-2: #38bdf8;
    --danger: #fb7185;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 30%),
      radial-gradient(circle at bottom, rgba(34, 197, 94, 0.16), transparent 25%),
      var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 24px;
  }

  .card {
    width: min(680px, 100%);
    background: var(--card);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  }

  h1 {
    margin: 0 0 8px;
    font-size: clamp(28px, 4vw, 42px);
  }

  .subtitle {
    margin: 0 0 24px;
    color: var(--muted);
    line-height: 1.6;
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field.full {
    grid-column: 1 / -1;
  }

  label {
    font-size: 14px;
    color: var(--muted);
  }

  input {
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.24);
    background: rgba(15, 23, 42, 0.85);
    color: var(--text);
    border-radius: 14px;
    padding: 14px 16px;
    font-size: 16px;
    outline: none;
  }

  input:focus {
    border-color: var(--accent-2);
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.12);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 18px;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 13px 20px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.18s ease, opacity 0.18s ease;
  }

  button:hover { transform: translateY(-1px); }
  button:active { transform: translateY(0); }

  .primary {
    background: linear-gradient(135deg, var(--accent), #16a34a);
    color: white;
  }

  .secondary {
    background: rgba(148, 163, 184, 0.14);
    color: var(--text);
  }

  .danger {
    background: rgba(251, 113, 133, 0.15);
    color: #fecdd3;
  }

  .countdown {
    margin-top: 28px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .time-box {
    padding: 18px 12px;
    border-radius: 18px;
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(148, 163, 184, 0.16);
    text-align: center;
  }

  .time-value {
    display: block;
    font-size: clamp(28px, 5vw, 46px);
    font-weight: 700;
    letter-spacing: 1px;
  }

  .time-label {
    display: block;
    margin-top: 6px;
    color: var(--muted);
    font-size: 13px;
  }

  .status {
    margin-top: 18px;
    min-height: 24px;
    color: var(--muted);
  }

  .status.done {
    color: #86efac;
  }

  @media (max-width: 640px) {
    .controls {
      grid-template-columns: 1fr;
    }

    .countdown {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

const styleEl = document.createElement('style');
styleEl.textContent = styles;
document.head.appendChild(styleEl);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
