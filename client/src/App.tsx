import React, { useState, useEffect, ReactElement } from "react";
import "./App.css";
import io from "socket.io-client";
import MainWrapper from "./components/mainWrapper";
import { JoinInfo } from "./types/joinInfo";

function App(): ReactElement {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(null);

  useEffect(() => {
    fetch("/connect")
      .then((res) => res.json())
      .then((_joinInfo) => {
        if ("gameCode" in _joinInfo && "position" in _joinInfo) {
          setJoinInfo(_joinInfo);
        }
        setSocket(io());
      });
  }, []);

  return (
    <>
      {socket !== null && <MainWrapper joinInfo={joinInfo} socket={socket} />}
    </>
  );
}

export default App;
