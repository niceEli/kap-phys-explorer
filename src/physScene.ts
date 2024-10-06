import { GameObj, Vec2 } from "kaplay";
import k from "./kaplay";
import { modes } from "./modes";
import drawGrid from "./drawGrid";
import { RapierBodyComp } from "kaplay-physics-rapier";
export default function scn_physScene() {
  let spawningRN: boolean = false;
  let spawnStart: Vec2 = k.vec2(0, 0);
  let mode: modes = modes.null;

  let isPlaying: boolean = false;

  let grabbedObject: GameObj | null = null;
  let grabbedObjectDiff: Vec2 = k.vec2(0, 0);

  let jointObj: GameObj | null = null;
  let jointObjDiff: Vec2 = k.vec2(0, 0);

  let jointObjEnd: GameObj | null = null;
  let jointObjDiffEnd: Vec2 = k.vec2(0, 0);

  let oCam: Vec2 = k.vec2(0, 0);
  let oCamSpace: Vec2 = k.vec2(0, 0);

  let zCam: Vec2 = k.vec2(0, 0);
  let zCamZoom: Vec2 = k.vec2(0, 0);

  let initialRotation: number = 0;

  let initialDiffRotation: Vec2 = k.vec2(0, 0);

  k.setGravity(980);

  k.camPos(k.vec2(0, 0));

  k.add([
    k.layer("bg"),
    {
      draw() {
        drawGrid();
      },
    },
  ]);

  k.onUpdate(() => {
    if (k.isKeyPressed("space")) {
      isPlaying = !isPlaying;
    }
    if (k.physics.world && isPlaying) {
      1;
      k.physics.world.step();
    }
  });

  k.add([
    k.text(""),
    k.fixed(),
    k.layer("ui"),
    k.outline(1, k.BLACK),
    {
      update() {
        (this as any).text =
          `FPS: ${Math.round(1 / k.dt())}\nMode: ${modes[mode].toString()}\nPlaying: ${isPlaying}`;
      },
    },
  ]);

  k.add([
    k.text("", {
      align: "right",
    }),
    k.fixed(),
    k.pos(k.width(), 0),
    k.anchor("topright"),
    k.layer("ui"),
    k.outline(1, k.BLACK),
    {
      update() {
        (this as any).text =
          `Pos: ${Math.round(k.camPos().x * 10) / 10 + ", " + Math.round(k.camPos().y * 10) / 10}\nZoom: ${Math.round(k.camScale().x * 100) / 100}`;
      },
    },
  ]);

  k.onUpdate(() => {
    if (k.isKeyPressed("1")) {
      mode = modes.square;
    }
    if (k.isKeyPressed("2")) {
      mode = modes.circle;
    }
    if (k.isKeyPressed("3")) {
      mode = modes.rotate;
    }
    if (k.isKeyPressed("4")) {
      mode = modes.move;
    }
    if (k.isKeyPressed("5")) {
      mode = modes.delete;
    }
    if (k.isKeyPressed("6")) {
      mode = modes.joint;
    }
    if (k.isKeyPressed("7")) {
      mode = modes.weld;
    }
    if (k.isKeyPressed("9")) {
      mode = modes.grab;
    }
    if (k.isKeyPressed("0")) {
      mode = modes.null;
    }

    if (k.isKeyPressed("r")) {
      k.go(k.getSceneName() as string);
    }

    if (k.isMousePressed("right")) {
      oCam = k.mousePos();
      oCamSpace = k.camPos();
    }

    if (k.isMouseDown("right")) {
      const currentMousePos = k.mousePos();
      const camScale = k.camScale();
      const diffX = (currentMousePos.x - oCam.x) / camScale.x;
      const diffY = (currentMousePos.y - oCam.y) / camScale.y;
      k.camPos(oCamSpace.x - diffX, oCamSpace.y - diffY);
    }

    if (k.isMouseReleased("right")) {
      const currentMousePos = k.mousePos();
      const diffX = currentMousePos.x - oCam.x;
      const diffY = currentMousePos.y - oCam.y;

      const diff = Math.sqrt(diffX * diffX + diffY * diffY);

      if (diff < 5) {
        k.camPos(0, 0);
      }
    }

    if (k.isMousePressed("middle")) {
      zCam = k.mousePos();
      zCamZoom = k.camScale();
    }

    if (k.isMouseDown("middle")) {
      const currentMousePos = k.mousePos();
      const diffY = currentMousePos.y - zCam.y;
      let zoomFactor = 1 + diffY * 0.01;
      k.camScale(zCamZoom.x * zoomFactor, zCamZoom.y * zoomFactor);
      const sc = k.camScale();

      sc.x = Math.max(0.1, sc.x);
      sc.y = Math.max(0.1, sc.x);

      sc.x = Math.min(20, sc.x);
      sc.y = Math.min(20, sc.x);

      k.camScale(sc);
    }

    if (k.isMouseReleased("middle")) {
      const currentMousePos = k.mousePos();
      const diffX = currentMousePos.x - zCam.x;
      const diffY = currentMousePos.y - zCam.y;

      const diff = Math.sqrt(diffX * diffX + diffY * diffY);

      if (diff < 5) {
        k.camScale(1, 1);
      }
    }

    switch (mode.valueOf()) {
      case modes.square:
        if (k.isMousePressed() && spawningRN == false) {
          spawningRN = true;
          spawnStart = k.toWorld(k.mousePos());
        }

        if (spawningRN == true) {
          let width = k.toWorld(k.mousePos()).x - spawnStart.x;
          let height = k.toWorld(k.mousePos()).y - spawnStart.y;

          if (k.isKeyDown("control")) {
            const maxSize = Math.max(Math.abs(width), Math.abs(height));
            width = maxSize * Math.sign(width);
            height = maxSize * Math.sign(height);
          }

          k.drawRect({
            pos: spawnStart,
            width: width,
            height: height,
            color: k.BLACK,
            outline: { color: k.WHITE, width: 4 },
          });
        }

        if (!k.isMouseDown() && spawningRN == true) {
          spawningRN = false;

          const size = k.vec2(
            Math.abs(k.toWorld(k.mousePos()).x - spawnStart.x),
            Math.abs(k.toWorld(k.mousePos()).y - spawnStart.y)
          );

          if (k.isKeyDown("control")) {
            const maxSize = Math.max(size.x, size.y);
            size.x = maxSize;
            size.y = maxSize;
          }

          if (
            k.toWorld(k.mousePos()).x - spawnStart.x <= 1 ||
            k.toWorld(k.mousePos()).y - spawnStart.y <= 1
          ) {
            break;
          }

          if (k.isKeyDown("shift")) {
            k.add([
              k.pos(
                k.toWorld(k.mousePos()).x - size.x / 2,
                k.toWorld(k.mousePos()).y - size.y / 2
              ),
              k.anchor("center"),
              k.rect(size.x, size.y),
              k.color(150, 150, 150),
              k.outline(1, k.BLACK),
              k.area(),
              k.physics.body({
                isStatic: true,
                kinematic: true,
              }),
              "physobject",
              "physobject:rect",
              "physobject:static",
            ]);
          } else {
            k.add([
              k.pos(spawnStart.add(size.scale(0.5))),
              k.anchor("center"),
              k.rect(size.x, size.y),
              k.color(k.WHITE),
              k.outline(1, k.BLACK),
              k.area(),
              k.physics.body(),
              "physobject",
              "physobject:rect",
              "physobject:grabbable",
            ]);
          }
        }
        break;
      case modes.circle:
        if (k.isMousePressed() && spawningRN == false) {
          spawningRN = true;
          spawnStart = k.toWorld(k.mousePos());
        }

        let rad = 0;
        if (spawningRN) {
          const mousePos = k.toWorld(k.mousePos());
          const dx = mousePos.x - spawnStart.x;
          const dy = mousePos.y - spawnStart.y;
          rad = Math.sqrt(dx * dx + dy * dy);

          if (!(dx <= 1 && dy <= 1)) {
            k.drawCircle({
              pos: spawnStart,
              radius: rad,
              color: k.BLACK,
              outline: { color: k.WHITE, width: 4 },
            });
          }
        }

        if (!k.isMouseDown() && spawningRN == true) {
          const mousePos = k.toWorld(k.mousePos());
          const dx = mousePos.x - spawnStart.x;
          const dy = mousePos.y - spawnStart.y;
          rad = Math.sqrt(dx * dx + dy * dy);
          spawningRN = false;

          if (dx <= 1 && dy <= 1) {
            break;
          }

          if (k.isKeyDown("shift")) {
            k.add([
              k.pos(spawnStart),
              k.anchor("center"),
              k.circle(rad),
              k.color(150, 150, 150),
              k.outline(1, k.BLACK),
              k.area(),
              k.physics.body({
                isStatic: true,
                kinematic: true,
              }),
              "physobject",
              "physobject:circle",
              "physobject:static",
            ]);
          } else {
            k.add([
              k.pos(spawnStart),
              k.anchor("center"),
              k.circle(rad),
              k.color(k.WHITE),
              k.outline(1, k.BLACK),
              k.area(),
              k.physics.body(),
              "physobject",
              "physobject:circle",
              "physobject:grabbable",
            ]);
          }
        }
        break;
      case modes.delete:
        if (k.isMousePressed()) {
          for (const object of k.get("physobject").reverse()) {
            if (object.isHovering()) {
              k.destroy(object);
              break;
            }
          }
        }
        break;
      case modes.grab:
        if (k.isMousePressed()) {
          for (const obj of k.get("physobject:grabbable").reverse()) {
            if (obj.isHovering()) {
              grabbedObject = obj;
              grabbedObjectDiff = k.toWorld(k.mousePos()).sub(obj.pos);
              break;
            }
          }
        }

        if (grabbedObject) {
          let mp = k.toWorld(k.mousePos());
          grabbedObject.velocity = mp
            .sub(grabbedObjectDiff.add(grabbedObject.pos))
            .scale(10);
        }

        if (k.isMouseReleased()) {
          grabbedObject = null;
        }
        break;
      case modes.joint:
        const mouse = k.toWorld(k.mousePos());
        if (k.isMousePressed() && spawningRN == false) {
          for (const obj of k.get("physobject:grabbable").reverse()) {
            if (obj.isHovering()) {
              jointObj = obj;
              jointObjDiff = k.toWorld(k.mousePos()).sub(obj.pos);
            }
          }
          if (jointObj) {
            spawningRN = true;
            spawnStart = k.toWorld(k.mousePos());
          }
        }

        if (spawningRN) {
          k.drawLine({
            p1: spawnStart,
            p2: mouse,
            color: k.GREEN,
            width: 4,
          });
        }

        if (k.isMouseReleased() && spawningRN) {
          for (const obj of k.get("physobject:grabbable").reverse()) {
            if (obj.isHovering()) {
              jointObjEnd = obj;
              jointObjDiffEnd = k.toWorld(k.mousePos()).sub(obj.pos);
            }
          }

          if (jointObjEnd) {
            k.add([
              k.physics.joint({
                joint: {
                  type: "spring",
                  anchor1: jointObjDiff,
                  anchor2: jointObjDiffEnd,
                  restLength: spawnStart.sub(mouse).len(),
                  stiffness: 0.7,
                  damping: 0.1,
                },
                parent1: jointObj as GameObj<RapierBodyComp>,
                parent2: jointObjEnd as GameObj<RapierBodyComp>,
              }),
            ]);

            jointObj = null;
            jointObjEnd = null;
            spawningRN = false;
          }

          jointObj = null;
          spawningRN = false;
        }
        break;
      case modes.weld:
        const mouseP = k.toWorld(k.mousePos());
        if (k.isMousePressed() && spawningRN == false) {
          for (const obj of k.get("physobject:grabbable").reverse()) {
            if (obj.isHovering()) {
              jointObj = obj;
              jointObjDiff = k.toWorld(k.mousePos()).sub(obj.pos);
            }
          }
          if (jointObj) {
            spawningRN = true;
            spawnStart = k.toWorld(k.mousePos());
          }
        }

        if (spawningRN) {
          k.drawLine({
            p1: spawnStart,
            p2: mouseP,
            color: k.GREEN,
            width: 4,
          });
        }

        if (k.isMouseReleased() && spawningRN) {
          for (const obj of k.get("physobject:grabbable").reverse()) {
            if (obj.isHovering()) {
              jointObjEnd = obj;
              jointObjDiffEnd = k.toWorld(k.mousePos()).sub(obj.pos);
            }
          }

          if (jointObjEnd) {
            k.add([
              k.physics.joint({
                joint: {
                  type: "rope",
                  anchor1: jointObjDiff,
                  anchor2: jointObjDiffEnd,
                  length: 1,
                },
                parent1: jointObj as GameObj<RapierBodyComp>,
                parent2: jointObjEnd as GameObj<RapierBodyComp>,
              })
            ]);

            jointObj = null;
            jointObjEnd = null;
            spawningRN = false;
          }

          jointObj = null;
          spawningRN = false;
        }
        break;
      case modes.move:
        if (k.isMousePressed() && spawningRN == false) {
          for (const obj of k.get("physobject").reverse()) {
            if (obj.isHovering()) {
              jointObj = obj;
              jointObjDiff = k.toWorld(k.mousePos()).sub(obj.pos);
            }
          }
        }

        if (jointObj) {
          let mp = k.toWorld(k.mousePos());
          jointObj.translate(mp.sub(jointObjDiff));
        }

        if (k.isMouseReleased()) {
          jointObj = null;
        }
        break;
      case modes.rotate:
        if (k.isMousePressed() && spawningRN == false) {
          for (const obj of k.get("physobject").reverse()) {
            if (obj.isHovering()) {
              jointObj = obj;
              jointObjDiff = k.toWorld(k.mousePos()).sub(obj.pos);
              initialRotation = jointObj.getRigidBody().rotation();
              initialDiffRotation = jointObj.pos.sub(k.toWorld(k.mousePos()));
            }
          }
          1;
        }

        if (jointObj) {
          k.drawLine({
            p1: jointObj.pos,
            p2: k.toWorld(k.mousePos()),
            color: k.GREEN,
            width: 4,
          });

          let mp = k.toWorld(k.mousePos());
          let rot = k.vec2().angle(jointObj.pos.sub(mp));
          let diff = k.deg2rad(k.vec2().angle(initialDiffRotation));
          console.log(diff);
          jointObj
            .getRigidBody()
            .setRotation(initialRotation + k.deg2rad(rot) - diff);
        }

        if (k.isMouseReleased()) {
          jointObj = null;
        }
        break;
      case modes.null:
        if (k.isMousePressed()) {
          k.debug.log("Press a number key to select a mode.");
        }
        break;
    }
  });
}
