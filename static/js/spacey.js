fabric.Object.prototype.originX = 'center';
fabric.Object.prototype.originY = 'center';

var earthDist = 120;
var earthYear = 1200;
var rotationScale = 40; // slow down the orbits

var bodies = [
  createPlanet('Sun', 25, 'yellow', 0),
  createPlanet('Mercury', 5, 'red', earthDist * 0.45, earthYear * 0.24),
  createPlanet('Venus', 5, 'purple', earthDist * 0.7, earthYear * 0.6),
  createPlanet('Earth', 10, 'blue', earthDist * 0.95, earthYear),
  createPlanet('Mars', 8, 'red', earthDist * 1.2, earthYear * 1.9),
  createPlanet('Jupiter', 15, 'pink', earthDist * 1.8, earthYear * 12),
  createPlanet('Saturn', 10, 'orange', earthDist * 2.3, earthYear * 29.5),
  createPlanet('Uranus', 7, 'blue', earthDist * 2.8, earthYear * 84),
  createPlanet('Neptune', 6, 'blue', earthDist * 3.3, earthYear * 165)
];

var savedAngles = new Array();

var canvas;
var animCount = 0;

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

  resizeCanvas();
}

function resizeCanvas() {
  var container = document.getElementById('canvasContainer');
  //canvas.setWidth(document.documentElement.clientWidth);
  //canvas.setHeight(document.documentElement.clientHeight);
  canvas.setWidth(container.clientWidth);
  canvas.setHeight(container.clientHeight);
  canvas.calcOffset();

  canvas.clear().renderAll();

  drawSolarSystem();
}

function drawSolarSystem() {
    var centerX = canvas.getWidth()/2;
    var centerY = canvas.getHeight()/2;

    animCount += 1;

    // Add in the bodies
    bodies.forEach(function(b) {
      createOrbit(b);
      canvas.add(b);
      b.center();
      b.set('left', b.getLeft() - b.distanceFromSun);
      animatePlanet(b);
      canvas.renderAll();
    });
}

function createOrbit(planet) {
  var orbit = new fabric.Circle({
    radius: planet.distanceFromSun,
    stroke: 'rgba(128,128,128, 0.5)',
    fill: '',
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,
    selectable: false
  });
  canvas.add(orbit);
}

function createPlanet(name, size, color, distance, year) {
  return new fabric.Circle({
    radius: size,
    fill: color,
    selectable: false,
    name: name,
    distanceFromSun: distance,
    yearDuration: year
  });
}

// Based on Fabric.js solar system demo
function animatePlanet(planet) {
  if (planet.name == 'Sun') return;

  var cx = canvas.getWidth() / 2;
  var cy = canvas.getHeight() / 2;

  var radius = planet.distanceFromSun;

  // speed of rotation slows down for further planets
  var duration = planet.yearDuration * rotationScale;

  // randomize starting angle to avoid planets starting on one line
  // TODO save previous angles
  //var startAngle = savedAngles[planet.name] || fabric.util.getRandomInt(-180, 0);
  var startAngle = fabric.util.getRandomInt(-180, 0);
  var endAngle = startAngle + 359;

  // hack to kill the infinite animation loops. when the
  // canvas is resized the count changes and then this animation
  // function should stop looping
  var animGroup = animCount;

  (function animate() {

    fabric.util.animate({
      startValue: startAngle,
      endValue: endAngle,
      duration: duration,

      // linear movement
      easing: function(t, b, c, d) { return c*t/d + b; },

      onChange: function(angle) {
        if (animGroup != animCount) return;

        angle = fabric.util.degreesToRadians(angle);
        savedAngles[planet.name] = angle;

        var x = cx + radius * Math.cos(angle);
        var y = cy + radius * Math.sin(angle);

        planet.set({ left: x, top: y }).setCoords();

        canvas.renderAll();
      },
      onComplete: function() {
        if (animGroup == animCount) animate();
      }
    });
  })();
}
