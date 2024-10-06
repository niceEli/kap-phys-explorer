import kaplay from "kaplay";
import rapierPlugin from "kaplay-physics-rapier";

const k = kaplay({
  width: 1280,
  height: 720,
  letterbox: true,
  background: [0, 0, 0],
  plugins: [rapierPlugin()],
});

export default k;
