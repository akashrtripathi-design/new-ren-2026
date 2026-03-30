const express = require("express");
const { fabric } = require("fabric");
const { createCanvas, Image } = require("canvas");

// ------------------
// FIX: Fake DOM for Fabric
// ------------------
global.document = {
  createElement: function (tag) {
    if (tag === "canvas") {
      const canvas = createCanvas(800, 600);

      // 🔥 Fabric compatibility fixes
      canvas.style = {};
      canvas.classList = { add: () => {}, remove: () => {} };

      canvas.getAttribute = () => null;
      canvas.setAttribute = () => {};
      canvas.removeAttribute = () => {};

      return canvas;
    }
    return { style: {} };
  }
};

global.window = {
  devicePixelRatio: 1,
  Image: Image,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  document: global.document
};

fabric.document = global.document;
fabric.window = global.window;

// ------------------
// EXPRESS
// ------------------
const app = express();
app.use(express.json({ limit: "20mb" }));

// ✅ CORS FIX
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
// RENDER API
// ------------------
app.post("/render", async (req, res) => {
  try {
    const canvas = new fabric.StaticCanvas(null, {
      width: 800,
      height: 500,
      backgroundColor: "#ffffff"
    });

    // 🔥 FORCE TEXT (for testing)
    const text = new fabric.Text("Hello Akash 🚀", {
      left: 100,
      top: 200,
      fontSize: 40,
      fill: "#000"
    });

    canvas.add(text);

    // 🔥 IMPORTANT
    canvas.renderAll();

    const buffer = canvas.lowerCanvasEl.toBuffer("image/png");

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
