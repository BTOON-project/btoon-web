import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load btoon from npm, fallback to null if not available
let btoon: any = null;
try {
  btoon = await import("btoon");
  console.log("✓ Using btoon from npm package");
} catch (err) {
  console.warn("⚠ btoon npm package not available, API endpoints will not work");
  console.warn("  Fix: Republish btoon npm package with all required files");
}

async function startServer() {
  const app = express();

  app.disable("x-powered-by");

  // Parse JSON bodies
  app.use(express.json({ limit: "10mb" }));

  // API endpoints for btoon operations
  app.post("/api/encode", async (req, res) => {
    if (!btoon) {
      return res.status(503).json({
        success: false,
        error: "btoon package not available - please republish npm package with all required files",
      });
    }

    try {
      const { data, options } = req.body;
      const encoded = btoon.encode(data, options || { autoTabular: true });

      // Convert Buffer to base64 for JSON response
      const base64 = encoded.toString("base64");
      const size = encoded.length;

      res.json({
        success: true,
        data: base64,
        size,
        hex: encoded.toString("hex"),
      });
    } catch (error: any) {
      console.error("Encode error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Encoding failed",
      });
    }
  });

  app.post("/api/decode", async (req, res) => {
    if (!btoon) {
      return res.status(503).json({
        success: false,
        error: "btoon package not available - please republish npm package with all required files",
      });
    }

    try {
      const { data, options } = req.body;

      // Convert base64 or hex string to Buffer
      let buffer: Buffer;
      if (typeof data === "string") {
        if (data.startsWith("0x") || /^[0-9a-fA-F]+$/.test(data)) {
          // Hex string
          buffer = Buffer.from(data.replace(/^0x/, ""), "hex");
        } else {
          // Base64 string
          buffer = Buffer.from(data, "base64");
        }
      } else {
        buffer = Buffer.from(data);
      }

      const decoded = btoon.decode(buffer, options || {});

      res.json({
        success: true,
        data: decoded,
      });
    } catch (error: any) {
      console.error("Decode error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Decoding failed",
      });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    if (!btoon) {
      console.warn("\n⚠  WARNING: API endpoints are disabled");
      console.warn("   To fix: Republish btoon npm package with these files:");
      console.warn("   - binding.gyp, btoon_node.cpp, find_btoon_*.js, core/");
      console.warn("   Then run: npm install btoon\n");
    }
  });
}

startServer().catch(console.error);
