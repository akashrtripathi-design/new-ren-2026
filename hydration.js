const { fabric } = require("fabric");

async function hydrateLayers(canvas, layers) {
  for (const layer of layers) {
    let obj;

    switch (layer.type) {
      case "text":
        obj = new fabric.Text(layer.text || "", layer);
        break;
      case "rect":
        obj = new fabric.Rect(layer);
        break;
      case "circle":
        obj = new fabric.Circle(layer);
        break;
      default:
        continue;
    }

    canvas.add(obj);
  }
}

module.exports = { hydrateLayers };