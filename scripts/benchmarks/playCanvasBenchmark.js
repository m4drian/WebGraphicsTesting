import * as pc from 'playcanvas';

function createPlayCanvasApp() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);

  const app = new pc.Application(canvas);

  // Configure App
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  window.addEventListener('resize', () => app.resizeCanvas());

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
  app.on('update', dt => box.rotate(10 * dt, 20 * dt, 30 * dt));

  app.start();
}

export default createPlayCanvasApp;