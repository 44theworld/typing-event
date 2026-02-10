import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./host-telop.css";

const LANES = 5;
const DURATION = 10; // 秒

// レーン管理（モジュールスコープでOK）
const laneAvailableAt = Array(LANES).fill(0);

export default function Host({ room }) {
  const [items, setItems] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    const socket = io({
      auth: { room },
    });

    socket.on("message", (msg) => {
      const { lane, delay } = assignLane();

      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: msg.name,
          text: msg.text,
          lane,
          delay,
        },
      ]);
    });

    return () => socket.disconnect();
  }, [room]);

  // ★ お題を2分ごとに切り替える
  useEffect(() => {
    const timer = setInterval(() => {
      setQuestionIndex((prev) => (prev + 1) % QUESTIONS.length);
    }, QUESTION_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const handleEnd = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="telop-root">
      {/* ★ お題表示 */}
      <div className="question-box">
        <span className="question-label">お題</span>
        <span className="question-text">
          {QUESTIONS[questionIndex]}
        </span>
      </div>

      {/* テロップ */}
      {items.map((item) => (
        <div
          key={item.id}
          className="telop-item"
          style={{
            top: `${25 + item.lane * 12}%`,
            animationDuration: `${DURATION}s`,
            animationDelay: `${item.delay}ms`,
          }}
          onAnimationEnd={() => handleEnd(item.id)}
        >
          <span className="telop-name">{item.name}</span>
          <span className="telop-text">：{item.text}</span>
        </div>
      ))}
    </div>
  );
}
