var powerGauge, coolantGauge, coreGauge;
var placeholder1, placeholder2, placeholder3, placeholder4
var clockInterval;
var clockState = false;


$(function() {
  createGauges();
  renderGauges();
  
  $("#dial").knob({
    'min':0,
    'max':100,
    'release' : function(v){ 
      console.log(v)
      mfr(v)
    },
    width:"150",
    // fgColor:"#C0ffff",
    // skin:"tron",
    thickness:".2",
    angleOffset:"180",
  });
});

$('#clock').click(function(){
  if (!clockState) {
    console.log("Clock Start");
    clockInterval = setInterval("updateGraphs()", 200);
    clockState = true;
  } else {
    console.log("Clock Stop")
    clearInterval(clockInterval);
    clockState = false;
  }
});

$('#testApi').click(function(){
  updateGraphs()
});

function createGauges() {
  createCoreTempGauge();
  createCoolantTempGauge();
  createPowerOutputGauge();
  placeholder1 = createPlaceHolder(place1)
  placeholder2 = createPlaceHolder(place2)
  placeholder3 = createPlaceHolder(place3)
  placeholder4 = createPlaceHolder(place4)
};

function createCoreTempGauge() {
  coreGauge = new LinearGauge({
    renderTo: 'core',
    units: "°C",
    title: "Core Temperature",
    height: 700,
    minValue: -1,
    maxValue: 5,
    barBeginCircle: false,
    majorTicks: [-1, 0, 1, 2, 3, 4, 5],
    colorTitle: "#000",
    colorUnits: "#000",
    colorNumbers: "#000",
    borders: true
  });
}

function createCoolantTempGauge() {
  coolantGauge = new LinearGauge({
    renderTo: "coolant",
    units: "°C",
    title: "Coolant Temperature",
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
    title: "Power Output",
    height: 400,
    minValue: 0,
    maxValue: 120,
    units: "%",
    barBeginCircle: false,
    majorTicks: [0,10,20,30,40,50,60,70,80,90,100,110,120],
    //change tick marks
    highlights: [
      { "from": 0, "to": 100, "color": "rgba(0,255,0,.75)" },
      { "from": 100, "to": 120, "color": "rgba(255,0,0,.75)" },
    ],
    colorTitle: "#000",
    colorUnits: "#000",
    colorNumbers: "#000",
    borders: false
  });
}

function createPlaceHolder(placeHolderName) {
  return new RadialGauge({
    renderTo: placeHolderName,
    title: "PlaceHolder",
    height: 400,
    minValue: 0,
    maxValue: 120,
    units: "%",
    barBeginCircle: false,
    majorTicks: [0,10,20,30,40,50,60,70,80,90,100,110,120],
    //change tick marks
    highlights: [
      { "from": 0, "to": 100, "color": "rgba(0,255,0,.75)" },
      { "from": 100, "to": 120, "color": "rgba(255,0,0,.75)" },
    ],
    colorTitle: "#000",
    colorUnits: "#000",
    colorNumbers: "#000",
    borders: false
  });
}


function renderGauges(){
  coreGauge.draw();
  coolantGauge.draw();
  powerGauge.draw();
  placeholder1.draw();
  placeholder2.draw();
  placeholder3.draw();
  placeholder4.draw();
};

function updateGraphs() {
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:5000",
    dataType: "json",
    success: function(response){
      console.log(response);
      coreGauge.update({value: response.coreTemp});
      coolantGauge.update({value: response.coolantTemp});
      powerGauge.update({value: response.power});
    }
  });
}

function mfr(v) {
  $.ajax({
    type: "POST",
    url: "http://127.0.0.1:5000",
    contentType: "application/json; charset=utf-8",
    dataType: 'json',
    data: JSON.stringify({control: v}),
    success: function(response){
      console.log(response);
    }
  });
}

// Delta T graph
// Change dial to steam 