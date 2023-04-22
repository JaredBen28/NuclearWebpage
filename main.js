var clockInterval, chartInterval, simInterval, powerGauge, reactorDeltaTChart, HotLegTDeltaTChart, tempsChart, reactorPowerGauge, activeSim;
var lastTimestamp = 0;
var dialHeight = window.innerHeight / 3;
var clockState = false;
// Variables for graph ranges and limit lines
const powerOutputMax = 68;
const powerOutputUpperLimit = 61;
const powerOutLowerLimit = 0;
const powerOutputMin = 0;

const reactorDeltaTMax = 1200;
const reactorDeltaTUpperLimit = 1190;
const reactorDeltaTLowerLimit = 210;
const reactorDeltaTMin = 200;

const HotLegTDeltaTMax = 1200;
const HotLegTDeltaTUpperLimit = 1190;
const HotLegTDeltaTLowerLimit = 210;
const HotLegTDeltaTMin = 200;

const AllTempMax = 650;
const AllTempMin = 200;

const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

// Change to api ip addr
const ip = "http://127.0.0.1:5000/"



// Website Init
$(function() {
  //create graphs
  createReactorPowerOutputGauge();
  createPowerOutputGauge();

  createTempsChart();
  createReactorDeltaTChart();
  createHotLegTChart();

  // precheck for sim
  storeActiveSim();
  
  //update to initialize
  updateAllFigures(reactorDeltaTChart, HotLegTDeltaTChart, tempsChart);
});

// clocks for updating the display
$(document).ready(function(){
  clockInterval = setInterval("updateAllFigures(reactorDeltaTChart, HotLegTDeltaTChart)", 1000);
  chartInterval = setInterval("updateCharts(reactorDeltaTChart, HotLegTDeltaTChart, tempsChart)", 2000);
  simInterval = setInterval("simulation()", 2000)
});

// checks for simulation 
function simulation() {
  if (activeSim) {
    $('#activeSim').text('Simulation is Active');
    $('#activeSim').css('color', 'green');
    // $('#control').css('visibility', 'visible');
  } else {
    $('#activeSim').text('Simulation is Inactive');
    $('#activeSim').css('color', 'red');
    $('#reactorTemp').text('Current reactor temperature: NaN');
    $('#HotLegT').text('Current Hot Leg temperature: NaN');
    // $('#control').css('visibility', 'hidden');
  }
  getControlValue()
}

// Reactor Power Output Gauge
function createReactorPowerOutputGauge() {
  reactorPowerGauge = new RadialGauge({
    renderTo: 'reactorPower',
    title: "Thermal Power Output",
    height: dialHeight,
    minValue: powerOutputMin,
    maxValue: powerOutputMax,
    units: "MWTH",
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
    title: "Turbine Power Output",
    height: dialHeight ,
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

// get the steam demand value
function getControlValue() {
  $.ajax({
    type: "GET",
    url: ip + "control",
    dataType: "json",
    success: function(response){
      // console.log(response);
      $('#control').text('Steam Demand is ' + response)
    }
  });
}

function getDateTime() {
  return "2000-01-01T"+String(new Date()).split(" ")[4]
}

// stores the simulation state for the first time
function storeActiveSim(){
  $.ajax({
    type: "GET",
    url: ip,
    dataType: "json",
    success: function(response){
      timestamp = response[0][31];
      console.log(timestamp);
    }
  });
}


function updateAllFigures(reactorTemperatureChart, HotLegTChart){
  $.ajax({
    type: "GET",
    url: ip,
    dataType: "json",
    success: function(response){
      console.log(response)
      if (response.length == 0) {return}
      currentDateTime = getDateTime()
      timestamp = response[0][31]
      if (timestamp == lastTimestamp) {
        activeSim = false;
        powerGauge.update({value: 0});
        reactorPowerGauge.update({value: 0});
        reactorTemperatureChart.data.datasets[0].data
        [reactorTemperatureChart.data.datasets[0].data.length] 
          = {x: null, y: 0};

        HotLegTChart.data.datasets[0].data
        [HotLegTChart.data.datasets[0].data.length] 
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
        powerGauge.update({value: 61 * response[0][27] / 100});
        reactorPowerGauge.update({value: response[0][30] * 0.0010550559})
        
        reactorTemperatureChart.data.datasets[0].data
        [reactorTemperatureChart.data.datasets[0].data.length] 
          = {x: currentDateTime, y: (parseFloat(response[0][9])+ parseFloat(response[0][10]))/2};
        
        HotLegTChart.data.datasets[0].data
        [HotLegTChart.data.datasets[0].data.length] 
          = {x: currentDateTime, y: response[0][10]};
        
        $('#reactorTemp').text('Current reactor temperature: ' + Math.round((parseFloat(response[0][9]) + parseFloat(response[0][10]))/2 * 1000) / 1000);
        $('#HotLegT').text('Current HotLeg temperature: ' + Math.round(response[0][10] * 1000) / 1000);

        tempsChart.data.datasets[0].data
        [tempsChart.data.datasets[0].data.length]
          = {x: currentDateTime, y: response[0][10]};

        tempsChart.data.datasets[1].data
        [tempsChart.data.datasets[1].data.length]
          = {x: currentDateTime, y: (parseFloat(response[0][9]) + parseFloat(response[0][10]))/2};
        
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

function createHotLegTChart() {
  const ctx = document.getElementById("HotLegTChart");
  const horizontalArbitraryLine = {
    id: 'horizontalArbitraryLine',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: {top, right, bottom, left, width, height}, scales: {x, y} } = chart;
      ctx.save();

      ctx.strokeStyle = 'Red';
      const upperLimit = y.getPixelForValue(HotLegTDeltaTUpperLimit)
      const lowerLimit = y.getPixelForValue(HotLegTDeltaTLowerLimit)

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
          min: HotLegTDeltaTMin,
          max: HotLegTDeltaTMax
        }
      },
      plugins: {
        title: {
          display: true,
          text: "HotLeg Temperature Over Time",
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
  HotLegTDeltaTChart = new Chart(ctx, config);
}

function createTempsChart() {
  const ctx = document.getElementById("tempsChart");

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
          min: AllTempMin,
          max: AllTempMax
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
  };
  tempsChart = new Chart(ctx, config);
}