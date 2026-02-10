import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./host-telop.css";

const LANES = 5;
const DURATION = 14;
const QUESTION_INTERVAL = 45000;

const QUESTIONS = [
  "今の気分を一言で表すと？",
  "夏と冬、どっちが好き？",
  "好きな飲み物は？",
  "好きなおにぎりの具は？",
  "好きなセレクタのプログラムは？",
  "最近よく聴いている音楽は？",
  "最近関心を持っていることは？",
  "最近うれしかった出来事は？",
  "最近印象に残った出来事は？",
  "最近思わず笑ったことは？",
  "今いちばん食べたいものは？",
  "昨日の夕食は何だった？",
  "今日いちばん楽しみにしていることは？",
  "好きなスポーツは？",
  "よく遊んでいるゲームは？",
  "最近よく見ている動画のジャンルは？",
  "好きなアニメや漫画は？",
  "応援している人や作品はある？",
  "今ほしいと思っているものは？",
  "今週の目標を一つ挙げるとしたら？",
  "自分の得意なことを一つ挙げるとしたら？",
  "朝型と夜型、どちらに近い？",
  "よく利用するコンビニ商品は？",
  "行ってみたい都道府県は？",
  "行ってみたい国は？",
  "一日だけ自由な時間が増えたら、何をする？",
  "透明になれるとしたら、最初に何をする？",
  "過去と未来、行けるならどっち？",
  "一つだけ特別な力を使えるとしたら、何を選ぶ？",
  "一日だけ有名人になれるとしたら、何をしてみたい？",
  "もし魔法が使えたら、まず何をする？",
  "100円で少し幸せになれるなら、何を買う？",
  "自分なりの小さなこだわりは？",
  "最近新しく覚えたことは？",
  "最近『よく頑張った』と思えたのはどんなとき？"
];


export default function Host({ room }) {
  const [items, setItems] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  // socket
  useEffect(() => {
    const socket = io({
      auth: { room },
    });


    socket.on("message", (msg) => {
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: msg.name,
          text: msg.text,
          lane: Math.floor(Math.random() * LANES),
        },
      ]);
    });

    return () => socket.disconnect();
  }, [room]);

  // お題タイマー
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
      {/* お題表示 */}
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
