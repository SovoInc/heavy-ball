import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";
import { createRoundedBar, createSciFiMaterial } from "./visuals";

export interface LatticeWallDef {
  position: [number, number, number];
  width: number;
  height: number;
  rotation?: number;
  gapSide?: "left" | "right" | "center";
  gapWidth?: number;
}

export class LatticeWall {
  group: THREE.Group;
  bodies: CANNON.Body[] = [];

  constructor(scene: THREE.Scene, physics: Physics, def: LatticeWallDef) {
    const {
      position,
      width,
      height,
      rotation = 0,
      gapSide,
      gapWidth = 1.5,
    } = def;
    const [px, py, pz] = position;

    this.group = new THREE.Group();

    const barThickness = 0.08;
    const barMat = createSciFiMaterial({
      color: CONFIG.colors.latticeWall,
      emissive: 0x223344,
      emissiveIntensity: 0.28,
      metalness: 0.65,
      roughness: 0.26,
    });

    const sections = this.computeSections(width, gapSide, gapWidth);

    for (const section of sections) {
      const { offset, sectionWidth } = section;
      this.buildLatticeSection(
        sectionWidth,
        height,
        barThickness,
        barMat,
        offset,
        height / 2,
      );

      const collisionDepth = 1;
      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(
          new CANNON.Vec3(sectionWidth / 2, height / 2, collisionDepth / 2),
        ),
        material: physics.wallMaterial,
      });
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      body.position.set(
        px + offset * cos,
        py + height / 2,
        pz - offset * sin,
      );
      if (rotation) body.quaternion.setFromEuler(0, rotation, 0);
      physics.addBody(body);
      this.bodies.push(body);
    }

    this.group.position.set(px, py, pz);
    this.group.rotation.y = rotation;
    scene.add(this.group);
  }

  private computeSections(
    width: number,
    gapSide?: string,
    gapWidth = 1.5,
  ): { offset: number; sectionWidth: number }[] {
    if (!gapSide) {
      return [{ offset: 0, sectionWidth: width }];
    }

    const halfGap = gapWidth / 2;
    const halfWidth = width / 2;

    if (gapSide === "left") {
      const sw = width - gapWidth;
      return [{ offset: gapWidth / 2, sectionWidth: sw }];
    }
    if (gapSide === "right") {
      const sw = width - gapWidth;
      return [{ offset: -gapWidth / 2, sectionWidth: sw }];
    }
    // center gap: two sections
    const sw = (width - gapWidth) / 2;
    return [
      { offset: -(halfGap + sw / 2), sectionWidth: sw },
      { offset: halfGap + sw / 2, sectionWidth: sw },
    ];
  }

  private buildLatticeSection(
    w: number,
    h: number,
    bar: number,
    mat: THREE.Material,
    offsetX: number,
    centerY: number,
  ) {
    const cols = Math.max(2, Math.floor(w / 0.5));
    const rows = Math.max(2, Math.floor(h / 0.5));
    const spacingX = w / (cols - 1);
    const spacingY = h / (rows - 1);

    // vertical bars
    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + c * spacingX + offsetX;
      const mesh = createRoundedBar(bar, h, bar, mat, bar * 0.4);
      mesh.position.set(x, centerY, 0);
      this.group.add(mesh);
    }

    // horizontal bars
    for (let r = 0; r < rows; r++) {
      const y = centerY - h / 2 + r * spacingY;
      const mesh = createRoundedBar(w, bar, bar, mat, bar * 0.4);
      mesh.position.set(offsetX, y, 0);
      this.group.add(mesh);
    }

    // frame
    const frameBar = bar * 1.5;
    const frameMat = mat.clone() as THREE.MeshStandardMaterial;
    frameMat.color.multiplyScalar(0.7);

    const topBot: [number, number, number, number][] = [
      [offsetX, centerY + h / 2, w + frameBar, frameBar],
      [offsetX, centerY - h / 2, w + frameBar, frameBar],
    ];
    for (const [x, y, fw, fh] of topBot) {
      const mesh = createRoundedBar(fw, fh, frameBar, frameMat, frameBar * 0.35);
      mesh.position.set(x, y, 0);
      this.group.add(mesh);
    }

    const leftRight: [number, number][] = [
      [offsetX - w / 2, centerY],
      [offsetX + w / 2, centerY],
    ];
    for (const [x, y] of leftRight) {
      const mesh = createRoundedBar(frameBar, h, frameBar, frameMat, frameBar * 0.35);
      mesh.position.set(x, y, 0);
      this.group.add(mesh);
    }
  }
}
