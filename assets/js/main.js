(function () {
  if (window.hasfoneRun) {
    return;
  }
  window.hasfoneRun = true;

  const onMessage = (message) => {
    if (message.command === "f1together") {
      if (window.browser === undefined) {
        let el = document.createElement("script");
        el.innerHTML =
          "window.fonplayer = document.getElementById('main-embeddedPlayer').player";
        document.head.appendChild(el);
        console.log("inserted player elem to chrome");
      }

      console.log("Assuming control.");
      if (message.host === true) {
        connect_host(message.host_pass);
      } else {
        connect();
      }
    }
  };

  if (window.browser === undefined) {
    chrome.runtime.onMessage.addListener(onMessage);
  } else {
    browser.runtime.onMessage.addListener(onMessage);
  }
})();

const try_json = (json) => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const connect_host = (pass) => {
  const vid = document.querySelector("video");
  const socket = new WebSocket("wss://watoge.ort.dev/");

  socket.onopen = (conn) => {
    console.log("Connected.");
    socket.send(JSON.stringify({ kind: "logon", pw: pass }));
  };

  socket.onclose = (t) => {
    if (t.code === 1006) {
      connect_host(pass);
    }
  };

  const changePlay = () => {
    if (socket.readyState === socket.OPEN) {
      socket.send(
        JSON.stringify({
          kind: "host_playback",
          playback_event: vid.paused ? "pause" : "play",
          pw: pass,
        })
      );
    }
  };

  vid.onplay = () => {
    changePlay();
  };

  vid.onpause = () => {
    changePlay();
  };

  let iv = setInterval(() => {
    if (socket.readyState === socket.OPEN) {
      socket.send(
        JSON.stringify({
          kind: "host_duration",
          duration: vid.currentTime,
          playback: vid.paused ? "pause" : "play",
          pw: pass,
        })
      );
    } else {
      clearInterval(iv);
    }
  }, 1000);
};

const seek = (duration) => {
  let el = document.createElement("script");
  el.innerHTML = `window.fonplayer.seek(${duration})`;
  document.head.appendChild(el);
};

const connect = () => {
  const vid = document.querySelector("video");
  const socket = new WebSocket("wss://watoge.ort.dev/");

  socket.onopen = (conn) => {
    console.log("Connected!");
    socket.send(JSON.stringify({ kind: "logon" }));
  };

  socket.onclose = (t) => {
    if (t.code === 1006) {
      connect();
    }
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
      switch (parsed.playback_event) {
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
    if (parsed.kind === "duration") {
      if (
        vid.currentTime > parsed.duration + 5 ||
        vid.currentTime < parsed.duration - 5
      ) {
        if (vid.parentNode.wrappedJSObject !== undefined) {
          vid.parentNode.wrappedJSObject.player.seek(parsed.duration + 1);
        } else {
          seek(parsed.duration + 1);
        }
      }
      if (parsed.playback !== vid.paused ? "pause" : "play") {
        switch (parsed.playback) {
          case "play":
            vid.play();
            break;
          case "pause":
            vid.pause();
            break;
        }
      }
    }
    if (parsed.kind === "seek") {
      if (vid.parentNode.wrappedJSObject !== undefined) {
        vid.parentNode.wrappedJSObject.player.seek(parsed.seek + 1);
      } else {
        vid.parentNode.player.seek(parsed.seek + 1);
      }
    }
  };
};
