import { load } from "kaplay-physics-rapier";
import k from "./kaplay";
import scn_physScene from "./physScene";

async function start() {
  await load();
  k.setGravity(98);

  k.layers(["bg", "obj", "ui"], "obj");

  k.scene("physScene", scn_physScene);

  k.go("physScene");
}

start();
