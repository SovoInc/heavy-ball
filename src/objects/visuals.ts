import * as THREE from "three";

export const COURSE_RAIL = {
  inset: 0.24,
  elevation: 0.075,
  width: 0.075,
  radius: 0.04,
  opacity: 0.9,
  emissiveIntensity: 2.4,
} as const;

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
  sharedFireSprite = makeSpriteTexture(128, (ctx, size) => {
    const cx = size / 2;
    const grad = ctx.createLinearGradient(cx, size * 0.08, cx, size * 0.96);
    grad.addColorStop(0, "rgba(255,45,0,0)");
    grad.addColorStop(0.2, "rgba(255,55,0,.62)");
    grad.addColorStop(0.55, "rgba(255,145,15,.95)");
    grad.addColorStop(0.78, "rgba(255,235,120,1)");
    grad.addColorStop(1, "rgba(255,255,235,.98)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, size * 0.04);
    ctx.bezierCurveTo(size * 0.66, size * 0.25, size * 0.88, size * 0.52, size * 0.76, size * 0.76);
    ctx.bezierCurveTo(size * 0.7, size * 0.94, size * 0.57, size * 0.99, cx, size * 0.98);
    ctx.bezierCurveTo(size * 0.3, size * 0.98, size * 0.14, size * 0.83, size * 0.2, size * 0.62);
    ctx.bezierCurveTo(size * 0.24, size * 0.44, size * 0.41, size * 0.34, cx, size * 0.04);
    ctx.fill();

    ctx.globalCompositeOperation = "source-atop";
    const core = ctx.createRadialGradient(cx, size * 0.78, 0, cx, size * 0.78, size * 0.22);
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(0.45, "rgba(255,244,160,.9)");
    core.addColorStop(1, "rgba(255,130,0,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, size * 0.52, size, size * 0.48);
    ctx.globalCompositeOperation = "source-over";
  });
  return sharedFireSprite;
}

export function createFireMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { flameMap: { value: getFireSpriteTexture() } },
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float flameSize;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = flameSize * (420.0 / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D flameMap;
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord;
        // Stretch the teardrop vertically and introduce a small asymmetric
        // lick so the field reads as flame rather than round particles.
        uv.x += sin(uv.y * 8.0) * 0.035 * (1.0 - uv.y);
        vec4 flame = texture2D(flameMap, uv);
        if (flame.a < 0.025) discard;
        gl_FragColor = vec4(flame.rgb * vColor, flame.a * 0.86);
      }
    `,
  });
}

let sharedLavaFlow: THREE.CanvasTexture | null = null;
export function getLavaFlowTexture(): THREE.CanvasTexture {
  if (sharedLavaFlow) return sharedLavaFlow;
  sharedLavaFlow = makeCanvasTexture(256, (ctx, size) => {
    ctx.fillStyle = "#4a0700";
    ctx.fillRect(0, 0, size, size);
    ctx.lineCap = "round";
    for (let i = 0; i < 34; i++) {
      let x = Math.random() * size;
      let y = -20;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let step = 0; step < 8; step++) {
        x += (Math.random() - 0.5) * 34;
        y += size / 7;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255,55,0,.75)";
      ctx.lineWidth = 8 + Math.random() * 7;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,220,70,.95)";
      ctx.lineWidth = 2 + Math.random() * 3;
      ctx.stroke();
    }
  });
  sharedLavaFlow.repeat.set(1.7, 1.7);
  return sharedLavaFlow;
}

let sharedIceSurface: THREE.CanvasTexture | null = null;
export function getIceSurfaceTexture(): THREE.CanvasTexture {
  if (sharedIceSurface) return sharedIceSurface;
  sharedIceSurface = makeCanvasTexture(256, (ctx, size) => {
    const bg = ctx.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, "#72c9e8");
    bg.addColorStop(0.5, "#c8f5ff");
    bg.addColorStop(1, "#4b8fb9");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(235,252,255,.72)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 22; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        ctx.lineTo(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 80);
      }
      ctx.stroke();
    }
  });
  // Ice should read as one poured/frozen sheet. Repeating this square texture
  // exposed its edges and made long surfaces look like rows of ceramic tiles.
  // Clamp one crystalline field across each authored surface instead.
  sharedIceSurface.wrapS = THREE.ClampToEdgeWrapping;
  sharedIceSurface.wrapT = THREE.ClampToEdgeWrapping;
  sharedIceSurface.repeat.set(1, 1);
  sharedIceSurface.needsUpdate = true;
  return sharedIceSurface;
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
