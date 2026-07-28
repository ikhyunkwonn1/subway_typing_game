// Visual-only map renderer. It deliberately has no typing or scoring logic.
const TransitMap = (() => {
  const NS = "http://www.w3.org/2000/svg";
  // The taller scene panel shows a broader stretch of the route at each stop.
  const CAMERA = { width: 900, height: 480 };
  let svg;
  let data;
  let line;
  let marker;
  let stationNodes = [];
  let camera = { x: 0, y: 0, width: CAMERA.width, height: CAMERA.height };
  let visualIndex = 0;
  let activeTimeline = null;
  let queue = [];
  let callbacks = {};

  function node(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function stationAt(index) {
    return data.stations[line.stationIds[index]];
  }

  function cameraFor(index) {
    const station = stationAt(index);
    const centerX = clamp(station.x + 75, CAMERA.width / 2, data.width - CAMERA.width / 2);
    const centerY = clamp(station.y, CAMERA.height / 2, data.height - CAMERA.height / 2);
    return { x: centerX - CAMERA.width / 2, y: centerY - CAMERA.height / 2, width: CAMERA.width, height: CAMERA.height };
  }

  function paintCamera() {
    svg.setAttribute("viewBox", `${camera.x} ${camera.y} ${camera.width} ${camera.height}`);
  }

  function paintMarker(index) {
    const station = stationAt(index);
    marker.setAttribute("transform", `translate(${station.x} ${station.y})`);
  }

  function drawGeography() {
    svg.appendChild(node("rect", { x: 0, y: 0, width: data.width, height: data.height, fill: "#d9edf4" }));

    const bronx = node("path", {
      d: "M0 0H1000V770L785 780 690 720 605 680 495 705 410 790 260 870 0 900Z",
      fill: "#f8f4e8",
    });
    const manhattan = node("path", {
      d: "M155 820C260 790 440 815 505 900L455 2020H155Z",
      fill: "#fbf7eb",
    });
    svg.append(bronx, manhattan);

    const eastRiver = node("path", {
      d: "M505 780C640 860 650 1040 560 1230 535 1360 555 1590 495 2020H1000V780Z",
      fill: "#b9e2ef",
    });
    const harlem = node("path", { d: "M260 820C340 760 430 750 520 780L505 900C400 875 325 880 260 930Z", fill: "#b9e2ef" });
    const sound = node("path", { d: "M740 0H1000V240L880 220 800 165Z", fill: "#b9e2ef" });
    svg.append(eastRiver, harlem, sound);

    // Quiet neighborhood blocks give each camera position a distinct sense of
    // place without trying to recreate real buildings or a tile map.
    const blocks = node("g", { opacity: 0.78 });
    [
      [105, 115, 145, 72, "#f1d9c9"], [300, 165, 122, 85, "#e4d9ef"],
      [440, 250, 130, 78, "#f2e5bd"], [155, 335, 175, 85, "#d8e6d0"],
      [330, 455, 108, 105, "#f0d5cf"], [115, 570, 158, 75, "#e6d8ef"],
      [275, 675, 120, 65, "#f5e4b7"], [95, 755, 138, 82, "#d7e5ef"],
      [175, 945, 86, 62, "#f0dcc7"], [365, 1015, 80, 78, "#e6d8ef"],
      [180, 1200, 94, 64, "#f1e4ba"], [350, 1310, 86, 70, "#d7e7d4"],
      [175, 1440, 100, 74, "#efd5cf"], [350, 1535, 94, 68, "#d6e3ee"],
      [175, 1710, 100, 70, "#f1e4ba"], [350, 1830, 90, 70, "#e6d8ef"],
    ].forEach(([x, y, width, height, fill]) => blocks.appendChild(node("rect", { x, y, width, height, rx: 13, fill })));
    svg.appendChild(blocks);

    [
      [660, 75, 210, 130, "#b9dca8"], [490, 300, 130, 100, "#c9e4ae"],
      [195, 1110, 145, 225, "#b8d99d"], [205, 1610, 85, 105, "#c4e3a9"],
    ].forEach(([x, y, width, height, fill]) => svg.appendChild(node("rect", { x, y, width, height, rx: 24, fill })));

    const roads = node("g", { fill: "none", stroke: "#e6dfcf", "stroke-width": 13, "stroke-linecap": "round", opacity: 0.95 });
    [
      "M70 180C250 220 420 285 720 285", "M45 455C255 430 440 500 695 620",
      "M85 705C240 665 470 665 780 750", "M210 905L425 1985",
      "M120 1010L480 1010", "M165 1215L475 1215", "M165 1430L470 1430",
      "M170 1650L465 1650", "M170 1850L455 1850",
    ].forEach((d) => roads.appendChild(node("path", { d })));
    svg.appendChild(roads);

    const labels = node("g", { fill: "#6b7270", "font-family": "Inter Tight, Arial, sans-serif", "font-size": 26, "font-weight": 600, "letter-spacing": 3 });
    [[195, 1325, "MANHATTAN"], [690, 1120, "EAST RIVER"]].forEach(([x, y, text]) => {
      const label = node("text", { x, y, opacity: 0.72 });
      label.textContent = text;
      labels.appendChild(label);
    });
    svg.appendChild(labels);
  }

  function drawRoute() {
    const points = line.stationIds.map((id) => data.stations[id]);
    const d = points.map((station, index) => `${index ? "L" : "M"}${station.x} ${station.y}`).join(" ");
    svg.appendChild(node("path", { d, fill: "none", stroke: "#ffffff", "stroke-width": 16, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.9 }));
    svg.appendChild(node("path", { d, fill: "none", stroke: line.color, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" }));

    const stationsLayer = node("g", { class: "map-stations" });
    stationNodes = points.map((station) => {
      const outer = node("circle", { cx: station.x, cy: station.y, r: 11, fill: "#ffffff", stroke: line.color, "stroke-width": 5 });
      stationsLayer.appendChild(outer);
      return outer;
    });
    svg.appendChild(stationsLayer);

    marker = node("g", { class: "map-train" });
    marker.appendChild(node("circle", { r: 23, fill: line.color, stroke: "#ffffff", "stroke-width": 5 }));
    marker.appendChild(node("rect", { x: -12, y: -9, width: 24, height: 18, rx: 5, fill: "#ffffff" }));
    marker.appendChild(node("path", { d: "M-7 3H7M-7-2H-2M2-2H7M-7 10V13M7 10V13", fill: "none", stroke: line.color, "stroke-width": 3, "stroke-linecap": "round" }));
    svg.appendChild(marker);
  }

  function setProgress(index) {
    stationNodes.forEach((station, stationIndex) => {
      station.classList.toggle("is-complete", stationIndex < index);
      station.classList.toggle("is-current", stationIndex === index);
    });
  }

  function runNext() {
    if (!queue.length) return;
    const job = queue.shift();
    const destination = stationAt(job.toIndex);
    const destinationCamera = cameraFor(job.toIndex);
    if (callbacks.onDepart) callbacks.onDepart();

    const markerState = { x: stationAt(visualIndex).x, y: stationAt(visualIndex).y };
    activeTimeline = gsap.timeline({
      onComplete: () => {
        visualIndex = job.toIndex;
        activeTimeline = null;
        if (callbacks.onArrive) callbacks.onArrive();
        if (job.onComplete) job.onComplete();
        runNext();
      },
    });
    activeTimeline
      .to(markerState, {
        x: destination.x,
        y: destination.y,
        duration: 1.15,
        ease: "power2.inOut",
        onUpdate: () => marker.setAttribute("transform", `translate(${markerState.x} ${markerState.y})`),
      })
      .to(camera, {
        x: destinationCamera.x,
        y: destinationCamera.y,
        duration: 1.15,
        ease: "power2.inOut",
        onUpdate: paintCamera,
      }, "<");
  }

  function init(options) {
    svg = document.getElementById(options.svgId);
    data = options.data;
    line = data.lines[options.lineId];
    callbacks = options;
    svg.innerHTML = "";
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-label", "Simplified map following the 6 train route");
    drawGeography();
    drawRoute();
    reset(0);
  }

  function reset(index) {
    if (activeTimeline) activeTimeline.kill();
    activeTimeline = null;
    queue = [];
    visualIndex = index;
    camera = cameraFor(index);
    paintCamera();
    paintMarker(index);
    setProgress(index);
  }

  function queueTransition(fromIndex, toIndex, onComplete) {
    if (!marker) return;
    setProgress(toIndex);
    queue.push({ fromIndex, toIndex, onComplete });
    if (!activeTimeline) runNext();
  }

  return { init, reset, setProgress, queueTransition };
})();

window.TransitMap = TransitMap;
