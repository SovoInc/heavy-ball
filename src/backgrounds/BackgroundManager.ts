import * as THREE from "three";
import {
  type BackgroundTheme,
  pickBackgroundTheme,
} from "./BackgroundCatalog";

export interface BackgroundLayerSpec {
  suffix: "far" | "mid" | "near";
  distance: number;
  /** Texture offset per world unit of sideways camera movement. */
  motionFactor: number;
  /** Texture offset per radian of camera yaw. */
  yawFactor: number;
  driftSpeed: number;
  renderOrder: number;
}

export const BACKGROUND_LAYER_SPECS: readonly BackgroundLayerSpec[] = [
  { suffix: "far", distance: 180, motionFactor: 0.0012, yawFactor: 0.05, driftSpeed: 0.0008, renderOrder: -30 },
  { suffix: "mid", distance: 130, motionFactor: 0.003, yawFactor: 0.09, driftSpeed: 0.0018, renderOrder: -29 },
  { suffix: "near", distance: 90, motionFactor: 0.006, yawFactor: 0.14, driftSpeed: 0.0032, renderOrder: -28 },
];

export function calculateParallaxOffset(travel: number, motionFactor: number) {
  return travel * motionFactor;
}

/** Frustum height at a given distance, with margin so edges never peek in. */
export function frustumHeightAt(distance: number, fovDegrees: number, margin = 1.12) {
  return 2 * distance * Math.tan(THREE.MathUtils.degToRad(fovDegrees) / 2) * margin;
}

/**
 * Cover-crop horizontal repeat: the plane shows `repeat.x` of the texture at
 * full height, so the image keeps its aspect ratio (tiling horizontally)
 * instead of stretching to the plane.
 */
export function coverRepeatX(planeAspect: number, textureAspect: number) {
  return planeAspect / textureAspect;
}

interface RuntimeLayer {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  texture: THREE.Texture;
  textureAspect: number;
  spec: BackgroundLayerSpec;
}

export class BackgroundManager {
  private loader = new THREE.TextureLoader();
  private layers: RuntimeLayer[] = [];
  private loadGeneration = 0;
  private elapsed = 0;
  private lateralTravel = 0;
  private accumulatedYaw = 0;
  private lastCameraPosition = new THREE.Vector3();
  private lastYaw: number | null = null;
  private hasCameraPosition = false;
  currentTheme: BackgroundTheme = pickBackgroundTheme(() => 0);

  constructor(private scene: THREE.Scene) {}

  selectRandom(random: () => number = Math.random): BackgroundTheme {
    const theme = pickBackgroundTheme(random);
    this.setTheme(theme);
    return theme;
  }

  setTheme(theme: BackgroundTheme) {
    this.currentTheme = theme;
    this.loadGeneration++;
    const generation = this.loadGeneration;
    this.clearLayers();

    if (theme.kind === "procedural") return;

    const base = import.meta.env.BASE_URL;
    Promise.all(BACKGROUND_LAYER_SPECS.map(async (spec) => {
      const url = `${base}assets/backgrounds/layers/${theme.asset}-${spec.suffix}.webp`;
      const texture = await this.loader.loadAsync(url);
      return { spec, texture };
    })).then((loaded) => {
      if (generation !== this.loadGeneration) {
        for (const { texture } of loaded) texture.dispose();
        return;
      }

      for (const { spec, texture } of loaded) {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        const image = texture.image as { width?: number; height?: number };
        const textureAspect =
          image?.width && image?.height ? image.width / image.height : 16 / 9;

        // Unit plane; scaled every frame to fill the camera frustum at the
        // layer's distance, so the sky never shows as a floating rectangle.
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.FrontSide,
          transparent: spec.suffix !== "far",
          depthTest: false,
          depthWrite: false,
          fog: false,
          toneMapped: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = spec.renderOrder;
        mesh.frustumCulled = false;
        this.scene.add(mesh);
        this.layers.push({ mesh, texture, textureAspect, spec });
      }
    }).catch((error) => {
      console.warn(`Unable to load Heavy Ball background '${theme.name}'`, error);
    });
  }

  update(camera: THREE.PerspectiveCamera, deltaSeconds: number) {
    this.elapsed += deltaSeconds;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const yaw = Math.atan2(forward.x, forward.z);

    if (this.hasCameraPosition && this.lastYaw !== null) {
      // Signed sideways movement in camera space drives parallax; forward
      // travel doesn't scroll the horizon.
      const right = new THREE.Vector3(forward.z, 0, -forward.x).normalize();
      const delta = new THREE.Vector3().subVectors(camera.position, this.lastCameraPosition);
      this.lateralTravel += delta.dot(right);

      // Unwrap yaw so a turn accumulates continuously instead of jumping at ±π.
      let yawDelta = yaw - this.lastYaw;
      if (yawDelta > Math.PI) yawDelta -= 2 * Math.PI;
      if (yawDelta < -Math.PI) yawDelta += 2 * Math.PI;
      this.accumulatedYaw += yawDelta;
    }
    this.lastCameraPosition.copy(camera.position);
    this.lastYaw = yaw;
    this.hasCameraPosition = true;

    for (const layer of this.layers) {
      const { spec } = layer;
      const height = frustumHeightAt(spec.distance, camera.fov);
      const width = height * camera.aspect;

      layer.mesh.position.copy(camera.position).addScaledVector(forward, spec.distance);
      layer.mesh.quaternion.copy(camera.quaternion);
      layer.mesh.scale.set(width, height, 1);

      // Cover-crop so the art keeps its aspect ratio at any viewport size.
      layer.texture.repeat.set(coverRepeatX(width / height, layer.textureAspect), 1);
      layer.texture.offset.x = (
        this.elapsed * spec.driftSpeed
        + calculateParallaxOffset(this.lateralTravel, spec.motionFactor)
        + this.accumulatedYaw * spec.yawFactor
      ) % 1;
    }
  }

  dispose() {
    this.loadGeneration++;
    this.clearLayers();
    this.lateralTravel = 0;
    this.accumulatedYaw = 0;
    this.lastYaw = null;
    this.hasCameraPosition = false;
  }

  private clearLayers() {
    for (const layer of this.layers) {
      this.scene.remove(layer.mesh);
      layer.mesh.geometry.dispose();
      layer.mesh.material.dispose();
      layer.texture.dispose();
    }
    this.layers = [];
  }
}
