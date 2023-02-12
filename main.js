var powerGauge, coolantGauge, coreGauge;
var clockInterval, chartInterval;
var clockState = false;
var deltaTChart;

// Website Init
$(function() {
  createGauges();
  renderGauges();
  createDeltaTChart();
  createSteamKnob()
});

// Buttons on Website
$('#clock').click(function(){
  if (!clockState) {
    console.log("Clock Start");
    clockInterval = setInterval("updateDeltaTChart(deltaTChart)", 200);
    chartInterval = setInterval("updateChart(deltaTChart)", 1000)
    clockState = true;
  } else {
    console.log("Clock Stop")
    clearInterval(clockInterval);
    clearInterval(chartInterval)
    clockState = false;
  }
});

$('#testApi').click(function(){
  updateDeltaTChart(deltaTChart);
  updateChart(deltaTChart)
});

// Steam Knob
function createSteamKnob() {
  $("#dial").knob({
    'min':0,
    'max':100,
    'release' : function(v){ 
      console.log(v)
      updateSteamValue(v)
    },
    width:"150",
    // fgColor:"#C0ffff",
    // skin:"tron",
    thickness:".2",
    angleOffset:"180",
  });
}

// Gauges on Screen 
function renderGauges(){
  coreGauge.draw();
  coolantGauge.draw();
  powerGauge.draw();
};

function createGauges() {
  createCoreTempGauge();
  createCoolantTempGauge();
  createPowerOutputGauge();
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

function updateSteamValue(newSteamValue) {
  $.ajax({
    type: "POST",
    url: "http://127.0.0.1:5000",
    contentType: "application/json; charset=utf-8",
    dataType: 'json',
    data: JSON.stringify({control: newSteamValue}),
    success: function(response){
      console.log(response);
    }
  });
}

function getDateTime() {
  var currentdate = new Date(); 
  return datetime = currentdate.getDate() + "-"
    + (currentdate.getMonth()+1)  + "-" 
    + currentdate.getFullYear() + " "  
    + currentdate.getHours() + ":"  
    + currentdate.getMinutes() + ":" 
    + currentdate.getSeconds() + "."
    + currentdate.getMilliseconds();
}

//Charts
function updateDeltaTChart(chartName){
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:5000",
    dataType: "json",
    success: function(response){
      chartName.data.datasets[0].data[
        chartName.data.datasets[0].data.length] 
        = {x: String(getDateTime()), y: response[0][7]}
      console.log(chartName.data.datasets[0].data)
    }
  });
}

function updateChart(chartName) {
  chartName.update('none')
}

function createDeltaTChart() {
  const ctx = document.getElementById("chart");
  const config = {
    type: 'line',
    data: {
      datasets: [{
        data: null,
        label: "Temperature",
        fill: false
      }]
    },
    options: {
      elements: {
        point: {
          radius: .1,
        }
      },
      scales: {
        xAxis: {
          type: 'time',
          time: {
            unit: 'millisecond',
            displayFormats: {
              millisecond: 'mm:ss'
            }
          },
          distribution: 'linear',
          title: {
            text: "Time in min:sec",
            display: true
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Temp over Time",
          padding: {
            top: 10,
            bottom: 10
          },
          font: {
            size: 18
          }
        }
      }
    }
  };
  deltaTChart = new Chart(ctx, config);
}