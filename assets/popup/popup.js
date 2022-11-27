const btn = document.getElementById("connect");
const check = document.getElementById("host");
const pwfield = document.getElementById("hostpw");

btn.onclick = async () => {
  if (window.browser === undefined) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        command: "f1together",
        host: check.checked,
        host_pass: pwfield.value,
      });
    });
  } else {
    let tabs = await window.browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    browser.tabs.sendMessage(tabs[0].id, {
      command: "f1together",
      host: check.checked,
      host_pass: pwfield.value,
    });
  }
};
