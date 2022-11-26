const btn = document.querySelector("#connect");
btn.onclick = async () => {
  let tabs = await browser.tabs.query({ active: true, currentWindow: true });
  browser.tabs.sendMessage(tabs[0].id, {
    command: "f1together",
  });
};
