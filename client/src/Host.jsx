import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./host-telop.css";

const LANES = 5;
const DURATION = 10;
const QUESTION_INTERVAL = 40000;

const QUESTIONS = [
  "今の気分を一言で表すと？",
  "最近関心を持っていることは？",
  "今いちばん食べたいものは？",
  "好きなスポーツは？",
  "よく遊んでいるゲームは？",
  "最近よく見ている動画のジャンルは？",
  "応援している人や作品はある？",
  "今ほしいと思っているものは？",
  "好きなセレクタのプログラムは？",
  "朝型と夜型、どちらに近い？",
  "夏と冬、どっちが好き？",
  "よく利用するコンビニ商品は？",
  "行ってみたい都道府県は？",
  "透明になれるとしたら、最初に何をする？",
  "過去と未来、行けるならどっち？",
  "一つだけ特別な力を使えるとしたら、何を選ぶ？",
  "一日だけ有名人になれるとしたら、何をしてみたい？",
  "もし魔法が使えたら、まず何をする？",
  "100円で少し幸せになれるなら、何を買う？",
  "自分なりの小さなこだわりは？",
  "最近新しく覚えたことは？",
  "最近の小さなマイブームは？",
  "スマホの待ち受けはどんな感じ？"
];


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
