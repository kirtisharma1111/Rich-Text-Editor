// helper for execCommand with value
const formatDoc = (cmd, value = false) => {
  // some commands expect false as second, some need a value
  if (value) {
    document.execCommand(cmd, false, value);
  } else {
    document.execCommand(cmd, false, null);
  }
};

// Because fontSize with execCommand expects 1..7, map semantic sizes to those numbers
const applyFontSize = (sizeValue) => {
  // sizeValue is '1'..'7' from the <select>
  if (!sizeValue) return;
  formatDoc('fontSize', sizeValue);
};

// Add link safely
const handleAddLink = () => {
  const url = prompt("Enter the URL (include http:// or https://)", "https://");
  if (!url) return; // user cancelled
  // create the link on the current selection
  formatDoc("createLink", url);
};

// anchor behavior: ensure links open in new tab and don't break editing
const content = document.getElementById("content");

// Delegate click to open anchor in new tab (so contentEditable remains usable)
content.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (a) {
    // allow Ctrl/Cmd+click to edit normally, otherwise open in new tab
    if (!e.ctrlKey && !e.metaKey) {
      window.open(a.href, '_blank', 'noopener');
      e.preventDefault();
    }
  }
});

// when content changes, normalize anchors (so they have target=_blank)
const normalizeAnchors = () => {
  const anchors = content.querySelectorAll('a');
  anchors.forEach(a => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
};

// run normalization on input
content.addEventListener('input', normalizeAnchors);
content.addEventListener('paste', () => setTimeout(normalizeAnchors, 10));

// file export
const filenameInput = document.getElementById("filename");
const handleFileExport = (value) => {
  if (value === "new") {
    content.innerHTML = "";
    filenameInput.value = "File Name";
    return;
  }

  const name = (filenameInput && filenameInput.value) ? filenameInput.value.trim() : "File";
  if (value === "pdf") {
    // html2pdf: pass the element, then save with given filename
    html2pdf().from(content).save(name || "File");
    return;
  }

  if (value === "txt") {
    const extractedText = content.innerText;
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (name || "File") + ".txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }
};

// show code toggle
let active = false;
const showCode = document.getElementById("show-code");
showCode.addEventListener("click", () => {
  active = !active;
  showCode.dataset.active = active;
  if (active) {
    // show raw HTML
    content.textContent = content.innerHTML;
    content.setAttribute("contenteditable", "false");
  } else {
    content.innerHTML = content.textContent;
    content.setAttribute("contenteditable", "true");
    normalizeAnchors();
  }
});

