var powerGauge, coolentGauge, coreGauge;
var clockInterval;
var clockState = false;


$(function() {
  createGauges();
  renderGauges();
});

$('#clock').click(function(){
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

$('#testApi').click(function(){
  randomUpdates()
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
    minValue: -100,
    maxValue: 100,
    barBeginCircle: false,
    // highlights: [
    //   { "from": 0, "to": 50, "color": "rgba(0,255,0,.75)" },
    //   { "from": 50, "to": 85, "color": "rgba(255,255,0,.75)" },
    //   { "from": 85, "to": 100, "color": "rgba(255,0,0,.75)" },
    // ],
    colorTitle: "#000",
    colorUnits: "#000",
    colorNumbers: "#000",
    borders: true
  });
}

function createCoolentTempGauge() {
  coolentGauge = new LinearGauge({
    renderTo: 'coolent',
    units: "°C",
    title: "Coolent Temperature",
    height: 700,
    minValue: -10,
    maxValue: 10,
    barBeginCircle: false,
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
    height: 400,
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
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:5000/",
    dataType: "json",
    success: function(responce){
      console.log(responce);
      coreGauge.update({value: responce.coreTemp});
      coolentGauge.update({value: responce.coolentTemp});
      powerGauge.update({value: responce.power});
    }
  });
}

