import Participant from "./Participant";
import Host from "./Host";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const room = params.get("room");
  const isHost = window.location.pathname === "/host";

  if (!room) return <p>roomがありません</p>;

  return isHost
    ? <Host room={room} />
    : <Participant room={room} />;
}
