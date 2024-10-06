import { load } from "kaplay-physics-rapier";
await load();

import k from "./kaplay";
import scn_physScene from "./physScene";
k.setGravity(98);

k.layers(["bg", "obj", "ui"], "obj");

k.scene("physScene", scn_physScene);

k.go("physScene");
