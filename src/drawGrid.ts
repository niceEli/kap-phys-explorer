import k from "./kaplay";

export default function drawGrid() {
  const canvasWidth = k.width();
  const canvasHeight = k.height();
  const baseGridSpacing = 10;
  const baseThickLineSpacing = 100;
  const baseThinLineWidth = 1;
  const baseThickLineWidth = 4;
  const thinLineColor = k.rgb(25, 25, 25);
  const thickLineColor = k.rgb(50, 50, 50);

  const camPos = k.camPos();
  const camScale = k.camScale();
  const scaledWidth = canvasWidth / camScale.x;
  const scaledHeight = canvasHeight / camScale.y;

  let gridSpacing = baseGridSpacing;
  let thickLineSpacing = baseThickLineSpacing;
  let thinLineWidth = baseThinLineWidth;
  let thickLineWidth = baseThickLineWidth;

  if (camScale.x <= 0.5) {
    gridSpacing *= 10;
    thickLineSpacing *= 10;
    thinLineWidth *= 10;
    thickLineWidth *= 10;
  } else if (camScale.x >= 2) {
    gridSpacing /= 10;
    thickLineSpacing /= 10;
    thinLineWidth /= 10;
    thickLineWidth /= 10;
  }

  const startX =
    Math.floor((camPos.x - scaledWidth / 2) / gridSpacing) * gridSpacing;
  const endX =
    Math.ceil((camPos.x + scaledWidth / 2) / gridSpacing) * gridSpacing;
  const startY =
    Math.floor((camPos.y - scaledHeight / 2) / gridSpacing) * gridSpacing;
  const endY =
    Math.ceil((camPos.y + scaledHeight / 2) / gridSpacing) * gridSpacing;

  for (let x = startX; x <= endX; x += gridSpacing) {
    const lineWidth =
      x % thickLineSpacing === 0 ? thickLineWidth : thinLineWidth;
    const lineColor =
      x % thickLineSpacing === 0 ? thickLineColor : thinLineColor;
    k.drawLine({
      p1: k.vec2(x, startY),
      p2: k.vec2(x, endY),
      width: lineWidth,
      color: lineColor,
    });
  }

  for (let y = startY; y <= endY; y += gridSpacing) {
    const lineWidth =
      y % thickLineSpacing === 0 ? thickLineWidth : thinLineWidth;
    const lineColor =
      y % thickLineSpacing === 0 ? thickLineColor : thinLineColor;
    k.drawLine({
      p1: k.vec2(startX, y),
      p2: k.vec2(endX, y),
      width: lineWidth,
      color: lineColor,
    });
  }

  // Draw x-axis
  k.drawLine({
    p1: k.vec2(startX, 0),
    p2: k.vec2(endX, 0),
    width: 4 / camScale.x,
    color: k.rgb(255, 0, 0),
  });

  // Draw y-axis
  k.drawLine({
    p1: k.vec2(0, startY),
    p2: k.vec2(0, endY),
    width: 4 / camScale.y,
    color: k.rgb(0, 0, 255),
  });
}
