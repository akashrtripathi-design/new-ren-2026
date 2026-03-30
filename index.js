const express = require("express");
const { fabric } = require("fabric");
const { createCanvas, Image } = require("canvas");

// ------------------
// FIX: Fabric Node setup
// ------------------
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

// ------------------
// EXPRESS SETUP
// ------------------
const app = express();
app.use(express.json({ limit: "20mb" }));

// 🔥 CORS FIX (IMPORTANT)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// ------------------
// TEST ROUTE
// ------------------
app.get("/", (req, res) => {
  res.send("Render Engine Running 🚀");
});

// ------------------
// RENDER FUNCTION
// ------------------
async function renderTemplate(template) {
  const width = template.canvas?.width || 800;
  const height = template.canvas?.height || 500;

  const canvas = new fabric.StaticCanvas(null, {
    width,
    height,
    backgroundColor: template.canvas?.backgroundColor || "#ffffff"
  });

  // 🔥 DEBUG TEXT (always show)
  const text = new fabric.Text("Hello Akash 🚀", {
    left: 100,
    top: 200,
    fontSize: 40,
    fill: "#000"
  });

  canvas.add(text);

  return canvas.lowerCanvasEl.toBuffer("image/png");
}

// ------------------
// API ROUTE
// ------------------
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

// ------------------
// SERVER START
// ------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
