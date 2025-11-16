import express from "express";
import { spawn } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { randomBytes } from "crypto";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Path to btoon CLI
const BTOON_CLI = "/Users/alvar/Projects/BTOON/btoon-core/build/btoon";

function runBtoonCLI(command, input) {
  return new Promise((resolve, reject) => {
    const tempId = randomBytes(8).toString("hex");
    const inputFile = join(tmpdir(), `btoon-input-${tempId}.json`);
    const outputFile = join(tmpdir(), `btoon-output-${tempId}.btoon`);

    try {
      // Write input JSON to temp file
      writeFileSync(inputFile, typeof input === "string" ? input : JSON.stringify(input));

      // Run btoon CLI
      const proc = spawn(BTOON_CLI, [command, inputFile, outputFile]);

      let stderr = "";
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        try {
          if (code !== 0) {
            reject(new Error(stderr || `btoon CLI exited with code ${code}`));
            return;
          }

          // Read output file
          const output = readFileSync(outputFile);

          // Clean up
          unlinkSync(inputFile);
          unlinkSync(outputFile);

          resolve(output);
        } catch (err) {
          reject(err);
        }
      });

      proc.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

app.post("/api/encode", async (req, res) => {
  try {
    const { data, options } = req.body;

    // Run btoon CLI to encode
    const encoded = await runBtoonCLI("encode", data);

    res.json({
      success: true,
      data: encoded.toString("base64"),
      size: encoded.length,
      hex: encoded.toString("hex"),
    });
  } catch (error) {
    console.error("Encode error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Encoding failed",
    });
  }
});

app.post("/api/decode", async (req, res) => {
  try {
    const { data, options } = req.body;

    // Convert base64/hex to Buffer and save to temp file
    let buffer;
    if (typeof data === "string") {
      if (data.startsWith("0x") || /^[0-9a-fA-F]+$/.test(data)) {
        buffer = Buffer.from(data.replace(/^0x/, ""), "hex");
      } else {
        buffer = Buffer.from(data, "base64");
      }
    } else {
      buffer = Buffer.from(data);
    }

    const tempId = randomBytes(8).toString("hex");
    const inputFile = join(tmpdir(), `btoon-decode-input-${tempId}.btoon`);
    const outputFile = join(tmpdir(), `btoon-decode-output-${tempId}.json`);

    writeFileSync(inputFile, buffer);

    // Run btoon CLI to decode
    const proc = spawn(BTOON_CLI, ["decode", inputFile, outputFile]);

    let stderr = "";
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    proc.on("close", (code) => {
      try {
        if (code !== 0) {
          res.status(400).json({
            success: false,
            error: stderr || `btoon CLI exited with code ${code}`,
          });
          return;
        }

        const decoded = JSON.parse(readFileSync(outputFile, "utf8"));

        unlinkSync(inputFile);
        unlinkSync(outputFile);

        res.json({
          success: true,
          data: decoded,
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    });

    proc.on("error", (err) => {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    });
  } catch (error) {
    console.error("Decode error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Decoding failed",
    });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`BTOON API server running on http://localhost:${port}/`);
});
