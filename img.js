var canvas, context;

$(function() {
  canvas = document.getElementById('viewport');
  context = canvas.getContext('2d');
});


$(document).ready(function(){
  
});

function drawPWR() {
  img = new Image();
  img.src = './pwr.jpeg'
  context.drawImage(img, 100, 100);
}