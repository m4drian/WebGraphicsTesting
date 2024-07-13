import * as pc from 'playcanvas';

export function loadPlayCanvasBenchmark(selectedApi, statsGL) {
  console.info('Selected API: ', selectedApi);
  let canvas = document.createElement('canvas');
  canvas.width = 1440;
  canvas.height = 810;
  canvas.id = "mycanvas";
  document.body.appendChild(canvas);
  
  const app = new pc.Application(canvas);

  // Configure App
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_FIXED, 1440, 810);
  //window.addEventListener('resize', () => app.resizeCanvas());

  // Create Box Entity
  const box = new pc.Entity('cube');
  box.addComponent('model', {
    type: 'box'
  });
  app.root.addChild(box);

  // Create Camera Entity
  const camera = new pc.Entity('camera');
  camera.addComponent('camera', {
    clearColor: new pc.Color(0.1, 0.2, 0.3)
  });
  app.root.addChild(camera);
  camera.setPosition(0, 0, 3);

  // Create Directional Light Entity
  const light = new pc.Entity('light');
  light.addComponent('light');
  app.root.addChild(light);
  light.setEulerAngles(45, 0, 0);

  // Rotate Box on Update
  app.on('update', dt => { 
    box.rotate(10 * dt, 20 * dt, 30 * dt)
    statsGL.update();
  });

  app.start();

  // stats
  statsGL.init( canvas );

  setTimeout(() => {
    console.info('benchmark stopped');
    app.destroy();
    document.body.removeChild(canvas);
}, 10000);
}