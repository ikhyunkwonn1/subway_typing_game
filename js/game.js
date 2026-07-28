const Game = (() => {
  const stations = Stations.list;
  const DOT_SPACING = 34;
  const DOT_MARGIN = 20;
  const TRACK_IDLE = "#2a2e35";
  const DOT_STROKE = "#08090b";

  // Competitive mode: seconds allowed per station. Flat for every stop, so the
  // long Bronx names are the ones that bite. Retune here.
  const QUESTION_TIME = 10;
  const MODE_KEY = "subway:mode";
  const RING_INSET = 0.5; // centres the 2px stroke on the pill's 1px border

  let currentIndex = 0;
  let activeTimeline = null;
  let transitQueue = [];
  let startedAt = null;
  let tickHandle = null;
  let questionTimeline = null;
  let ringLength = 0;
  let mode = "casual";
  let runOver = false;
  const drain = { p: 0 }; // 0 = full perimeter, 1 = burnt out
  const els = {};

  function cacheEls() {
    els.progressMap = document.getElementById("progress-map");
    els.progressWrap = document.querySelector(".progress-map-wrap");
    els.signName = document.getElementById("sign-station-name");
    els.trackBar = document.getElementById("track-bar");
    els.prevChip = document.getElementById("prev-stop");
    els.prevStopName = document.getElementById("prev-stop-name");
    els.nextStopName = document.getElementById("next-stop-name");
    els.form = document.getElementById("answer-form");
    els.input = document.getElementById("answer-input");
    els.feedback = document.getElementById("feedback");
    els.winOverlay = document.getElementById("win-overlay");
    els.restartBtn = document.getElementById("restart-btn");
    els.trainCar1 = document.getElementById("train-car-1");
    els.trainCar2 = document.getElementById("train-car-2");
    els.tunnelLights = document.getElementById("tunnel-lights");
    els.stopCounter = document.getElementById("stop-counter");
    els.trainBlur = document.getElementById("train-blur");
    els.timer = document.getElementById("timer");
    els.modeToggle = document.getElementById("mode-toggle");
    els.ring = document.getElementById("question-ring");
    els.ringFill = document.getElementById("question-ring-fill");
    els.resultEyebrow = document.getElementById("result-eyebrow");
    els.resultTitle = document.getElementById("result-title");
    els.resultBody = document.getElementById("result-body");
  }

  function emit(name) {
    document.dispatchEvent(new CustomEvent(name));
  }

  function setBlur(amount) {
    els.trainBlur.setAttribute("stdDeviation", amount + " 0");
  }

  function updateCounter() {
    els.stopCounter.textContent =
      String(currentIndex + 1).padStart(2, "0") + " / " + stations.length;
  }

  // Elapsed time is read off the clock on every tick rather than accumulated,
  // so a throttled interval (background tab, slow frame) can't make it drift.
  function paintTimer() {
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    els.timer.textContent =
      String(Math.floor(seconds / 60)).padStart(2, "0") +
      ":" +
      String(seconds % 60).padStart(2, "0");
  }

  // Fires on the first character typed, from either the physical keyboard or a keycap.
  function startTimer() {
    if (startedAt !== null) return;
    startedAt = Date.now();
    els.timer.classList.remove("is-idle");
    tickHandle = setInterval(paintTimer, 250);
    // The round begins on this keystroke, so the first station's clock does too.
    startQuestionClock();
  }

  function stopTimer() {
    if (startedAt === null) return;
    clearInterval(tickHandle);
    tickHandle = null;
    paintTimer(); // land on the exact final second
  }

  function resetTimer() {
    clearInterval(tickHandle);
    tickHandle = null;
    startedAt = null;
    els.timer.classList.add("is-idle");
    els.timer.textContent = "00:00";
  }

  // ---------- Competitive mode: per-question clock ----------

  function lengthToPx(value, basis) {
    return value.endsWith("%") ? (parseFloat(value) / 100) * basis : parseFloat(value);
  }

  // CSS shrinks every corner radius by one shared factor when they overflow the
  // box, while SVG clamps each axis independently — so tracing the pill means
  // redoing the CSS maths, or the line sits off its border.
  function pillRadii(w, h) {
    const corner = getComputedStyle(els.trackBar).borderTopLeftRadius.split(" ");
    const rx = lengthToPx(corner[0], w);
    const ry = lengthToPx(corner[1] || corner[0], h);
    const scale = Math.min(1, w / (rx * 2), h / (ry * 2));
    return { rx: rx * scale, ry: ry * scale };
  }

  // Starts at top-centre and runs clockwise, so the burn reads like a clock hand.
  function pillPath(w, h, rx, ry) {
    const left = RING_INSET;
    const top = RING_INSET;
    const right = w - RING_INSET;
    const bottom = h - RING_INSET;
    const ax = Math.max(0, rx - RING_INSET);
    const ay = Math.max(0, ry - RING_INSET);
    const arc = `A ${ax} ${ay} 0 0 1`;

    return (
      `M ${w / 2} ${top} H ${right - ax} ${arc} ${right} ${top + ay}` +
      ` V ${bottom - ay} ${arc} ${right - ax} ${bottom}` +
      ` H ${left + ax} ${arc} ${left} ${bottom - ay}` +
      ` V ${top + ay} ${arc} ${left + ax} ${top} H ${w / 2}`
    );
  }

  // A negative offset walks the dash forward along the path, so the unlit run
  // grows clockwise from top-centre and the lit remainder closes in behind it.
  function paintRing(p) {
    els.ringFill.setAttribute("stroke-dasharray", ringLength);
    els.ringFill.setAttribute("stroke-dashoffset", -p * ringLength);
  }

  // Re-measured on resize, so a mid-question reflow can't desync the drain.
  function layoutRing() {
    const w = els.trackBar.offsetWidth;
    const h = els.trackBar.offsetHeight;
    if (!w || !h) return;

    const { rx, ry } = pillRadii(w, h);
    els.ring.setAttribute("viewBox", "0 0 " + w + " " + h);
    els.ringFill.setAttribute("d", pillPath(w, h, rx, ry));
    ringLength = els.ringFill.getTotalLength();
    paintRing(drain.p);
  }

  // Driven by GSAP rather than the wall clock, so a hidden tab pauses the
  // question instead of failing the player the moment they come back.
  function startQuestionClock() {
    stopQuestionClock();
    if (mode !== "competitive" || runOver || startedAt === null) return;

    questionTimeline = gsap.timeline({ onComplete: failRun }).to(drain, {
      p: 1,
      duration: QUESTION_TIME,
      ease: "none",
      onUpdate: () => paintRing(drain.p),
    });
  }

  function stopQuestionClock() {
    if (questionTimeline) {
      questionTimeline.kill();
      questionTimeline = null;
    }
    drain.p = 0;
    paintRing(0);
  }

  function applyMode() {
    document.body.classList.toggle("is-competitive", mode === "competitive");
    layoutRing();
    els.modeToggle.querySelectorAll(".mode-btn").forEach((btn) => {
      const on = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  // No fair way to switch mid-ride, so a mode change restarts the run.
  function setMode(next) {
    if (next === mode) return;
    mode = next;
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch (err) {
      // Private mode — the preference just won't persist.
    }
    applyMode();
    reset();
  }

  function svgEl(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  function buildProgressMap() {
    const svg = els.progressMap;
    svg.innerHTML = "";
    const width = DOT_MARGIN * 2 + DOT_SPACING * (stations.length - 1);
    svg.setAttribute("width", width);
    svg.setAttribute("viewBox", `0 0 ${width} 56`);

    const lineY = 28;
    const track = svgEl("line");
    track.setAttribute("x1", DOT_MARGIN);
    track.setAttribute("y1", lineY);
    track.setAttribute("x2", width - DOT_MARGIN);
    track.setAttribute("y2", lineY);
    track.setAttribute("stroke", TRACK_IDLE);
    track.setAttribute("stroke-width", 6);
    track.setAttribute("stroke-linecap", "round");
    svg.appendChild(track);

    const progressLine = svgEl("line");
    progressLine.setAttribute("id", "progress-line-fill");
    progressLine.setAttribute("x1", DOT_MARGIN);
    progressLine.setAttribute("y1", lineY);
    progressLine.setAttribute("x2", DOT_MARGIN);
    progressLine.setAttribute("y2", lineY);
    progressLine.setAttribute("stroke", Stations.LINE_COLOR);
    progressLine.setAttribute("stroke-width", 6);
    progressLine.setAttribute("stroke-linecap", "round");
    svg.appendChild(progressLine);

    stations.forEach((name, i) => {
      const cx = DOT_MARGIN + i * DOT_SPACING;
      const circle = svgEl("circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", lineY);
      circle.setAttribute("r", i === currentIndex ? 9 : 5);
      circle.setAttribute("fill", i <= currentIndex ? Stations.LINE_COLOR : TRACK_IDLE);
      circle.setAttribute("stroke", DOT_STROKE);
      circle.setAttribute("stroke-width", 2);
      circle.classList.add("progress-dot");

      const title = svgEl("title");
      title.textContent = name;
      circle.appendChild(title);
      svg.appendChild(circle);
    });
  }

  function updateProgressMap() {
    const svg = els.progressMap;
    const dots = svg.querySelectorAll(".progress-dot");
    dots.forEach((dot, i) => {
      gsap.to(dot, {
        attr: {
          r: i === currentIndex ? 9 : 5,
          fill: i <= currentIndex ? Stations.LINE_COLOR : TRACK_IDLE,
        },
        duration: 0.35,
      });
    });

    const progressLine = svg.querySelector("#progress-line-fill");
    const cx = DOT_MARGIN + currentIndex * DOT_SPACING;
    gsap.to(progressLine, { attr: { x2: cx }, duration: 0.5, ease: "power2.out" });

    const wrap = els.progressWrap;
    const targetScroll = Math.max(0, cx - wrap.clientWidth / 2);
    gsap.to(wrap, { scrollLeft: targetScroll, duration: 0.5, ease: "power2.out" });
  }

  function render() {
    els.signName.textContent = stations[currentIndex];
    updateCounter();

    if (currentIndex > 0) {
      els.prevStopName.textContent = stations[currentIndex - 1];
      els.prevChip.classList.remove("is-empty");
    } else {
      els.prevStopName.textContent = "";
      els.prevChip.classList.add("is-empty");
    }

    els.nextStopName.textContent = stations[currentIndex + 1];

    els.input.value = "";
    els.input.focus();
    els.feedback.textContent = "";

    // No-op until the round has actually begun, and in casual mode.
    startQuestionClock();
  }

  function shakeInput() {
    els.input.classList.add("wrong");
    gsap.fromTo(
      els.input,
      { x: 0 },
      {
        x: 10,
        duration: 0.07,
        repeat: 5,
        yoyo: true,
        ease: "power1.inOut",
        onComplete: () => {
          gsap.set(els.input, { x: 0 });
          els.input.classList.remove("wrong");
        },
      }
    );
  }

  function resetTransitVisuals() {
    gsap.set([els.trainCar1, els.trainCar2], { x: 0 });
    gsap.set(els.tunnelLights, { x: 0 });
    setBlur(0);
  }

  // Plays the depart/transit/arrive loop as a self-contained visual effect,
  // independent of game state. The +=/-= tweens net to zero over a full
  // cycle, always returning the train to wherever it started.
  function buildTransitTimeline(onComplete) {
    emit("subway:depart");
    const train = [els.trainCar1, els.trainCar2];
    const blur = { amount: 0 };
    const applyBlur = () => setBlur(blur.amount);

    activeTimeline = gsap.timeline({
      onComplete: () => {
        activeTimeline = null;
        emit("subway:arrive");
        if (onComplete) onComplete();
        runQueuedTransit();
      },
    })
      .to(train, { x: "+=900", duration: 0.7, ease: "power2.in" })
      .to(els.tunnelLights, { x: "-=700", duration: 0.7, ease: "none" }, "<")
      .to(blur, { amount: 7, duration: 0.5, ease: "power2.in", onUpdate: applyBlur }, "<")
      .set(train, { x: "-=1800" })
      .set(els.tunnelLights, { x: "+=1400" })
      .to(train, { x: "+=900", duration: 0.7, ease: "power2.out" })
      .to(els.tunnelLights, { x: "-=700", duration: 0.7, ease: "none" }, "<")
      .to(blur, { amount: 0, duration: 0.55, ease: "power2.out", onUpdate: applyBlur }, "<");
  }

  // Answering fast enough to trigger a second transit before the first one
  // finishes used to kill the running timeline mid-flight, leaving the train
  // mid-transform and making the next run visually stutter/lag. Queue it
  // instead so each transit always plays out fully before the next starts.
  function runQueuedTransit() {
    if (transitQueue.length === 0) return;
    const next = transitQueue.shift();
    buildTransitTimeline(next);
  }

  function queueTransit(onComplete) {
    if (activeTimeline) {
      transitQueue.push(onComplete || null);
    } else {
      buildTransitTimeline(onComplete);
    }
  }

  function playTransit() {
    queueTransit();
  }

  function playFinalTransit() {
    queueTransit(() => {
      currentIndex += 1;
      updateProgressMap();
      els.signName.textContent = stations[currentIndex];
      showWin();
    });
  }

  function commitAdvance() {
    currentIndex += 1;
    updateProgressMap();
    render();
  }

  function advance() {
    commitAdvance();
    playTransit();
  }

  // One card serves both endings; only the copy and the accent differ.
  function showResult(eyebrow, title, body, failed) {
    runOver = true;
    stopQuestionClock();
    els.resultEyebrow.textContent = eyebrow;
    els.resultTitle.textContent = title;
    els.resultBody.textContent = body;
    els.winOverlay.classList.toggle("is-fail", failed);
    els.trackBar.classList.add("hidden");
    els.winOverlay.classList.remove("hidden");
  }

  function showWin() {
    stopTimer();
    updateCounter();
    showResult(
      "End of the line",
      stations[stations.length - 1],
      "All " + stations.length + " stops from " + stations[0] + " in " +
        els.timer.textContent + ". Everybody off.",
      false
    );
  }

  function failRun() {
    stopTimer();
    emit("subway:wrong");
    showResult(
      "Missed the last train",
      stations[currentIndex],
      "Out of time at stop " + (currentIndex + 1) + " of " + stations.length +
        ". Total time " + els.timer.textContent + ".",
      true
    );
  }

  function reset() {
    currentIndex = 0;
    runOver = false;
    resetTimer();
    stopQuestionClock();
    if (activeTimeline) activeTimeline.kill();
    activeTimeline = null;
    transitQueue = [];
    resetTransitVisuals();
    els.trackBar.classList.remove("hidden");
    els.winOverlay.classList.add("hidden");
    buildProgressMap();
    render();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (runOver || currentIndex === stations.length - 1) return;

    const value = els.input.value.trim();
    if (!value) return;

    const target = stations[currentIndex];
    if (Normalize.matches(value, target)) {
      // Stop the clock on the answered station; render() starts the next one.
      stopQuestionClock();
      if (currentIndex === stations.length - 2) {
        playFinalTransit();
      } else {
        advance();
      }
    } else {
      els.feedback.textContent = "Not quite — check the spelling and try again.";
      emit("subway:wrong");
      shakeInput();
    }
  }

  function init() {
    cacheEls();
    try {
      mode = localStorage.getItem(MODE_KEY) === "competitive" ? "competitive" : "casual";
    } catch (err) {
      mode = "casual";
    }
    applyMode();
    if ("ResizeObserver" in window) {
      new ResizeObserver(layoutRing).observe(els.trackBar);
    }

    els.form.addEventListener("submit", handleSubmit);
    els.input.addEventListener("input", startTimer);
    els.restartBtn.addEventListener("click", reset);
    els.modeToggle.addEventListener("click", (e) => {
      const btn = e.target.closest(".mode-btn");
      if (btn) setMode(btn.dataset.mode);
    });
    SubwayAudio.init({ button: "mute-btn" });
    SubwayKeyboard.init({
      mount: "keyboard",
      input: "answer-input",
      form: "answer-form",
    });
    buildProgressMap();
    render();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Game.init);
