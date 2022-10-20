var powerGauge;
var coolentGauge;
var coreGauge;
var transitions = false;
var timeout, clicker = $('#clicker');


$(function() {
  createGauges();
  renderGauges();
});

function createGauges() {
  var containerWidth = document.getElementsByClassName("col-lg-10").clientWidth;
  var containerHeight = 200;

  coreGauge = new LinearGauge({
    renderTo: 'core',
    width: containerWidth,
    height: containerHeight,
    units: "°C",
    title: "Core Temperature",
    minValue: 0,
    maxValue: 100,
    barBeginCircle: false,
    highlights: [
      { "from": 0, "to": 50, "color": "rgba(0,255,0,.75)" },
      { "from": 50, "to": 85, "color": "rgba(255,255,0,.75)" },
      { "from": 85, "to": 100, "color": "rgba(255,0,0,.75)" },
    ]
  });

  coolentGauge = new LinearGauge({
    renderTo: 'coolent',
    width: containerWidth,
    height: containerHeight,
    units: "°C",
    title: "Coolent Temperature",
    minValue: 0,
    maxValue: 100,
    barBeginCircle: false,
    highlights: [
      { "from": 0, "to": 50, "color": "rgba(0,255,0,.75)" },
      { "from": 50, "to": 85, "color": "rgba(255,255,0,.75)" },
      { "from": 85, "to": 100, "color": "rgba(255,0,0,.75)" },
    ]    
  });

  powerGauge = new LinearGauge({
    renderTo: 'power',
    width: containerWidth,
    height: containerHeight,
    units: "V",
    title: "Power Output",
    minValue: 0,
    maxValue: 100,
    barBeginCircle: false,
    highlights: [
      { "from": 0, "to": 50, "color": "rgba(0,255,0,.75)" },
      { "from": 50, "to": 85, "color": "rgba(255,255,0,.75)" },
      { "from": 85, "to": 100, "color": "rgba(255,0,0,.75)" },
    ]   
  });
};

function renderGauges(){
  coreGauge.draw();
  coolentGauge.draw();
  powerGauge.draw();
};

clicker.mousedown(function(){
  coreGauge.update({value: getRandomInt(100)})
  coolentGauge.update({value: getRandomInt(100)})
  powerGauge.update({value: getRandomInt(100)}) 
  return false;
});

$(document).mouseup(function(){
  clearInterval(timeout);
  return false;
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}