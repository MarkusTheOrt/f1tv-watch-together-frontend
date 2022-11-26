(function () {
  if (window.hasfoneRun) {
    return;
  }
  window.hasfoneRun = true;
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "f1together") {
      console.log("We're going together!!!!");
      connect();
    }
  });
})();

const try_json = (json) => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const connect = () => {
  const vid = document.querySelector("video");
  const socket = new WebSocket("ws://127.0.0.1:3337/");

  socket.onopen = (conn) => {
    console.log("Connected!");
    socket.send(JSON.stringify({ kind: "test", percent: 0.1251 }));
  };

  socket.onmessage = async (msg) => {
    const parsed = try_json(msg.data);
    if (parsed === null) {
      return;
    }
    if (!("kind" in parsed)) {
      return;
    }
    if (parsed.kind === "playback") {
      switch (parsed.pbe) {
        case "pause": {
          vid.pause();
          break;
        }
        case "play": {
          vid.play();
          break;
        }
      }
    }
    if (parsed.kind === "seek") {
      let test = document.getElementById("main-embeddedPlayer");

      if ("player" in test) {
        console.log(true);
      } else {
        console.log(test);
      }

      //console.log(vid.parentElement.id);

      vid.parentNode.wrappedJSObject.player.seek(parsed.seek);
    }
  };
};
