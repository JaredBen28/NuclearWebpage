let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');

let newImage = new Image();
newImage.src = './pwr.jpeg'

newImage.onload = () => {
  ctx.drawImage(newImage, 0, 0, 250, 208);
}