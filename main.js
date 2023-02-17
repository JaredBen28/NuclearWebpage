var clockInterval, chartInterval;
var clockState = false;
var powerGauge;
var reactorDeltaTChart;
var steamDeltaTChart;

const powerOutputMax = 65;
const powerOutputUpperLimit = 50;
const powerOutLowerLimit = 25;
const powerOutputMin = 15;

const reactorDeltaTMax = 1000;
const reactorDeltaTUpperLimit = 900;
const reactorDeltaTLowerLimit = 100;
const reactorDeltaTMin = -1000;

const steamDeltaTMax = 1000;
const steamDeltaTUpperLimit = 900;
const steamDeltaTLowerLimit = 100;
const steamDeltaTMin = -1000;

// Website Init
$(function() {
  createPowerOutputGauge();
  createReactorDeltaTChart();
  createSteamDeltaTChart();
  createSteamKnob()
});

// Buttons on Website
$('#clock').click(function(){
  if (!clockState) {
    console.log("Clock Start");
    clockInterval = setInterval("updateAllFigures(reactorDeltaTChart, steamDeltaTChart)", 1000);
    chartInterval = setInterval("updateCharts(reactorDeltaTChart, steamDeltaTChart)", 2000)
    clockState = true;
  } else {
    console.log("Clock Stop")
    clearInterval(clockInterval);
    clearInterval(chartInterval)
    clockState = false;
  }
});

$('#testApi').click(function(){
  reactorDeltaTChart.update();
  steamDeltaTChart.update();
});

// Steam Knob
function createSteamKnob() {
  $("#dial").knob({
    'min': 0,
    'max': 100,
    'release' : function(v){ 
      console.log(v)
      updateSteamValue(v)
    },
    'width':"150",
    'fgColor': "#222222",
    'bgColor': "#FFFFFF",
    'thickness':".2",
    'angleOffset':"180",
    'displayPrevious': true,
  });
}

// Power Output Gauge
function createPowerOutputGauge() {
  powerGauge = new RadialGauge({
    renderTo: 'power',
    title: "Power Output",
    height: 400,
    minValue: powerOutputMin,
    maxValue: powerOutputMax,
    units: "MW",
    barBeginCircle: false,
    majorTicks: [powerOutputMin, powerOutLowerLimit, powerOutputUpperLimit, powerOutputMax],
    //change tick marks
    highlights: [
      {"from": powerOutputMin, "to": powerOutLowerLimit, "color": "rgba(255,0,0,.75)"},
      {"from": powerOutLowerLimit, "to": powerOutputUpperLimit, "color": "rgba(0,255,0,.75)"},
      {"from": powerOutputUpperLimit, "to": powerOutputMax, "color": "rgba(255,0,0,.75)"}
    ],
    colorTitle: "#000",
    colorUnits: "#000",
    colorNumbers: "#000",
    borders: false
  });
  powerGauge.draw();
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

//Charts
function getDateTime() {
  var currentdate = new Date(); 
  console.log(currentdate)
  datetime = "200-01-01T" + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
  return datetime
}

function updateAllFigures(reactorTemperatureChart, steamTemperatureChart){
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:5000",
    dataType: "json",
    success: function(response){
      currentDateTime = getDateTime()
      reactorTemperatureChart.data.datasets[0].data[
        reactorTemperatureChart.data.datasets[0].data.length] 
        = {x: currentDateTime, y: response[0][8]};
      steamTemperatureChart.data.datasets[0].data[
        steamTemperatureChart.data.datasets[0].data.length] 
        = {x: currentDateTime, y: response[0][21]};
      powerGauge.value = response[0][0]
    }
  });
}

function updateCharts(reactor, steam) {
  reactor.update('none');
  steam.update('none');
}

function createReactorDeltaTChart() {
  const ctx = document.getElementById("reactorTemperatureChart");
  const horizontalArbitraryLine = {
    id: 'horizontalArbitraryLine',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: {top, right, bottom, left, width, height}, scales: {x, y} } = chart;
      ctx.save();

      ctx.strokeStyle = 'Red';
      const upperLimit = y.getPixelForValue(reactorDeltaTUpperLimit)
      const lowerLimit = y.getPixelForValue(reactorDeltaTLowerLimit)

      ctx.strokeRect(left, upperLimit, width, 0)
      ctx.strokeRect(left, lowerLimit, width, 0)

    }
  }

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
      maintainAspectRatio: false,
      elements: {
        point: {
          radius: .1,
        }
      },
      scales: {
        x: {
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
          ticks: {
            maxTicksLimit: 20
          }
        },
        y: {
          title: {
            text: "",
            display: true
          },
          min: reactorDeltaTMin,
          max: reactorDeltaTMax
        }
      },
      plugins: {
        title: {
          display: true,
          text: "Reactor Temperature Over Time",
          padding: {
            top: 10,
            bottom: 10
          },
          font: {
            size: 18
          }
        }
      }
    },
    plugins: [horizontalArbitraryLine]
  };
  reactorDeltaTChart = new Chart(ctx, config);
}

function createSteamDeltaTChart() {
  const ctx = document.getElementById("steamTemperatureChart");
  const horizontalArbitraryLine = {
    id: 'horizontalArbitraryLine',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: {top, right, bottom, left, width, height}, scales: {x, y} } = chart;
      ctx.save();

      ctx.strokeStyle = 'Red';
      const upperLimit = y.getPixelForValue(steamDeltaTUpperLimit)
      const lowerLimit = y.getPixelForValue(steamDeltaTLowerLimit)

      ctx.strokeRect(left, upperLimit, width, 0)
      ctx.strokeRect(left, lowerLimit, width, 0)

    }
  }

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
      maintainAspectRatio: false,
      elements: {
        point: {
          radius: .1,
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            displayFormats: {
              millisecond: 'mm:ss'
            }
          },
          distribution: 'linear',
          title: {
            text: "Time in min:sec",
            display: true
          },
          ticks: {
            maxTicksLimit: 20
          }
        },
        y: {
          title: {
            text: "",
            display: true
          },
          min: steamDeltaTMin,
          max: steamDeltaTMax
        }
      },
      plugins: {
        title: {
          display: true,
          text: "Super Heated Steam Temperature Over Time",
          padding: {
            top: 10,
            bottom: 10
          },
          font: {
            size: 18
          }
        }
      }
    },
    plugins: [horizontalArbitraryLine]
  };
  steamDeltaTChart = new Chart(ctx, config);
}