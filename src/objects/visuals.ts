import * as THREE from "three";

export interface SciFiMaterialOptions {
  color: number;
  emissive?: number;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
  map?: THREE.Texture;
  side?: THREE.Side;
  depthWrite?: boolean;
}

export function createSciFiMaterial(options: SciFiMaterialOptions): THREE.MeshStandardMaterial {
  const params: THREE.MeshStandardMaterialParameters = {
    color: options.color,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    roughness: options.roughness ?? 0.55,
    metalness: options.metalness ?? 0.28,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: options.side ?? THREE.FrontSide,
    depthWrite: options.depthWrite ?? true,
  };
  if (options.map) params.map = options.map;
  return new THREE.MeshStandardMaterial(params);
}

export function createEnergyMaterial(
  color: number,
  opacity = 0.45,
  emissiveIntensity = 0.8,
): THREE.MeshStandardMaterial {
  return createSciFiMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    roughness: 0.25,
    metalness: 0.15,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

export function createRoundedRectShape(width: number, depth: number, radius: number): THREE.Shape {
  const hw = width / 2;
  const hd = depth / 2;
  const r = Math.max(0, Math.min(radius, hw, hd));
  const shape = new THREE.Shape();

  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

  return shape;
}

export function createRoundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius = 0.16,
  segments = 5,
): THREE.BufferGeometry {
  const shapeRadius = Math.min(radius, width / 2, depth / 2);
  const bevel = Math.min(shapeRadius * 0.45, height * 0.35);
  const geometry = new THREE.ExtrudeGeometry(createRoundedRectShape(width, depth, shapeRadius), {
    depth: height,
    bevelEnabled: bevel > 0.001,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: Math.max(1, segments),
    curveSegments: Math.max(2, segments + 1),
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -height / 2, 0);
  geometry.computeVertexNormals();
  return geometry;
}

export function createRoundedPanel(
  width: number,
  depth: number,
  color: number,
  emissive = 0x000000,
  opacity = 1,
): THREE.Mesh {
  const panel = new THREE.Mesh(
    createRoundedBoxGeometry(width, 0.035, depth, Math.min(width, depth) * 0.08, 4),
    createSciFiMaterial({
      color,
      emissive,
      emissiveIntensity: emissive ? 0.25 : 0,
      roughness: 0.42,
      metalness: 0.35,
      transparent: opacity < 1,
      opacity,
    }),
  );
  panel.receiveShadow = true;
  return panel;
}

export function createRoundedBar(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
  radius = 0.06,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    createRoundedBoxGeometry(width, height, depth, radius, 4),
    material,
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createRingMesh(
  innerRadius: number,
  outerRadius: number,
  material: THREE.Material,
  segments = 64,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.RingGeometry(innerRadius, outerRadius, segments), material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export function makeCanvasTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

export function createCrackTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(128, (ctx, size) => {
    ctx.fillStyle = "#8d7354";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "#3d3023";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.55;

    const cracks = [
      [[18, 30], [42, 38], [50, 64], [78, 72], [96, 104]],
      [[84, 14], [78, 38], [102, 52], [108, 82]],
      [[22, 94], [40, 82], [62, 88], [72, 114]],
    ];

    for (const crack of cracks) {
      ctx.beginPath();
      ctx.moveTo(crack[0][0], crack[0][1]);
      for (let i = 1; i < crack.length; i++) {
        ctx.lineTo(crack[i][0], crack[i][1]);
      }
      ctx.stroke();
    }
  });
}

function makeSpriteTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

let sharedFireSprite: THREE.CanvasTexture | null = null;
export function getFireSpriteTexture(): THREE.CanvasTexture {
  if (sharedFireSprite) return sharedFireSprite;
  sharedFireSprite = makeSpriteTexture(64, (ctx, size) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0.0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(255,235,150,0.9)");
    grad.addColorStop(0.55, "rgba(255,150,40,0.55)");
    grad.addColorStop(0.85, "rgba(180,40,0,0.18)");
    grad.addColorStop(1.0, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  });
  return sharedFireSprite;
}

let sharedSnowflakeSprite: THREE.CanvasTexture | null = null;
export function getSnowflakeSpriteTexture(): THREE.CanvasTexture {
  if (sharedSnowflakeSprite) return sharedSnowflakeSprite;
  sharedSnowflakeSprite = makeSpriteTexture(64, (ctx, size) => {
    const cx = size / 2;
    const cy = size / 2;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    grad.addColorStop(0.0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(220,235,255,0.7)");
    grad.addColorStop(1.0, "rgba(180,210,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const arm = size * 0.42;
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(arm, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arm * 0.55, 0);
      ctx.lineTo(arm * 0.7, -arm * 0.18);
      ctx.moveTo(arm * 0.55, 0);
      ctx.lineTo(arm * 0.7, arm * 0.18);
      ctx.stroke();
    }
  });
  return sharedSnowflakeSprite;
}

let sharedPortalSwirlSprite: THREE.CanvasTexture | null = null;
export function getPortalSwirlTexture(): THREE.CanvasTexture {
  if (sharedPortalSwirlSprite) return sharedPortalSwirlSprite;
  sharedPortalSwirlSprite = makeSpriteTexture(256, (ctx, size) => {
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2;

    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    bg.addColorStop(0.0, "rgba(245,225,255,0.95)");
    bg.addColorStop(0.35, "rgba(170,120,255,0.55)");
    bg.addColorStop(0.75, "rgba(80,40,160,0.25)");
    bg.addColorStop(1.0, "rgba(0,0,0,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(255,235,255,0.85)";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    const arms = 4;
    for (let a = 0; a < arms; a++) {
      ctx.beginPath();
      const phase = (a / arms) * Math.PI * 2;
      for (let t = 0; t <= 1; t += 0.02) {
        const r = t * maxR * 0.95;
        const angle = phase + t * Math.PI * 3.2;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.globalAlpha = 0.7;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR * 0.18);
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, maxR * 0.18, 0, Math.PI * 2);
    ctx.fill();
  });
  return sharedPortalSwirlSprite;
}
