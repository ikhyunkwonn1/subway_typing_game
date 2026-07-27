// Vanilla port of Aceternity UI's <Keyboard enableSound /> component.
// Geometry, colours, shadows and press physics are kept 1:1 with the React
// source; the only behavioural addition is that clicking a key types into the
// game's answer field, which the original does not do.

const SubwayKeyboard = (() => {
  // Tabler icon paths (MIT), drawn at 6x6. The four carets are filled
  // triangles — indistinguishable from Tabler's rounded originals at this size.
  const ICONS = {
    brightnessDown:
      '<path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M12 5l0 .01" /><path d="M17 7l0 .01" /><path d="M19 12l0 .01" /><path d="M17 17l0 .01" /><path d="M12 19l0 .01" /><path d="M7 17l0 .01" /><path d="M5 12l0 .01" /><path d="M7 7l0 .01" />',
    brightnessUp:
      '<path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M12 5l0 -2" /><path d="M17 7l1.4 -1.4" /><path d="M19 12l2 0" /><path d="M17 17l1.4 1.4" /><path d="M12 19l0 2" /><path d="M7 17l-1.4 1.4" /><path d="M6 12l-2 0" /><path d="M7 7l-1.4 -1.4" />',
    table:
      '<path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /><path d="M3 10h18" /><path d="M10 3v18" />',
    search: '<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" />',
    microphone:
      '<path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M8 21l8 0" /><path d="M12 17l0 4" />',
    moon: '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />',
    trackPrev: '<path d="M21 5v14l-8 -7z" /><path d="M10 5v14l-8 -7z" />',
    skipForward: '<path d="M4 5v14l12 -7z" /><path d="M20 5l0 14" />',
    trackNext: '<path d="M3 5v14l8 -7z" /><path d="M14 5v14l8 -7z" />',
    volume3:
      '<path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />',
    volume2:
      '<path d="M15 8a5 5 0 0 1 0 8" /><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />',
    volume:
      '<path d="M15 8a5 5 0 0 1 0 8" /><path d="M17.7 5a9 9 0 0 1 0 14" /><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />',
    chevronUp: '<path d="M6 15l6 -6l6 6" />',
    world:
      '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M3.6 9h16.8" /><path d="M3.6 15h16.8" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" />',
    command:
      '<path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10" />',
  };

  const FILLED_ICONS = {
    caretUp: '<path d="M6 15l6 -6l6 6z" />',
    caretDown: '<path d="M6 9l6 6l6 -6z" />',
    caretLeft: '<path d="M15 6l-6 6l6 6z" />',
    caretRight: '<path d="M9 6l6 6l-6 6z" />',
  };

  // The option/alt glyph is a bespoke SVG in the original component.
  const OPTION_ICON =
    '<svg class="kb-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
    '<rect stroke="currentColor" stroke-width="2" x="18" y="5" width="10" height="2" />' +
    '<polygon stroke="currentColor" stroke-width="2" points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25" />' +
    "</svg>";

  function icon(name) {
    if (FILLED_ICONS[name]) {
      return (
        '<svg class="kb-icon" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">' +
        FILLED_ICONS[name] +
        "</svg>"
      );
    }
    return (
      '<svg class="kb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ICONS[name] +
      "</svg>"
    );
  }

  // Unshifted / shifted character produced by each non-letter key.
  const CHARS = {
    Backquote: ["`", "~"],
    Digit1: ["1", "!"],
    Digit2: ["2", "@"],
    Digit3: ["3", "#"],
    Digit4: ["4", "$"],
    Digit5: ["5", "%"],
    Digit6: ["6", "^"],
    Digit7: ["7", "&"],
    Digit8: ["8", "*"],
    Digit9: ["9", "("],
    Digit0: ["0", ")"],
    Minus: ["-", "_"],
    Equal: ["=", "+"],
    BracketLeft: ["[", "{"],
    BracketRight: ["]", "}"],
    Backslash: ["\\", "|"],
    Semicolon: [";", ":"],
    Quote: ["'", '"'],
    Comma: [",", "<"],
    Period: [".", ">"],
    Slash: ["/", "?"],
    Space: [" ", " "],
  };

  // Two stacked legends, as the number/punctuation keys render them.
  function stack(top, bottom) {
    return "<span>" + top + "</span><span>" + bottom + "</span>";
  }

  function fnKey(code, iconName, label) {
    return { code: code, content: icon(iconName) + '<span class="kb-mt">' + label + "</span>" };
  }

  const ROWS = [
    [
      { code: "Escape", w: 40, corner: "tl", face: "bl", content: "<span>esc</span>" },
      fnKey("F1", "brightnessDown", "F1"),
      fnKey("F2", "brightnessUp", "F2"),
      fnKey("F3", "table", "F3"),
      fnKey("F4", "search", "F4"),
      fnKey("F5", "microphone", "F5"),
      fnKey("F6", "moon", "F6"),
      fnKey("F7", "trackPrev", "F7"),
      fnKey("F8", "skipForward", "F8"),
      fnKey("F9", "trackNext", "F9"),
      fnKey("F10", "volume3", "F10"),
      fnKey("F11", "volume2", "F11"),
      fnKey("F12", "volume", "F12"),
      { code: null, corner: "tr", content: '<div class="kb-power"><div></div></div>' },
    ],
    [
      { code: "Backquote", content: stack("~", "`") },
      { code: "Digit1", content: stack("!", "1") },
      { code: "Digit2", content: stack("@", "2") },
      { code: "Digit3", content: stack("#", "3") },
      { code: "Digit4", content: stack("$", "4") },
      { code: "Digit5", content: stack("%", "5") },
      { code: "Digit6", content: stack("^", "6") },
      { code: "Digit7", content: stack("&amp;", "7") },
      { code: "Digit8", content: stack("*", "8") },
      { code: "Digit9", content: stack("(", "9") },
      { code: "Digit0", content: stack(")", "0") },
      { code: "Minus", content: stack("—", "_") },
      { code: "Equal", content: stack("+", "=") },
      { code: "Backspace", w: 40, face: "br", content: "<span>delete</span>" },
    ],
    [
      { code: "Tab", w: 40, face: "bl", content: "<span>tab</span>" },
      ...["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((l) => ({
        code: "Key" + l,
        content: l,
      })),
      { code: "BracketLeft", content: stack("{", "[") },
      { code: "BracketRight", content: stack("}", "]") },
      { code: "Backslash", content: stack("|", "\\") },
    ],
    [
      { code: "CapsLock", w: 44.8, face: "bl", content: "<span>caps lock</span>" },
      ...["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((l) => ({
        code: "Key" + l,
        content: l,
      })),
      { code: "Semicolon", content: stack(":", ";") },
      { code: "Quote", content: stack('"', "'") },
      { code: "Enter", w: 45.6, face: "br", content: "<span>return</span>" },
    ],
    [
      { code: "ShiftLeft", w: 58.4, face: "bl", content: "<span>shift</span>" },
      ...["Z", "X", "C", "V", "B", "N", "M"].map((l) => ({ code: "Key" + l, content: l })),
      { code: "Comma", content: stack("&lt;", ",") },
      { code: "Period", content: stack("&gt;", ".") },
      { code: "Slash", content: stack("?", "/") },
      { code: "ShiftRight", w: 58.4, face: "br", content: "<span>shift</span>" },
    ],
    [
      { code: "Fn", modifier: true, corner: "bl", content: "<span>fn</span>" + icon("world") },
      { code: "ControlLeft", modifier: true, content: icon("chevronUp") + "<span>control</span>" },
      { code: "AltLeft", modifier: true, content: OPTION_ICON + "<span>option</span>" },
      { code: "MetaLeft", modifier: true, w: 32, content: icon("command") + "<span>command</span>" },
      { code: "Space", w: 131.2, content: "" },
      { code: "MetaRight", modifier: true, w: 32, content: icon("command") + "<span>command</span>" },
      { code: "AltRight", modifier: true, content: OPTION_ICON + "<span>option</span>" },
      { arrows: true },
    ],
  ];

  const pressed = new Set();
  const keyNodes = new Map(); // code -> [button, ...]
  let stickyShift = false;
  let input = null;
  let form = null;
  let root = null;

  function make(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function buildKey(spec) {
    const wrap = make("div", "kb-cap" + (spec.corner ? " kb-cap--" + spec.corner : ""));

    const button = make("button", "kb-key" + (spec.corner ? " kb-key--" + spec.corner : ""));
    button.type = "button";
    // Keeps 78 keycaps out of the tab order — they duplicate the answer field.
    button.tabIndex = -1;
    if (spec.w) button.style.width = spec.w + "px";
    if (spec.h) button.style.height = spec.h + "px";

    const faceClass =
      "kb-face" +
      (spec.modifier ? " kb-face--mod" : "") +
      (spec.face ? " kb-face--" + spec.face : "");
    button.appendChild(make("div", faceClass, spec.content));
    wrap.appendChild(button);

    if (spec.code) {
      button.dataset.code = spec.code;
      if (!keyNodes.has(spec.code)) keyNodes.set(spec.code, []);
      keyNodes.get(spec.code).push(button);

      button.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        press(spec.code);
        type(spec.code);
        // preventDefault alone doesn't reliably keep focus off the button,
        // and physical typing must keep working after a click.
        if (input) input.focus();
      });
      button.addEventListener("pointerup", () => release(spec.code));
      button.addEventListener("pointerleave", () => release(spec.code, true));
      button.addEventListener("animationend", () => button.classList.remove("is-hit"));
    }
    return wrap;
  }

  function buildArrows() {
    const cluster = make("div", "kb-arrows");
    cluster.appendChild(buildKey({ code: "ArrowLeft", content: icon("caretLeft") }));

    const column = make("div", "kb-arrow-col");
    column.appendChild(buildKey({ code: "ArrowUp", h: 12, content: icon("caretUp") }));
    column.appendChild(buildKey({ code: "ArrowDown", h: 12, content: icon("caretDown") }));
    cluster.appendChild(column);

    cluster.appendChild(
      buildKey({ code: "ArrowRight", corner: "br", content: icon("caretRight") })
    );
    return cluster;
  }

  function build(mount) {
    const pad = make("div", "kb-pad");
    ROWS.forEach((row) => {
      const rowNode = make("div", "kb-row");
      row.forEach((spec) => {
        rowNode.appendChild(spec.arrows ? buildArrows() : buildKey(spec));
      });
      pad.appendChild(rowNode);
    });
    root = make("div", "kb-root");
    root.setAttribute("aria-hidden", "true");
    root.appendChild(pad);
    mount.appendChild(root);
  }

  function paint(code) {
    const nodes = keyNodes.get(code);
    if (!nodes) return;
    const on = pressed.has(code);
    nodes.forEach((n) => n.classList.toggle("is-pressed", on));
  }

  // A held-down class alone can flicker past too fast to notice on a quick tap,
  // so each press also starts a flash that outlives the press itself.
  function flash(code) {
    const nodes = keyNodes.get(code);
    if (!nodes) return;
    nodes.forEach((n) => {
      n.classList.remove("is-hit");
      void n.offsetWidth; // restart the animation when the same key is retapped
      n.classList.add("is-hit");
    });
  }

  function press(code) {
    if (pressed.has(code)) return;
    pressed.add(code);
    paint(code);
    flash(code);
    if (window.SubwayAudio) window.SubwayAudio.keyDown(code);
  }

  function release(code, silent) {
    if (!pressed.has(code)) return;
    // A clicked shift latches until the next character is typed.
    if (stickyShift && (code === "ShiftLeft" || code === "ShiftRight")) return;
    pressed.delete(code);
    paint(code);
    if (!silent && window.SubwayAudio) window.SubwayAudio.keyUp(code);
  }

  function shiftHeld() {
    return stickyShift || pressed.has("ShiftLeft") || pressed.has("ShiftRight");
  }

  function clearStickyShift() {
    if (!stickyShift) return;
    stickyShift = false;
    ["ShiftLeft", "ShiftRight"].forEach((c) => {
      pressed.delete(c);
      paint(c);
    });
  }

  // Click-to-type. Physical keystrokes reach the input on their own.
  function type(code) {
    if (!input) return;

    if (code === "ShiftLeft" || code === "ShiftRight") {
      stickyShift = !stickyShift;
      return;
    }
    if (code === "Enter") {
      clearStickyShift();
      if (form) form.requestSubmit();
      return;
    }
    if (code === "Backspace") {
      clearStickyShift();
      input.value = input.value.slice(0, -1);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    let char = null;
    if (code.startsWith("Key")) {
      const letter = code.slice(3);
      char = shiftHeld() ? letter : letter.toLowerCase();
    } else if (CHARS[code]) {
      char = CHARS[code][shiftHeld() ? 1 : 0];
    }
    if (char == null) return;

    clearStickyShift();
    input.value += char;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function init(options) {
    const mount = document.getElementById(options.mount);
    if (!mount) return;
    input = document.getElementById(options.input);
    form = document.getElementById(options.form);

    build(mount);

    let visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { threshold: 0.1 }
      ).observe(root);
    }

    document.addEventListener("keydown", (e) => {
      if (!visible || e.repeat) return;
      press(e.code);
    });
    document.addEventListener("keyup", (e) => {
      if (!visible) return;
      // A physical shift release should also drop the latch.
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") stickyShift = false;
      release(e.code);
    });
    // Keys held while the window loses focus never fire keyup.
    window.addEventListener("blur", () => {
      stickyShift = false;
      Array.from(pressed).forEach((code) => release(code, true));
    });
  }

  return { init };
})();
