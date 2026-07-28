// Hand-drawn geographic data for the playable 6 line. Coordinates live in a
// stable world space so future lines can share stations and geography.
const SubwayMapData = {
  // Extra world padding lets terminal stations sit at screen center without
  // exposing an empty edge when the full-page camera follows the route.
  width: 1600,
  height: 2920,
  bounds: { x: -300, y: -450, width: 1600, height: 2920 },
  lines: {
    "6": {
      name: "Lexington Av Local",
      color: "#00933C",
      stationIds: [
        "pelham-bay-park", "buhre-avenue", "middletown-road", "westchester-square",
        "zerega-avenue", "castle-hill-avenue", "parkchester", "st-lawrence-avenue",
        "morrison-avenue", "elder-avenue", "whitlock-avenue", "hunts-point-avenue",
        "longwood-avenue", "east-149", "east-143", "cypress-avenue", "brook-avenue",
        "third-avenue-138", "125-street", "116-street", "110-street", "103-street",
        "96-street", "86-street", "77-street", "68-street", "59-street", "51-street",
        "grand-central", "33-street", "28-street", "23-street", "union-square",
        "astor-place", "bleecker-street", "spring-street", "canal-street", "brooklyn-bridge",
      ],
    },
  },
  // Future routes will add line IDs to these records and use the same station
  // ID for transfers. The current game continues to use Stations.list.
  stations: {
    "pelham-bay-park": { name: "Pelham Bay Park", x: 790, y: 130, lines: ["6"] },
    "buhre-avenue": { name: "Buhre Avenue", x: 775, y: 180, lines: ["6"] },
    "middletown-road": { name: "Middletown Road", x: 750, y: 230, lines: ["6"] },
    "westchester-square": { name: "Westchester Square–East Tremont Avenue", x: 720, y: 285, lines: ["6"] },
    "zerega-avenue": { name: "Zerega Avenue", x: 690, y: 335, lines: ["6"] },
    "castle-hill-avenue": { name: "Castle Hill Avenue", x: 655, y: 380, lines: ["6"] },
    parkchester: { name: "Parkchester", x: 615, y: 420, lines: ["6"] },
    "st-lawrence-avenue": { name: "St. Lawrence Avenue", x: 580, y: 465, lines: ["6"] },
    "morrison-avenue": { name: "Morrison Avenue–Soundview", x: 550, y: 505, lines: ["6"] },
    "elder-avenue": { name: "Elder Avenue", x: 525, y: 550, lines: ["6"] },
    "whitlock-avenue": { name: "Whitlock Avenue", x: 500, y: 595, lines: ["6"] },
    "hunts-point-avenue": { name: "Hunts Point Avenue", x: 470, y: 640, lines: ["6"] },
    "longwood-avenue": { name: "Longwood Avenue", x: 445, y: 685, lines: ["6"] },
    "east-149": { name: "East 149th Street", x: 420, y: 730, lines: ["6"] },
    "east-143": { name: "East 143rd Street–St. Mary's Street", x: 395, y: 770, lines: ["6"] },
    "cypress-avenue": { name: "Cypress Avenue", x: 370, y: 815, lines: ["6"] },
    "brook-avenue": { name: "Brook Avenue", x: 345, y: 860, lines: ["6"] },
    "third-avenue-138": { name: "Third Avenue–138th Street", x: 320, y: 905, lines: ["6"] },
    "125-street": { name: "125th Street", x: 305, y: 960, lines: ["6"] },
    "116-street": { name: "116th Street", x: 305, y: 1015, lines: ["6"] },
    "110-street": { name: "110th Street", x: 305, y: 1070, lines: ["6"] },
    "103-street": { name: "103rd Street", x: 305, y: 1125, lines: ["6"] },
    "96-street": { name: "96th Street", x: 305, y: 1180, lines: ["6"] },
    "86-street": { name: "86th Street", x: 305, y: 1235, lines: ["6"] },
    "77-street": { name: "77th Street", x: 305, y: 1290, lines: ["6"] },
    "68-street": { name: "68th Street–Hunter College", x: 305, y: 1345, lines: ["6"] },
    "59-street": { name: "59th Street", x: 305, y: 1400, lines: ["6"] },
    "51-street": { name: "51st Street", x: 305, y: 1455, lines: ["6"] },
    "grand-central": { name: "Grand Central–42nd Street", x: 305, y: 1510, lines: ["6"] },
    "33-street": { name: "33rd Street", x: 305, y: 1565, lines: ["6"] },
    "28-street": { name: "28th Street", x: 305, y: 1620, lines: ["6"] },
    "23-street": { name: "23rd Street–Baruch College", x: 305, y: 1675, lines: ["6"] },
    "union-square": { name: "14th Street–Union Square", x: 305, y: 1730, lines: ["6"] },
    "astor-place": { name: "Astor Place", x: 305, y: 1785, lines: ["6"] },
    "bleecker-street": { name: "Bleecker Street", x: 305, y: 1840, lines: ["6"] },
    "spring-street": { name: "Spring Street", x: 305, y: 1895, lines: ["6"] },
    "canal-street": { name: "Canal Street", x: 305, y: 1945, lines: ["6"] },
    "brooklyn-bridge": { name: "Brooklyn Bridge–City Hall", x: 305, y: 1985, lines: ["6"] },
  },
};

window.SubwayMapData = SubwayMapData;
