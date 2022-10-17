$(function(){
  var colWidth = $(".col-lg-3").width();
  $(".reactor-temp").tempGauge({
    showLabel: true, 
    showScale: true,
    maxTemp: 100,
    minTemp: 0,
    width: colWidth,
    currentTemp: 80,
    labelSize: 12
  });
  
  $(".coolent-temp").tempGauge({
    showLabel: true, 
    showScale: true,
    maxTemp: 100,
    minTemp: 0,
    width: colWidth,
    currentTemp: 0,
    labelSize: 12
  });

  $(".power-out").gauge(10000, {
    unit: "Volts",
    min: 0,
    max: 100000,
    color: "red"
  });
});