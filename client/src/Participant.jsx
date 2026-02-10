import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./Participant.css";

export default function Participant({ room }) {
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [lastSent, setLastSent] = useState(0);

  useEffect(() => {
    const s = io("http://localhost:3000", {
      auth: { room },
    });
    setSocket(s);
    return () => s.disconnect();
  }, [room]);

  const send = () => {
    if (!socket) return;
    if (!text.trim()) return;

    const now = Date.now();
    if (now - lastSent < 1000) return;

    socket.emit("submit", { name, text });
    setText("");
    setLastSent(now);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // ← 改行させない
      if (name && text) {
        send();
      }
    }
  };

  return (
    <div className="p-root">
      <div className="p-container">
        <input
          className="p-name"
          placeholder="表示名"
          value={name}
          maxLength={10}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="p-text"
          placeholder="ここに入力"
          value={text}
          maxLength={50}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="p-send"
          disabled={!name || !text}
          onClick={send}
        >
          送信
        </button>
      </div>
    </div>
  );
}
