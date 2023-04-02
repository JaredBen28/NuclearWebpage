var clockInterval, chartInterval, simInterval;
var clockState = false;
var powerGauge;
var reactorDeltaTChart;
var steamDeltaTChart;
var power2Gauge;

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

const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

var activeSim;
var lastTimestamp = 0;

// Website Init
$(function() {
  createPowerOutputGauge();
  createReactorDeltaTChart();
  createSteamDeltaTChart();
  createPower2Gauge();
  storeActiveSim();
  updateAllFigures(reactorDeltaTChart, steamDeltaTChart);
});


$(document).ready(function(){
  clockInterval = setInterval("updateAllFigures(reactorDeltaTChart, steamDeltaTChart)", 1000);
  chartInterval = setInterval("updateCharts(reactorDeltaTChart, steamDeltaTChart)", 2000);
  simInterval = setInterval("simulation()", 2000)
});

function simulation() {
  if (activeSim) {
    $('#activeSim').text('Simulation is Active');
    $('#activeSim').css('color', 'green');
    // $('#powerControlPercent').css('visibility', 'visible');
  } else {
    $('#activeSim').text('Simulation is Inactive');
    $('#activeSim').css('color', 'red');
    // $('#powerControlPercent').css('visibility', 'hidden');
  }
  getControlValue()
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

function getControlValue() {
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:5000/powerControl",
    dataType: "json",
    success: function(response){
      // console.log(response);
      $('#powerControlPercent').text('Power Control Value is at: ' + response + '%')
    }
  });
}

//Charts
function getDateTime() {
  return "2000-01-01T"+String(new Date()).split(" ")[4]
}

function storeActiveSim(){
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:5000",
    dataType: "json",
    success: function(response){
      timestamp = response[0][28];
      console.log(timestamp);
    }
  });
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
      timestamp = response[0][28];
      if (timestamp == lastTimestamp) {
        activeSim = false;
        powerGauge.update({value: 0});
        reactorTemperatureChart.data.datasets[0].data[reactorTemperatureChart.data.datasets[0].data.length] 
          = {x: null, y: response[0][8]};
        steamTemperatureChart.data.datasets[0].data[steamTemperatureChart.data.datasets[0].data.length] 
          = {x: null, y: response[0][21]};
      } else {
        activeSim = true;
        // powerGauge.value = response[0][0];
        powerGauge.update({value: response[0][0]});
        reactorTemperatureChart.data.datasets[0].data[reactorTemperatureChart.data.datasets[0].data.length] 
          = {x: currentDateTime, y: response[0][8]};
        steamTemperatureChart.data.datasets[0].data[steamTemperatureChart.data.datasets[0].data.length] 
          = {x: currentDateTime, y: response[0][21]};
      };
      lastTimestamp = timestamp;
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
        fill: false,
        segment: {
          borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)')
        },
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
        fill: false,
        segment: {
          borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)')
        }
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



function createPower2Gauge() {
  const ctx = document.getElementById("power2");
  console.log(ctx)
  const gaugeNeedle = {
    id: 'gaugeNeedle',
    afterDatasetDraw(chart, args, options) {
      const {ctx, config, data, chartArea: {top, bottom, left, right, width, height}} = chart; 
      ctx.save();
      const needleValue = data.datasets[0].needleValue;
      const dataTotal = data.datasets[0].data.reduce((a,b) => a + b, 0);
      const angle = Math.PI * (1 / dataTotal * needleValue * Math.PI);

      const cx = width / 2;
      const cy = chart._metasets[0].data[0].y;

      // needle
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(height - (ctx.canvas.offsetTop+ 5), 0);
      ctx.lineTo(0, 2);
      ctx.fillStyle = options.needleColor;
      ctx.fill();
      ctx.restore();

      // dot 
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 10);
      ctx.fill();
      ctx.restore();

      ctx.font = '2em Arial';
      ctx.fillStyle = options.needleColor;
      ctx.fillText('Power Output: ' + needleValue + 'W', cx, cy + 50);
      ctx.textAlign = 'center';
      ctx.restore();
    }
  }
  const config = {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [0, 10, 90, 100],
        label: "Temperature",
        backgroundColor: [
          'green',
          'red',
          'green'
        ],
        needleValue: 60,
        borderColor: 'white',
        borderWidth: 2,
        cutout: '95%',
        circumference: 180,
        rotation: 270,
        borderRadius: 5,
      }]
    },
    options: {
      plugins: {
        legend: {display: false},
        gaugeNeedle: {
          needleColor: '#444'
        }
      }
    },
    plugins: [gaugeNeedle]
  };
  power2Gauge = new Chart(ctx, config);
}