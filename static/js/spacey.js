fabric.Object.prototype.originX = 'center';
fabric.Object.prototype.originY = 'center';

var earthDist = 120;
var earthYear = 1200;
var rotationScale = 40; // slow down the orbits

var bodies = new Array();
var savedAngles = new Object();

var canvas;
var animCount = 0;
var totalAssets = 0;
var loadedAssets = 0;

function init() {
  canvas = new fabric.Canvas('c', {backgroundColor: 'rgb(0,0,0)'});
  canvas.selection = false;

  canvas.on('mouse:down', function(options) {
    if (options.target) {
      console.log('Clicked on ' + options.target.name);
      if (options.target.soundId != undefined) {
        var body = options.target;
        if (body.soundPlaying) {
          soundManager.stop(body.soundId);
          body.soundPlaying = false;
        } else {
          body.soundPlaying = true;
          soundManager.play(body.soundId);
        }
      }
    } else {
      console.log('Clicked nothing');
    }
  });

  createPlanet('Sun', 0, 0);
  createPlanet('Mercury', earthDist * 0.45, earthYear * 0.24);
  createPlanet('Venus', earthDist * 0.7, earthYear * 0.6);
  createPlanet('Earth', earthDist * 0.95, earthYear, 1, 'earth_whistle.mp3');
  createPlanet('Mars', earthDist * 1.2, earthYear * 1.9);
  createPlanet('Jupiter', earthDist * 1.8, earthYear * 12, 0.66, 'jupiter.mp3');
  createPlanet('Saturn', earthDist * 2.3, earthYear * 29.5, 0.66, 'saturn_radio1.mp3');
  createPlanet('Uranus', earthDist * 2.8, earthYear * 84, 0.4, 'uranus_rings.mp3');
  createPlanet('Neptune', earthDist * 3.3, earthYear * 165, 0.4, 'neptune.mp3');

  soundManager.setup({
    url: 'static/swf/',
    onready: function() {
      var bgSound = soundManager.createSound({
        id: 'bgsound',
        url: 'static/sound/earth_auroral_rad.mp3',
        volume: 15,
        onfinish: function() {
          soundManager.play('bgsound');
        }
      });
      //bgSound.play();
    }
  });

  resizeCanvas();
}

function resizeCanvas() {
  var container = document.getElementById('canvasContainer');
  canvas.setWidth(container.clientWidth);
  canvas.setHeight(container.clientHeight);
  canvas.calcOffset();

  canvas.clear();
  drawSolarSystem();
}

function drawSolarSystem() {
    // Only draw after all assets are loaded
    if (loadedAssets < totalAssets) return;

    var centerX = canvas.getWidth()/2;
    var centerY = canvas.getHeight()/2;

    animCount += 1;

    // Create stars
    for (var i = 0; i < 100; i++) {
      var shine = (Math.random() % 0.9) + 0.1
      var star = new fabric.Circle({
        left: Math.random() * canvas.getWidth(),
        top: Math.random() * canvas.getHeight(),
        fill: 'rgba(255,255,255,'+shine+')',
        selectable: false,
        radius: 1
      });
      star.name = "Star " + i;
      canvas.add(star);
    }

    // Create orbits first
    bodies.forEach(function(b) {
      createOrbit(b);
    });

    // Add in the bodies
    bodies.forEach(function(b) {
      canvas.add(b);
      b.center();
      b.set('left', b.getLeft() - b.distanceFromSun);
      animatePlanet(b);
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
  orbit.name = planet.name + '\'s orbit';
  canvas.add(orbit);
}

function createPlanet(name, distance, year, scale, sound) {
  totalAssets += 1;

  var soundId = name.toLowerCase();

  // Set up planet image and animation
  fabric.Image.fromURL('static/img/'+name+'.png', function(oImg) {
    // Planet stuff
    oImg.name = name;
    oImg.distanceFromSun = distance;
    oImg.yearDuration = year;
    if (sound != undefined) oImg.soundId = soundId;

    oImg.set('selectable', false);
    if (scale != undefined) oImg.scale(scale);
    bodies.push(oImg);
    loadedAssets += 1;

    // Draw the solar system if all assets are now loaded
    drawSolarSystem();
  });

  // Set up sound file
  if (sound != undefined) {
    var testSound = soundManager.createSound({
      id: soundId,
      url: 'static/sound/'+sound,
      onfinish: function() {
        soundManager.play(soundId);
      }
    });
  }
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
  var startAngle = savedAngles[planet.name] || fabric.util.getRandomInt(-180, 0);
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

        savedAngles[planet.name] = angle;
        angle = fabric.util.degreesToRadians(angle);

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
