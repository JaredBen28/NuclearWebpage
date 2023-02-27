var clockInterval, chartInterval;
var clockState = false;
var powerGauge;
var reactorDeltaTChart;
var steamDeltaTChart;

const powerOutputMax = 700;
const powerOutputUpperLimit = 600;
const powerOutLowerLimit = 25;
const powerOutputMin = 0;

const reactorDeltaTMax = 2000;
const reactorDeltaTUpperLimit = 1900;
const reactorDeltaTLowerLimit = 100;
const reactorDeltaTMin = 0;

const steamDeltaTMax = 2000;
const steamDeltaTUpperLimit = 1900;
const steamDeltaTLowerLimit = 100;
const steamDeltaTMin = 0;

// Website Init
$(function() {
  createPowerOutputGauge();
  createReactorDeltaTChart();
  createSteamDeltaTChart();
  createControlKnob()
});

$(document).ready(function(){
  clockInterval = setInterval("updateAllFigures(reactorDeltaTChart, steamDeltaTChart)", 1000);
  chartInterval = setInterval("updateCharts(reactorDeltaTChart, steamDeltaTChart)", 2000)
});

$('#update').click(function(){
  reactorDeltaTChart.update('none');
  steamDeltaTChart.update('none');
});

// Control Knob
function createControlKnob() {
  $("#dial").knob({
    'min': 0,
    'max': 100,
    'release' : function(v){updateControlValue(v)},
    'width':"150",
    'height':"150",
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

function updateControlValue(newControlValue) {
  $.ajax({
    type: "POST",
    url: "http://127.0.0.1:5000",
    contentType: "application/json; charset=utf-8",
    dataType: 'json',
    data: JSON.stringify({control: newControlValue}),
    success: function(response){
      console.log(response);
    }
  });
}

//Charts
function getDateTime() {
  return "2000-01-01T"+String(new Date()).split(" ")[4]
}

function updateAllFigures(reactorTemperatureChart, steamTemperatureChart){
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:5000",
    dataType: "json",
    success: function(response){
      console.log(response)
      if (response.length == 0) {return}
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
        },
        subtitle: {
          display: true,
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
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
        },
        subtitle: {
          display: true,
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        }
      }
    },
    plugins: [horizontalArbitraryLine]
  };
  steamDeltaTChart = new Chart(ctx, config);
}