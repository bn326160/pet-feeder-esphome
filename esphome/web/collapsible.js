// Makes the web UI's groups collapsible: click a group header to fold it.
// The schedule editors and diagnostics start folded; your choice is remembered
// per browser. Served by the feeder via web_server: js_include.
(() => {
  const DEFAULT_COLLAPSED = ["Weekday times", "Weekend times", "Diagnostics"];
  const KEY = "pet-feeder-collapsed";
  let state = {};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === "object") state = saved;
  } catch (e) { /* storage unavailable: use defaults */ }
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  };
  const isCollapsed = (name) =>
    name in state ? state[name] : DEFAULT_COLLAPSED.some((p) => name.startsWith(p));

  const CSS = `
    .tab-header { cursor: pointer; }
    .tab-header::before { content: "▾"; display: inline-block; margin-right: .5em; transition: transform .2s; }
    .tab-header.fc-collapsed::before { transform: rotate(-90deg); }
    .tab-container.fc-collapsed { display: none; }`;

  function apply(header) {
    const collapsed = isCollapsed(header.textContent.trim());
    header.classList.toggle("fc-collapsed", collapsed);
    const box = header.nextElementSibling;
    if (box && box.classList.contains("tab-container")) box.classList.toggle("fc-collapsed", collapsed);
  }

  function wire(root) {
    if (!root.querySelector("style[data-fc]")) {
      const style = document.createElement("style");
      style.dataset.fc = "1";
      style.textContent = CSS;
      root.appendChild(style);
    }
    root.querySelectorAll(".tab-header").forEach((header) => {
      if (!header.dataset.fc) {
        header.dataset.fc = "1";
        header.addEventListener("click", () => {
          const name = header.textContent.trim();
          state[name] = !isCollapsed(name);
          save();
          apply(header);
        });
      }
      apply(header);
    });
  }

  // esp-app > (shadow) esp-entity-table > (shadow) .tab-header + .tab-container
  const findRoot = () => {
    const app = document.querySelector("esp-app");
    const table = app && app.shadowRoot && app.shadowRoot.querySelector("esp-entity-table");
    return table && table.shadowRoot;
  };
  const timer = setInterval(() => {
    const root = findRoot();
    if (!root) return;
    clearInterval(timer);
    wire(root);
    new MutationObserver(() => wire(root)).observe(root, { childList: true, subtree: true });
  }, 300);
})();
