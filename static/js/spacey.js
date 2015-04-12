fabric.Object.prototype.originX = 'center';
fabric.Object.prototype.originY = 'center';

var earthDist = 120;
var earthYear = 1200;
var rotationScale = 40; // slow down the orbits

var bodies = [
  createPlanet('Sun', 0, 0),
  createPlanet('Mercury', earthDist * 0.45, earthYear * 0.24),
  createPlanet('Venus', earthDist * 0.7, earthYear * 0.6),
  createPlanet('Earth', earthDist * 0.95, earthYear),
  createPlanet('Mars', earthDist * 1.2, earthYear * 1.9),
  createPlanet('Jupiter', earthDist * 1.8, earthYear * 12, 0.66),
  createPlanet('Saturn', earthDist * 2.3, earthYear * 29.5, 0.66),
  createPlanet('Uranus', earthDist * 2.8, earthYear * 84, 0.4),
  createPlanet('Neptune', earthDist * 3.3, earthYear * 165, 0.4)
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

    // Create stars
    for (var i = 0; i < 50; i++) {
      var gray = Math.random() * 128 + 64;
      var star = new fabric.Circle({
        left: Math.random() * canvas.getWidth(),
        top: Math.random() * canvas.getHeight(),
        fill: 'rgba(255,255,255,'+Math.random()+')',
        radius: 1
      });
    canvas.add(star);
    }

    // Add in the bodies
    bodies.forEach(function(b) {
      createOrbit(b);
      createPlanetPNG(b);
    });

    canvas.renderAll();
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

function createPlanet(name, distance, year, scale) {
  return {
    name: name,
    distanceFromSun: distance,
    yearDuration: year,
    scale: scale || 1.0
  };
}

function createPlanetPNG(planetInfo) {
  fabric.Image.fromURL('static/img/'+planetInfo.name+'.png', function(oImg) {
    oImg.set('selectable', false);
    oImg.name = planetInfo.name;
    oImg.distanceFromSun = planetInfo.distanceFromSun;
    oImg.yearDuration = planetInfo.yearDuration;
    if (planetInfo.scale != 1.0) oImg.scale(planetInfo.scale);
    canvas.add(oImg);

    oImg.center();
    oImg.set('left', oImg.getLeft() - oImg.distanceFromSun);
    animatePlanet(oImg);
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
  var startAngle = fabric.util.getRandomInt(-180, 180);
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
