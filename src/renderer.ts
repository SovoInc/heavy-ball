import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from "postprocessing";
import { CONFIG } from "./config";
import { BackgroundManager } from "./backgrounds/BackgroundManager";
import { findBackgroundTheme } from "./backgrounds/BackgroundCatalog";

export class Renderer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private stars!: THREE.Points;
  private shootingStars: ShootingStar[] = [];
  private shootingStarGroup!: THREE.Group;
  private clock = new THREE.Clock();
  private backgroundManager: BackgroundManager;
  private speedLines!: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      500,
    );
    this.camera.position.set(0, 10, 15);
    this.scene.add(this.camera);

    // Native AA off: the composer's MSAA buffers handle it (and smooth the
    // platforms' alpha-hash dither).
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    const quality = Renderer.detectQuality();
    const dpr = Math.min(window.devicePixelRatio, quality === "high" ? 2 : quality === "medium" ? 1.5 : 1.15);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Scene renders linear HDR into the composer's half-float buffer; the
    // ACES tone-mapping effect at the end of the pipeline maps it to screen.
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Image-based ambient so metals/clearcoat have something to reflect.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.35;
    pmrem.dispose();

    this.composer = new EffectComposer(this.renderer, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: quality === "low" ? 0 : quality === "medium" ? 2 : 4,
    });
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new BloomEffect({
      luminanceThreshold: 0.85,
      luminanceSmoothing: 0.2,
      intensity: 0.9,
      mipmapBlur: true,
      radius: 0.7,
    });
    const vignette = new VignetteEffect({ offset: 0.28, darkness: 0.55 });
    const toneMapping = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
    this.composer.addPass(new EffectPass(this.camera, bloom, vignette, toneMapping));

    this.setupLighting();
    this.setupSky();
    this.setupStars();
    this.setupShootingStars();
    this.setupSpeedLines();
    this.backgroundManager = new BackgroundManager(this.scene);

    window.addEventListener("resize", this.onResize);
  }

  private static detectQuality(): "low" | "medium" | "high" {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = navigator.hardwareConcurrency || 4;
    const memory = nav.deviceMemory ?? 8;
    if (memory <= 2 || cores <= 2) return "low";
    if (memory <= 4 || cores <= 4) return "medium";
    return "high";
  }

  sun!: THREE.DirectionalLight;

  private setupLighting() {
    // Low flat fill — the environment map carries most of the ambient now,
    // so form/shading from the sun and rim light stays readable.
    const ambient = new THREE.AmbientLight(0xffffff, 0.22);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x8899cc, 0x443322, 0.4);
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
    this.sun.shadow.radius = 4;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    // Cool rim/back light opposite the sun: bright edge on the ball against
    // the dark space background. No shadows — it's purely a highlight.
    this.rim = new THREE.DirectionalLight(0x6688ff, 0.7);
    this.rim.position.set(-20, 18, -20);
    this.scene.add(this.rim);
    this.scene.add(this.rim.target);
  }

  private rim!: THREE.DirectionalLight;

  updateSunTarget(x: number, y: number, z: number) {
    this.sun.position.set(x + 20, y + 40, z + 20);
    this.sun.target.position.set(x, y, z);
    this.rim.position.set(x - 20, y + 18, z - 20);
    this.rim.target.position.set(x, y, z);
  }

  selectRandomBackground() {
    const forcedTheme = findBackgroundTheme(new URLSearchParams(window.location.search).get("background"));
    const theme = forcedTheme ?? this.backgroundManager.selectRandom();
    if (forcedTheme) this.backgroundManager.setTheme(forcedTheme);
    const showProceduralSky = theme.kind === "procedural";
    this.stars.visible = showProceduralSky;
    this.shootingStarGroup.visible = showProceduralSky;
  }

  private setupSky() {
    this.scene.background = new THREE.Color(0x020208);
    this.scene.fog = new THREE.FogExp2(0x020208, 0.004);
  }

  private setupStars() {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute on a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 200 + Math.random() * 100;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.5 + Math.random() * 2.0;

      // Slight color variation: white, blue-white, warm-white
      const temp = Math.random();
      if (temp < 0.6) {
        // White
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 1.0;
      } else if (temp < 0.85) {
        // Blue-white
        colors[i * 3] = 0.7 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.1;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Warm
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.15;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.2,
      sizeAttenuation: true,
      vertexColors: true,
      fog: false,
      // Background layer: drawn first, no depth — opaque objects (ball,
      // obstacles) still paint over the stars, while translucent platforms
      // blend over them, so stars show through platforms only.
      transparent: false,
      depthTest: false,
      depthWrite: false,
    });

    this.stars = new THREE.Points(geo, mat);
    this.stars.renderOrder = -1;
    this.scene.add(this.stars);
  }

  private setupShootingStars() {
    this.shootingStarGroup = new THREE.Group();
    this.scene.add(this.shootingStarGroup);
  }

  private setupSpeedLines() {
    const count = 34;
    const positions = new Float32Array(count * 2 * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 10;
      const z = -3 - Math.random() * 20;
      positions.set([x, y, z, x, y, z - 0.45 - Math.random() * 1.1], i * 6);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0x9ee8ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.speedLines = new THREE.LineSegments(geometry, material);
    this.speedLines.frustumCulled = false;
    this.speedLines.renderOrder = 9;
    this.camera.add(this.speedLines);
  }

  private updateSpeedLines(dt: number, momentum: number) {
    const visibility = THREE.MathUtils.clamp((momentum - 0.56) / 0.44, 0, 1);
    this.speedLines.visible = visibility > 0.01;
    this.speedLines.material.opacity = visibility * 0.44;
    if (!this.speedLines.visible) return;
    const position = this.speedLines.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i += 2) {
      let z = position.getZ(i) + dt * (12 + momentum * 28);
      if (z > -1.5) z = -22 - Math.random() * 8;
      const length = 0.5 + momentum * 1.8;
      position.setZ(i, z);
      position.setZ(i + 1, z - length);
    }
    position.needsUpdate = true;
  }

  private spawnShootingStar() {
    const trail = new ShootingStar(this.shootingStarGroup);
    this.shootingStars.push(trail);
  }

  updateEffects(): number {
    const dt = this.clock.getDelta();

    // Blink stars
    const sizes = this.stars.geometry.getAttribute("size") as THREE.BufferAttribute;
    const time = this.clock.elapsedTime;
    for (let i = 0; i < sizes.count; i++) {
      const base = 0.5 + ((i * 7.31) % 1) * 2.0;
      const rate = 0.8 + (i % 11) * 0.4;
      const phase = i * 1.73;
      // Combine two sine waves for irregular blinking
      const blink = Math.sin(time * rate + phase) * 0.5 + Math.sin(time * rate * 2.3 + phase * 0.7) * 0.3;
      sizes.setX(i, base * Math.max(0.1, 0.5 + blink));
    }
    sizes.needsUpdate = true;

    // Rotate star sphere for visible drifting motion
    this.stars.rotation.y += dt * 0.01;
    this.stars.rotation.x += dt * 0.0025;

    // Shooting stars
    if (this.shootingStars.length < 5 && Math.random() < dt * 1.2) {
      this.spawnShootingStar();
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      if (!this.shootingStars[i].update(dt)) {
        this.shootingStars[i].dispose();
        this.shootingStars.splice(i, 1);
      }
    }

    return dt;
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.composer.setSize(window.innerWidth, window.innerHeight, false);
  };

  render(momentum = 0) {
    const dt = this.updateEffects();
    this.updateSpeedLines(dt, momentum);
    this.backgroundManager.update(this.camera, dt);
    this.composer.render(dt);
  }

  dispose() {
    window.removeEventListener("resize", this.onResize);
    this.backgroundManager.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}

class ShootingStar {
  private mesh: THREE.Mesh;
  private velocity: THREE.Vector3;
  private life: number;
  private maxLife: number;
  private material: THREE.MeshBasicMaterial;

  constructor(parent: THREE.Group) {
    // Random start position high up
    const angle = Math.random() * Math.PI * 2;
    const elevation = 30 + Math.random() * 60;
    const dist = 80 + Math.random() * 80;

    const startX = Math.cos(angle) * dist;
    const startY = elevation;
    const startZ = Math.sin(angle) * dist;

    // Direction: generally downward and across
    const speed = 60 + Math.random() * 80;
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * speed,
      -(0.3 + Math.random() * 0.5) * speed,
      (Math.random() - 0.5) * speed,
    );

    this.maxLife = 0.4 + Math.random() * 0.6;
    this.life = this.maxLife;

    // Elongated geometry for streak effect
    const length = 1.5 + Math.random() * 2;
    const geo = new THREE.CylinderGeometry(0, 0.08, length, 4, 1);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      fog: false,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(startX, startY, startZ);

    // Orient along velocity
    const dir = this.velocity.clone().normalize();
    this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    parent.add(this.mesh);
  }

  update(dt: number): boolean {
    this.life -= dt;
    if (this.life <= 0) return false;

    this.mesh.position.addScaledVector(this.velocity, dt);

    // Fade out
    const t = this.life / this.maxLife;
    this.material.opacity = t * 0.9;

    return true;
  }

  dispose() {
    this.mesh.parent?.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
