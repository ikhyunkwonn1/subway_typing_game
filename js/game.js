const Game = (() => {
  const stations = Stations.list;
  const DOT_SPACING = 34;
  const DOT_MARGIN = 20;

  let currentIndex = 0;
  let animating = false;
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
    track.setAttribute("stroke", "#2a3357");
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
      circle.setAttribute("fill", i <= currentIndex ? Stations.LINE_COLOR : "#2a3357");
      circle.setAttribute("stroke", "#0b0f1e");
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
          fill: i <= currentIndex ? Stations.LINE_COLOR : "#2a3357",
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

  function advance() {
    animating = true;
    const train = [els.trainCar1, els.trainCar2];

    gsap.timeline({
      onComplete: () => {
        currentIndex += 1;
        updateProgressMap();
        animating = false;
        if (currentIndex === stations.length - 1) {
          els.signName.textContent = stations[currentIndex];
          showWin();
        } else {
          render();
        }
      },
    })
      .to(train, { x: "+=900", duration: 0.7, ease: "power2.in" })
      .to(els.tunnelLights, { x: "-=700", duration: 0.7, ease: "none" }, "<")
      .set(train, { x: "-=1800" })
      .set(els.tunnelLights, { x: "+=1400" })
      .to(train, { x: "+=900", duration: 0.7, ease: "power2.out" })
      .to(els.tunnelLights, { x: "-=700", duration: 0.7, ease: "none" }, "<");
  }

  function showWin() {
    els.trackBar.classList.add("hidden");
    els.winOverlay.classList.remove("hidden");
  }

  function reset() {
    currentIndex = 0;
    gsap.set([els.trainCar1, els.trainCar2], { x: 0 });
    gsap.set(els.tunnelLights, { x: 0 });
    els.trackBar.classList.remove("hidden");
    els.winOverlay.classList.add("hidden");
    buildProgressMap();
    render();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (animating || currentIndex === stations.length - 1) return;

    const value = els.input.value.trim();
    if (!value) return;

    const target = stations[currentIndex];
    if (Normalize.matches(value, target)) {
      advance();
    } else {
      els.feedback.textContent = "Not quite — check the spelling and try again.";
      shakeInput();
    }
  }

  function init() {
    cacheEls();
    els.form.addEventListener("submit", handleSubmit);
    els.restartBtn.addEventListener("click", reset);
    buildProgressMap();
    render();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Game.init);
