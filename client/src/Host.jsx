import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./host-telop.css";

const LANES = 5;
const DURATION = 14; // 秒

// レーン管理（モジュールスコープでOK）
const laneAvailableAt = Array(LANES).fill(0);

export default function Host({ room }) {
  const [items, setItems] = useState([]);

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

  const handleEnd = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="telop-root">
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

// ===== レーン割当ロジック =====
function assignLane() {
  const now = Date.now();

  // 今すぐ使えるレーン
  for (let i = 0; i < LANES; i++) {
    if (laneAvailableAt[i] <= now) {
      laneAvailableAt[i] = now + DURATION * 1000;
      return { lane: i, delay: 0 };
    }
  }

  // 全部使用中 → 一番早く空くレーン
  let earliestLane = 0;
  for (let i = 1; i < LANES; i++) {
    if (laneAvailableAt[i] < laneAvailableAt[earliestLane]) {
      earliestLane = i;
    }
  }

  const delay = laneAvailableAt[earliestLane] - now;
  laneAvailableAt[earliestLane] += DURATION * 1000;

  return { lane: earliestLane, delay };
}
