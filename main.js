var clockInterval, chartInterval, simInterval;
var clockState = false;
var powerGauge;
var reactorDeltaTChart;
var H1TDeltaTChart;
var tempsChart;
var reactorPowerGauge;

const powerOutputMax = 60;
const powerOutputUpperLimit = 50;
const powerOutLowerLimit = 10;
const powerOutputMin = 0;

const reactorDeltaTMax = 1200;
const reactorDeltaTUpperLimit = 1190;
const reactorDeltaTLowerLimit = 210;
const reactorDeltaTMin = 200;

const H1TDeltaTMax = 1200;
const H1TDeltaTUpperLimit = 1190;
const H1TDeltaTLowerLimit = 210;
const H1TDeltaTMin = 200;

const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

var activeSim;
var lastTimestamp = 0;

// When on VM seach for 5000, change all ip to correct ip

// Website Init
$(function() {
  createReactorPowerOutputGauge();
  createPowerOutputGauge();

  createTempsChart();
  createReactorDeltaTChart();
  createH1TChart();

  storeActiveSim();
  
  updateAllFigures(reactorDeltaTChart, H1TDeltaTChart);
});


$(document).ready(function(){
  clockInterval = setInterval("updateAllFigures(reactorDeltaTChart, H1TDeltaTChart)", 1000);
  chartInterval = setInterval("updateCharts(reactorDeltaTChart, H1TDeltaTChart, tempsChart)", 2000);
  simInterval = setInterval("simulation()", 2000)
});

function simulation() {
  if (activeSim) {
    $('#activeSim').text('Simulation is Active');
    $('#activeSim').css('color', 'green');
    // $('#control').css('visibility', 'visible');
  } else {
    $('#activeSim').text('Simulation is Inactive');
    $('#activeSim').css('color', 'red');
    $('#reactorTemp').text('Current reactor temperature: NaN');
    $('#H1T').text('Current H1 temperature: NaN');
    // $('#control').css('visibility', 'hidden');
  }
  getControlValue()
}

// Reactor Power Output Gauge
function createReactorPowerOutputGauge() {
  reactorPowerGauge = new RadialGauge({
    renderTo: 'reactorPower',
    title: "Reactor Power Output",
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
  reactorPowerGauge.draw();
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
    url: "http://127.0.0.1:5000/control",
    dataType: "json",
    success: function(response){
      // console.log(response);
      $('#control').text('Steam Demand is ' + response)
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
      timestamp = response[0][30];
      console.log(timestamp);
    }
  });
}

function updateAllFigures(reactorTemperatureChart, H1TChart){
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:5000",
    dataType: "json",
    success: function(response){
      console.log(response)
      if (response.length == 0) {return}
      currentDateTime = getDateTime()
      timestamp =response[0][30]
      if (timestamp == lastTimestamp) {
        activeSim = false;
        powerGauge.update({value: 0});
        reactorPowerGauge.update({value: 0});
        reactorTemperatureChart.data.datasets[0].data
        [reactorTemperatureChart.data.datasets[0].data.length] 
          = {x: null, y: 0};

        H1TChart.data.datasets[0].data
        [H1TChart.data.datasets[0].data.length] 
          = {x: null, y: 0};

        tempsChart.data.datasets[0].data
        [tempsChart.data.datasets[0].data.length]
          = {x: null, y: 0};

        tempsChart.data.datasets[1].data
        [tempsChart.data.datasets[1].data.length]
          = {x: null, y: 0};

        tempsChart.data.datasets[2].data
        [tempsChart.data.datasets[2].data.length] 
          = {x: null, y: 0};

      } else {
        activeSim = true;
        // powerGauge.value = response[0][0];
        powerGauge.update({value: response[0][27]});
        reactorPowerGauge.update({value: response[0][0]})
        
        reactorTemperatureChart.data.datasets[0].data
        [reactorTemperatureChart.data.datasets[0].data.length] 
          = {x: currentDateTime, y: (parseFloat(response[0][9])+parseFloat(response[0][10]))/2};
        
        H1TChart.data.datasets[0].data
        [H1TChart.data.datasets[0].data.length] 
          = {x: currentDateTime, y: response[0][21]};
        
        $('#reactorTemp').text('Current reactor temperature: ' + (parseFloat(response[0][9])+parseFloat(response[0][10]))/2);
        $('#H1T').text('Current H1 temperature: ' + response[0][21]);

        tempsChart.data.datasets[0].data
        [tempsChart.data.datasets[0].data.length]
          = {x: currentDateTime, y: response[0][10]};

        tempsChart.data.datasets[1].data
        [tempsChart.data.datasets[1].data.length]
          = {x: currentDateTime, y: (parseFloat(response[0][9])+parseFloat(response[0][10]))/2};
        
          tempsChart.data.datasets[2].data
        [tempsChart.data.datasets[2].data.length]
          = {x: currentDateTime, y: response[0][9]};
      };
      lastTimestamp = timestamp;
    }
  });
}

function updateCharts(reactor, steam, temps) {
  reactor.update('none');
  steam.update('none');
  temps.update('none');
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
            text: "Temp",
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
        // subtitle: {
        //   display: true,
        //   text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        // }
      }
    },
    plugins: [horizontalArbitraryLine]
  };
  reactorDeltaTChart = new Chart(ctx, config);
}

function createH1TChart() {
  const ctx = document.getElementById("H1TChart");
  const horizontalArbitraryLine = {
    id: 'horizontalArbitraryLine',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: {top, right, bottom, left, width, height}, scales: {x, y} } = chart;
      ctx.save();

      ctx.strokeStyle = 'Red';
      const upperLimit = y.getPixelForValue(H1TDeltaTUpperLimit)
      const lowerLimit = y.getPixelForValue(H1TDeltaTLowerLimit)

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
            text: "Temp",
            display: true
          },
          min: H1TDeltaTMin,
          max: H1TDeltaTMax
        }
      },
      plugins: {
        title: {
          display: true,
          text: "H1 Temperature Over Time",
          padding: {
            top: 10,
            bottom: 10
          },
          font: {
            size: 18
          }
        },
        // subtitle: {
        //   display: true,
        //   text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        // }
      }
    },
    plugins: [horizontalArbitraryLine]
  };
  H1TDeltaTChart = new Chart(ctx, config);
}

function createTempsChart() {
  const ctx = document.getElementById("tempsChart");
  const horizontalArbitraryLine = {
    id: 'horizontalArbitraryLine',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: {top, right, bottom, left, width, height}, scales: {x, y} } = chart;
      ctx.save();

      ctx.strokeStyle = 'Red';
      const upperLimit = y.getPixelForValue(H1TDeltaTUpperLimit)
      const lowerLimit = y.getPixelForValue(H1TDeltaTLowerLimit)

      ctx.strokeRect(left, upperLimit, width, 0)
      ctx.strokeRect(left, lowerLimit, width, 0)

    }
  }

  const config = {
    type: 'line',
    data: {
      datasets: [{
        data: null,
        label: "hot temp",
        fill: false,
        borderColor: 'rgba(247,70,74,1)',
        backgroundColor: 'rgba(247,70,74,0.2)',
        segment: {
          borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)')
        }
      },
      {
        data: null,
        label: "avg temp",
        fill: false,
        borderColor: 'rgba(70,191,189,1)',
        backgroundColor: 'rgba(70,191,189,0.2)',
        segment: {
          borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)')
        }
      },
      {
        data: null,
        label: "cold temp",
        fill: false,
        borderColor: 'rgba(54,162,235,1)',
        backgroundColor: 'rgba(54,162,235,0.2)',
        segment: {
          borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)')
        }
      }
    ]
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
            text: "Temp",
            display: true
          },
          min: H1TDeltaTMin,
          max: H1TDeltaTMax
        }
      },
      plugins: {
        title: {
          display: true,
          text: "Temperature Over Time",
          padding: {
            top: 10,
            bottom: 10
          },
          font: {
            size: 18
          }
        },
        // subtitle: {
        //   display: true,
        //   text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        // }
      }
    },
    plugins: [horizontalArbitraryLine]
  };
  tempsChart = new Chart(ctx, config);
}