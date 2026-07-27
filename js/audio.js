// Key sounds are Aceternity's recorded sprite (assets/sound.ogg) sliced with the
// component's own timing tables. The subway layer — tunnel rumble, brake squeal,
// door chime — is synthesised, since no recording ships with the component.

const SubwayAudio = (() => {
  // Sound sprite offsets from the component's config: [startMs, durationMs].
  const SOUND_DOWN = {
    Escape: [2894, 113], F1: [3610, 98], F2: [4210, 90], F3: [4758, 90],
    F4: [5250, 100], F5: [5831, 105], F6: [6396, 105], F7: [6900, 105],
    F8: [7443, 111], F9: [7955, 91], F10: [8504, 105], F11: [9046, 94],
    F12: [9582, 96], Backquote: [12476, 100], Digit1: [12946, 96],
    Digit2: [13470, 95], Digit3: [13963, 100], Digit4: [14481, 102],
    Digit5: [14994, 94], Digit6: [15505, 109], Digit7: [15990, 97],
    Digit8: [16529, 92], Digit9: [17012, 103], Digit0: [17550, 87],
    Minus: [18052, 93], Equal: [18553, 89], Backspace: [19065, 110],
    Tab: [21734, 119], KeyQ: [22245, 95], KeyW: [22790, 89], KeyE: [23317, 83],
    KeyR: [23817, 92], KeyT: [24297, 92], KeyY: [24811, 93], KeyU: [25313, 95],
    KeyI: [25795, 91], KeyO: [26309, 84], KeyP: [26804, 83],
    BracketLeft: [27330, 85], BracketRight: [27883, 99], Backslash: [28393, 100],
    CapsLock: [31011, 126], KeyA: [31542, 85], KeyS: [32031, 88],
    KeyD: [32492, 85], KeyF: [32973, 87], KeyG: [33453, 94], KeyH: [33986, 93],
    KeyJ: [34425, 88], KeyK: [34932, 90], KeyL: [35410, 95],
    Semicolon: [35914, 95], Quote: [36428, 87], Enter: [36902, 117],
    ShiftLeft: [38136, 133], KeyZ: [38694, 80], KeyX: [39148, 76],
    KeyC: [39632, 95], KeyV: [40136, 94], KeyB: [40621, 107], KeyN: [41103, 90],
    KeyM: [41610, 93], Comma: [42110, 92], Period: [42594, 90],
    Slash: [43105, 95], ShiftRight: [43565, 137], Fn: [44251, 110],
    ControlLeft: [45327, 83], AltLeft: [45750, 82], MetaLeft: [46199, 100],
    Space: [51541, 144], MetaRight: [47929, 75], AltRight: [49329, 82],
    ArrowUp: [44251, 110], ArrowLeft: [49837, 88], ArrowDown: [50333, 90],
    ArrowRight: [50783, 111],
  };

  // Release "thock": offset past the press, shorter.
  const SOUND_UP = {
    Escape: [3014, 100], F1: [3710, 90], F2: [4305, 80], F3: [4853, 80],
    F4: [5355, 90], F5: [5941, 95], F6: [6506, 95], F7: [7010, 95],
    F8: [7558, 100], F9: [8050, 80], F10: [8614, 95], F11: [9146, 85],
    F12: [9682, 85], Backquote: [12581, 90], Digit1: [13046, 85],
    Digit2: [13570, 85], Digit3: [14068, 90], Digit4: [14591, 90],
    Digit5: [15094, 85], Digit6: [15620, 100], Digit7: [16090, 90],
    Digit8: [16624, 85], Digit9: [17122, 90], Digit0: [17640, 80],
    Minus: [18152, 85], Equal: [18643, 85], Backspace: [19180, 100],
    Tab: [21859, 110], KeyQ: [22345, 85], KeyW: [22880, 85], KeyE: [23402, 80],
    KeyR: [23912, 85], KeyT: [24392, 85], KeyY: [24911, 85], KeyU: [25413, 85],
    KeyI: [25890, 85], KeyO: [26394, 80], KeyP: [26889, 80],
    BracketLeft: [27415, 80], BracketRight: [27988, 90], Backslash: [28498, 90],
    CapsLock: [31146, 110], KeyA: [31632, 80], KeyS: [32121, 80],
    KeyD: [32577, 80], KeyF: [33063, 80], KeyG: [33553, 85], KeyH: [34081, 85],
    KeyJ: [34515, 85], KeyK: [35027, 85], KeyL: [35510, 85],
    Semicolon: [36014, 85], Quote: [36518, 80], Enter: [37027, 105],
    ShiftLeft: [38276, 120], KeyZ: [38779, 75], KeyX: [39228, 70],
    KeyC: [39732, 85], KeyV: [40236, 85], KeyB: [40736, 95], KeyN: [41198, 85],
    KeyM: [41710, 85], Comma: [42205, 85], Period: [42689, 85],
    Slash: [43205, 85], ShiftRight: [43710, 125], Fn: [44366, 100],
    ControlLeft: [45412, 80], AltLeft: [45835, 80], MetaLeft: [46304, 90],
    Space: [51691, 130], MetaRight: [48004, 70], AltRight: [49414, 80],
    ArrowUp: [44366, 100], ArrowLeft: [49927, 85], ArrowDown: [50428, 80],
    ArrowRight: [50898, 100],
  };

  const STORAGE_KEY = "subway:muted";

  let ctx = null;
  let master = null;
  let sprite = null;
  let rumbleGain = null;
  let started = false;
  let muted = false;
  let button = null;

  function setup() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);

    fetch("assets/sound.ogg")
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(res.status)))
      .then((data) => ctx.decodeAudioData(data))
      .then((decoded) => {
        sprite = decoded;
      })
      .catch(() => {
        // Serving over file:// blocks the fetch. Keys still animate silently.
        console.warn("Key sounds unavailable — serve over http:// to enable them.");
      });
  }

  function noiseBuffer(seconds) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  }

  // The tunnel bed loops for the whole session; transit just swells it.
  function startRumble() {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(3);
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 110;
    lowpass.Q.value = 0.7;

    rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.02;

    source.connect(lowpass);
    lowpass.connect(rumbleGain);
    rumbleGain.connect(master);
    source.start();
  }

  function ensure() {
    if (!ctx) return false;
    if (ctx.state === "suspended") ctx.resume();
    if (!started) {
      started = true;
      startRumble();
    }
    return true;
  }

  function playSlice(table, code) {
    if (!ensure() || !sprite) return;
    const def = table[code];
    if (!def) return;
    const source = ctx.createBufferSource();
    source.buffer = sprite;
    source.connect(master);
    source.start(0, def[0] / 1000, def[1] / 1000);
  }

  function tone(freq, delay, duration, peak, type) {
    const at = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, at);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }

  function squeal() {
    const at = ctx.currentTime;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 14;
    band.frequency.setValueAtTime(2400, at);
    band.frequency.exponentialRampToValueAtTime(1200, at + 0.55);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.07, at + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.6);

    [2300, 2317].forEach((start) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(start, at);
      osc.frequency.exponentialRampToValueAtTime(start / 2, at + 0.55);
      osc.connect(band);
      osc.start(at);
      osc.stop(at + 0.62);
    });

    band.connect(gain);
    gain.connect(master);
  }

  function ramp(target, seconds) {
    if (!rumbleGain) return;
    const at = ctx.currentTime;
    rumbleGain.gain.cancelScheduledValues(at);
    rumbleGain.gain.setValueAtTime(rumbleGain.gain.value, at);
    rumbleGain.gain.linearRampToValueAtTime(target, at + seconds);
  }

  function applyMute() {
    if (master) master.gain.value = muted ? 0 : 0.9;
    if (button) {
      button.classList.toggle("is-muted", muted);
      button.setAttribute("aria-pressed", String(muted));
      button.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    }
  }

  function toggleMute() {
    muted = !muted;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
    } catch (err) {
      // Private mode — the preference just won't persist.
    }
    applyMute();
    if (!muted) ensure();
  }

  function init(options) {
    try {
      muted = localStorage.getItem(STORAGE_KEY) === "1";
    } catch (err) {
      muted = false;
    }

    button = document.getElementById(options.button);
    if (button) button.addEventListener("click", toggleMute);

    setup();
    applyMute();

    document.addEventListener("subway:depart", () => {
      if (ensure()) ramp(0.17, 0.6);
    });
    document.addEventListener("subway:arrive", () => {
      if (!ensure()) return;
      ramp(0.02, 0.9);
      squeal();
      // Doors open a beat after the train settles.
      tone(1174.66, 0.55, 0.22, 0.05);
      tone(880, 0.72, 0.26, 0.05);
    });
    document.addEventListener("subway:wrong", () => {
      if (ensure()) tone(110, 0, 0.16, 0.05, "square");
    });
  }

  return {
    init: init,
    keyDown: (code) => playSlice(SOUND_DOWN, code),
    keyUp: (code) => playSlice(SOUND_UP, code),
  };
})();

window.SubwayAudio = SubwayAudio;
