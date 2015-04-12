fabric.Object.prototype.originX = 'center';
fabric.Object.prototype.originY = 'center';

var bodies = [
  createPlanet('Sun', 40, 'yellow', 0),
  createPlanet('Mercury', 5, 'red', 75),
  createPlanet('Venus', 5, 'purple', 90),
  createPlanet('Earth', 10, 'blue', 120),
  createPlanet('Mars', 8, 'red', 150)
];

var savedAngles = new Array();

var canvas;
var tick = 0;
var rotationScale = 100;

function init() {
  canvas = new fabric.Canvas('c', {backgroundColor: 'rgb(0,0,0)'});
  canvas.selection = false;

  canvas.on('mouse:down', function(options) {
    if (options.target) {
      console.log('Clicked on ' + options.target.name);
    } else {
      console.log('Clicked nothing');
    }
  });

  setInterval(function () {tick = (tick+1)%360;}, 200);

  resizeCanvas();
}

function resizeCanvas() {
  var container = document.getElementById('canvasContainer');
  //canvas.setWidth(document.documentElement.clientWidth);
  //canvas.setHeight(document.documentElement.clientHeight);
  canvas.setWidth(container.clientWidth);
  canvas.setHeight(container.clientHeight);
  canvas.calcOffset();

  canvas.clear();
  drawSolarSystem();
}

function drawSolarSystem() {
    var centerX = canvas.getWidth()/2;
    var centerY = canvas.getHeight()/2;

    // Add in the bodies
    bodies.forEach(function(b) {
      canvas.add(b);
      b.center();
      b.set('left', b.getLeft() - b.distanceFromSun);
      animatePlanet(b);
      canvas.renderAll();
    });
}

function createPlanet(name, size, color, distance) {
  return new fabric.Circle({
    radius: size,
    fill: color,
    selectable: false,
    name: name,
    distanceFromSun: distance
  });
}

// Based on Fabric.js solar system demo
function animatePlanet(planet) {
  if (planet.name == 'Sun') return;

  var cx = canvas.getWidth() / 2;
  var cy = canvas.getHeight() / 2;

  var radius = planet.distanceFromSun;

  // speed of rotation slows down for further planets
  var duration = planet.distanceFromSun * rotationScale;

  // randomize starting angle to avoid planets starting on one line
  var startAngle = savedAngles[planet.name] || fabric.util.getRandomInt(-180, 0);
  var endAngle = startAngle + 359;

  (function animate() {

    fabric.util.animate({
      startValue: startAngle,
      endValue: endAngle,
      duration: duration,

      // linear movement
      easing: function(t, b, c, d) { return c*t/d + b; },

      onChange: function(angle) {
        angle = fabric.util.degreesToRadians(angle);
        savedAngles[planet.name] = angle;

        var x = cx + radius * Math.cos(angle);
        var y = cy + radius * Math.sin(angle);

        planet.set({ left: x, top: y }).setCoords();

        // TODO render once per cycle
        canvas.renderAll();

        console.log("Animated " + planet.name);
      },
      onComplete: animate
    });
  })();
}
