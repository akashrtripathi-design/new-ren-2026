const express = require("express");
const cors = require("cors");
const { fabric } = require("fabric");
const { createCanvas, Image } = require("canvas");

// 🔥 Fix Fabric for Node environment
global.document = {
  createElement: function (tag) {
    if (tag === "canvas") {
      return createCanvas(800, 600);
    }
    return {};
  }
};

global.window = {
  devicePixelRatio: 1,
  Image: Image,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};

fabric.document = global.document;
fabric.window = global.window;

// 🔥 Import helpers
const { loadAssets } = require("./assetLoader");
const { hydrateLayers } = require("./hydration");

// 🔥 Express setup
const app = express();

app.use(cors()); // ✅ CORS FIX
app.use(express.json({ limit: "20mb" }));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Render Engine Running 🚀");
});

// 🔥 Render function
async function renderTemplate(template) {
  const width = template.canvas.width;
  const height = template.canvas.height;

  const canvas = new fabric.StaticCanvas(null, {
    width,
    height,
    backgroundColor: template.canvas.backgroundColor || "#ffffff"
  });

  // 🔥 DEBUG: force text add
  const text = new fabric.Text("Hello Akash 🚀", {
    left: 100,
    top: 200,
    fontSize: 40,
    fill: "#000"
  });

  canvas.add(text);

  return canvas.lowerCanvasEl.toBuffer("image/png");
} {
  const width = template.canvas.width;
  const height = template.canvas.height;

  const canvas = new fabric.StaticCanvas(null, {
    width,
    height,
    backgroundColor: template.canvas.backgroundColor || "#ffffff"
  });

  const assetMap = await loadAssets(template);
  await hydrateLayers(canvas, template.layers, assetMap);

  return canvas.lowerCanvasEl.toBuffer("image/png");
}

// ✅ API route
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

// 🔥 Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
