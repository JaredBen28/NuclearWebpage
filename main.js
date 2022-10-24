var powerGauge, coolentGauge, coreGauge;
var clockInterval;
var clockID = $('#clock');
var clockState = false;


$(function() {
  createGauges();
  renderGauges();
});

$(clockID).click(function(){
  if (!clockState) {
    console.log("Clock Start");
    clockInterval = setInterval("randomUpdates()", 1000);
    clockState = true;
  } else {
    console.log("Clock Stop")
    clearInterval(clockInterval);
    clockState = false;
  }
});

function createGauges() {
  createCoreTempGauge();
  createCoolentTempGauge();
  createPowerOutputGauge();
};

function createCoreTempGauge() {
  coreGauge = new LinearGauge({
    renderTo: 'core',
    units: "°C",
    title: "Core Temperature",
    height: 700,
    minValue: 0,
    maxValue: 100,
    barBeginCircle: false,
    highlights: [
      { "from": 0, "to": 50, "color": "rgba(0,255,0,.75)" },
      { "from": 50, "to": 85, "color": "rgba(255,255,0,.75)" },
      { "from": 85, "to": 100, "color": "rgba(255,0,0,.75)" },
    ],
    colorTitle: "#000",
    colorUnits: "#000",
    colorNumbers: "#000",
    borders: true,
    animationDuration: 15000,
    animationRule: "cycle",
  });
}

function createCoolentTempGauge() {
  coolentGauge = new LinearGauge({
    renderTo: 'coolent',
    units: "°C",
    title: "Coolent Temperature",
    minValue: 0,
    maxValue: 100,
    barBeginCircle: false,
    highlights: [
      { "from": 0, "to": 50, "color": "rgba(0,255,0,.75)" },
      { "from": 50, "to": 85, "color": "rgba(255,255,0,.75)" },
      { "from": 85, "to": 100, "color": "rgba(255,0,0,.75)" },
    ],
    colorTitle: "#000",
    colorUnits: "#000",
    colorNumbers: "#000",
    colorPlate: "#FFF",
    tickSide: "left",
    numberSide: "left",
    needleSide: "left",
    borders: true 
  });
}

function createPowerOutputGauge() {
  powerGauge = new RadialGauge({
    renderTo: 'power',

    units: "V",
    title: "Power Output",
    minValue: 0,
    maxValue: 100,
    barBeginCircle: false,
    highlights: [
      { "from": 0, "to": 50, "color": "rgba(0,255,0,.75)" },
      { "from": 50, "to": 85, "color": "rgba(255,255,0,.75)" },
      { "from": 85, "to": 100, "color": "rgba(255,0,0,.75)" },
    ],
    colorTitle: "#000",
    colorUnits: "#000",
    colorNumbers: "#000",
    borders: false
  });
}

function renderGauges(){
  coreGauge.draw();
  coolentGauge.draw();
  powerGauge.draw();
};

function randomUpdates() {
  coreGauge.update({value: getRandomInt(100)});
  coolentGauge.update({value: getRandomInt(100)});
  powerGauge.update({value: getRandomInt(100)});
  console.log("Update")
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}