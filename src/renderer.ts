import * as THREE from "three";
import { CONFIG } from "./config";

export class Renderer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      500,
    );
    this.camera.position.set(0, 10, 15);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.setupLighting();
    this.setupSky();

    window.addEventListener("resize", this.onResize);
  }

  sun!: THREE.DirectionalLight;

  private setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x8899cc, 0x443322, 0.6);
    this.scene.add(hemi);

    this.sun = new THREE.DirectionalLight(0xffeedd, 1.4);
    this.sun.position.set(20, 40, 20);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -30;
    this.sun.shadow.camera.right = 30;
    this.sun.shadow.camera.top = 30;
    this.sun.shadow.camera.bottom = -30;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 100;
    this.sun.shadow.bias = -0.001;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
  }

  updateSunTarget(x: number, y: number, z: number) {
    this.sun.position.set(x + 20, y + 40, z + 20);
    this.sun.target.position.set(x, y, z);
  }

  private setupSky() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#" + new THREE.Color(CONFIG.colors.sky.top).getHexString());
    grad.addColorStop(1, "#" + new THREE.Color(CONFIG.colors.sky.bottom).getHexString());
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = texture;

    this.scene.fog = new THREE.FogExp2(
      CONFIG.colors.sky.bottom,
      0.005,
    );
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  };

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }
}
