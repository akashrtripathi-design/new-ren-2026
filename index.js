const express = require("express");
const { fabric } = require("fabric");
const { createCanvas, Image } = require("canvas");

global.document = {
  createElement: function (tag) {
    if (tag === "canvas") {
      const canvas = createCanvas(800, 600);
      return canvas;
    }
    return {};
  }
};
const { createCanvas, Image } = require("canvas");

global.window = {
  devicePixelRatio: 1,
  Image: Image
};

fabric.document = global.document;
fabric.window = global.window;

const { loadAssets } = require("./assetLoader");
const { hydrateLayers } = require("./hydration");

const app = express();
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("Render Engine Running 🚀");
});

async function renderTemplate(template) {
  const width = template.canvas.width;
  const height = template.canvas.height;

  const canvas = new fabric.StaticCanvas(null, {
    width,
    height,
    backgroundColor: template.canvas.backgroundColor || "#fff"
  });

  const assetMap = await loadAssets(template);
  await hydrateLayers(canvas, template.layers, assetMap);

  const skiaCanvas = canvas.lowerCanvasEl;
  return canvas.lowerCanvasEl.toBuffer("image/png");
}

app.post("/render", async (req, res) => {
  try {
    const buffer = await renderTemplate(req.body);
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
