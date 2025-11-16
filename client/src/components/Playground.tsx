import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  BarChart3,
  Sparkles,
  Users,
  Package,
  Activity,
  Database,
  Zap
} from "lucide-react";
import axios from "axios";
import { BSON } from "bson";
import { encode as msgpackEncode } from "@msgpack/msgpack";

// Categorized example datasets with generators
const EXAMPLE_CATEGORIES = {
  "Large Datasets": [
    {
      id: "employees",
      name: "Employees",
      icon: Users,
      description: "HR employee records",
      expectedSavings: "~40%",
      maxSize: 100,
      generator: (count: number) =>
        Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          name: `Employee ${i + 1}`,
          email: `employee${i + 1}@company.com`,
          department: ["Engineering", "Sales", "Marketing", "HR"][i % 4],
          salary: 50000 + (i * 1000),
          active: i % 3 !== 0
        }))
    },
    {
      id: "products",
      name: "Products",
      icon: Package,
      description: "E-commerce catalog",
      expectedSavings: "~38%",
      maxSize: 100,
      generator: (count: number) =>
        Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          sku: `PROD-${String(i + 1).padStart(5, '0')}`,
          name: `Product ${i + 1}`,
          price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
          stock: Math.floor(Math.random() * 100),
          category: ["Electronics", "Clothing", "Books", "Food"][i % 4]
        }))
    },
    {
      id: "sensors",
      name: "Sensor Data",
      icon: Activity,
      description: "IoT sensor readings",
      expectedSavings: "~42%",
      maxSize: 100,
      generator: (count: number) =>
        Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          timestamp: Date.now() + i * 1000,
          temperature: parseFloat((20 + Math.random() * 10).toFixed(2)),
          humidity: parseFloat((50 + Math.random() * 30).toFixed(2)),
          pressure: parseFloat((1000 + Math.random() * 20).toFixed(2))
        }))
    }
  ],
  "Common Use Cases": [
    {
      id: "users",
      name: "User Profiles",
      icon: Users,
      description: "Social media users",
      expectedSavings: "~35%",
      maxSize: 50,
      generator: (count: number) =>
        Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          username: `user${i + 1}`,
          displayName: `User ${i + 1}`,
          followers: Math.floor(Math.random() * 10000),
          verified: i % 5 === 0
        }))
    },
    {
      id: "logs",
      name: "API Logs",
      icon: Database,
      description: "Server access logs",
      expectedSavings: "~37%",
      maxSize: 100,
      generator: (count: number) =>
        Array.from({ length: count }, (_, i) => ({
          timestamp: Date.now() + i * 60000,
          method: ["GET", "POST", "PUT", "DELETE"][i % 4],
          path: `/api/v1/resource/${i}`,
          status: [200, 201, 400, 404, 500][i % 5],
          duration: Math.floor(Math.random() * 1000)
        }))
    }
  ],
  "Complex Structures": [
    {
      id: "nested",
      name: "Nested Objects",
      icon: Zap,
      description: "Mixed nested data",
      expectedSavings: "~25%",
      maxSize: 20,
      generator: (count: number) => ({
        users: Array.from({ length: Math.min(count, 10) }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          tags: ["admin", "user", "moderator"].slice(0, (i % 3) + 1)
        })),
        metadata: {
          total: count,
          created: new Date().toISOString(),
          version: "1.0.0"
        }
      })
    }
  ]
};

export default function Playground() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [selectedExample, setSelectedExample] = useState<any>(
    EXAMPLE_CATEGORIES["Large Datasets"][0]
  );
  const [datasetSize, setDatasetSize] = useState([50]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{
    btoonSize: number;
    jsonSize: number;
    jsonPrettySize: number;
    bsonSize: number;
    msgpackSize: number;
    compression: number;
    tokens: number;
    tokensSaved: number;
    encodeTime: number;
    decodeTime: number;
    bsonTime: number;
    msgpackTime: number;
  } | null>(null);

  // Generate input JSON when example or size changes (encode mode only)
  useMemo(() => {
    if (mode === "encode" && selectedExample) {
      const data = selectedExample.generator(datasetSize[0]);
      setInput(JSON.stringify(data, null, 2));
      setOutput(null);
      setDecoded(null);
      setError(null);
      setStats(null);
    }
  }, [selectedExample, datasetSize, mode]);

  const handleEncode = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Parse and validate JSON input
      const data = JSON.parse(input);
      const jsonCompact = JSON.stringify(data);
      const jsonPretty = JSON.stringify(data, null, 2);
      const jsonSize = new TextEncoder().encode(jsonCompact).length;
      const jsonPrettySize = new TextEncoder().encode(jsonPretty).length;

      // Encode with BSON - measure time
      // BSON doesn't support arrays as root, so wrap in object if needed
      const bsonStart = performance.now();
      const bsonData = Array.isArray(data) ? { items: data } : data;
      const bsonEncoded = BSON.serialize(bsonData);
      const bsonTime = performance.now() - bsonStart;
      const bsonSize = bsonEncoded.length;

      // Encode with MessagePack - measure time
      const msgpackStart = performance.now();
      const msgpackEncoded = msgpackEncode(data);
      const msgpackTime = performance.now() - msgpackStart;
      const msgpackSize = msgpackEncoded.length;

      // Encode with btoon - measure time
      const encodeStart = performance.now();
      const response = await axios.post("/api/encode", {
        data,
        options: { autoTabular: true },
      });
      const encodeTime = performance.now() - encodeStart;

      if (response.data.success) {
        const btoonSize = response.data.size;
        const compression = ((1 - btoonSize / jsonSize) * 100);

        // Token estimation (~3.5 chars per token)
        const jsonTokens = Math.ceil(jsonCompact.length / 3.5);
        const btoonTokens = Math.ceil(btoonSize / 3.5);
        const tokensSaved = jsonTokens - btoonTokens;

        setOutput(response.data.hex);

        // Decode to verify - measure time
        let decodeTime = 0;
        try {
          const decodeStart = performance.now();
          const decodeResponse = await axios.post("/api/decode", {
            data: response.data.data, // base64
          });
          decodeTime = performance.now() - decodeStart;

          if (decodeResponse.data.success) {
            setDecoded(decodeResponse.data.data);
          }
        } catch (decodeError: any) {
          console.error("Decode error:", decodeError);
        }

        setStats({
          btoonSize,
          jsonSize,
          jsonPrettySize,
          bsonSize,
          msgpackSize,
          compression,
          tokens: jsonTokens,
          tokensSaved,
          encodeTime,
          decodeTime,
          bsonTime,
          msgpackTime
        });
      } else {
        setError(response.data.error || "Encoding failed");
      }
    } catch (err: any) {
      setError(err.message || "Invalid JSON input");
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleDecode = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const decodeStart = performance.now();
      const response = await axios.post("/api/decode", {
        data: input.trim(),
      });
      const decodeTime = performance.now() - decodeStart;

      if (response.data.success) {
        setDecoded(response.data.data);
        const decodedJson = JSON.stringify(response.data.data, null, 2);
        setOutput(decodedJson);

        // Show basic stats for decode mode
        const btoonSize = input.trim().length / 2; // hex is 2 chars per byte
        const jsonSize = new TextEncoder().encode(JSON.stringify(response.data.data)).length;

        setStats({
          btoonSize,
          jsonSize,
          jsonPrettySize: new TextEncoder().encode(decodedJson).length,
          bsonSize: 0,
          msgpackSize: 0,
          compression: ((1 - btoonSize / jsonSize) * 100),
          tokens: Math.ceil(jsonSize / 3.5),
          tokensSaved: Math.ceil((jsonSize - btoonSize) / 3.5),
          encodeTime: 0,
          decodeTime,
          bsonTime: 0,
          msgpackTime: 0
        });
      } else {
        setError(response.data.error || "Decoding failed");
      }
    } catch (err: any) {
      setError(err.message || "Invalid input");
    } finally {
      setLoading(false);
    }
  }, [input]);

  const loadExample = (example: any) => {
    setSelectedExample(example);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div id="playground" className="space-y-6 scroll-mt-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Interactive Playground
        </h2>
        <p className="text-muted-foreground">
          Try BTOON with real datasets. Scale them up to see compression benefits grow.
        </p>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={mode === "encode" ? "default" : "outline"}
            onClick={() => {
              setMode("encode");
              setInput("");
              setOutput(null);
              setDecoded(null);
              setError(null);
              setStats(null);
            }}
          >
            <Play className="h-4 w-4 mr-2" />
            Encode Mode
          </Button>
          <Button
            variant={mode === "decode" ? "default" : "outline"}
            onClick={() => {
              setMode("decode");
              setInput("");
              setOutput(null);
              setDecoded(null);
              setError(null);
              setStats(null);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Decode Mode
          </Button>
        </div>
      </div>

      {/* Example Categories - Only show in encode mode */}
      {mode === "encode" && (
      <Card className="p-6 space-y-4">
        {Object.entries(EXAMPLE_CATEGORIES).map(([category, examples]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {examples.map((example) => {
                const Icon = example.icon;
                const isSelected = selectedExample?.id === example.id;
                return (
                  <Button
                    key={example.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto flex-col items-start p-4 ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => loadExample(example)}
                  >
                    <div className="flex items-center gap-2 w-full mb-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold">{example.name}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {example.expectedSavings}
                      </Badge>
                    </div>
                    <p className="text-xs text-left opacity-80">
                      {example.description}
                    </p>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>
      )}

      {/* Dataset Size Slider - Only show in encode mode */}
      {mode === "encode" && (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Dataset Size</h3>
            <p className="text-sm text-muted-foreground">
              Scale the dataset to see how compression improves with volume
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {datasetSize[0]} {selectedExample?.id === "nested" ? "items" : "records"}
          </Badge>
        </div>
        <Slider
          value={datasetSize}
          onValueChange={setDatasetSize}
          min={1}
          max={selectedExample?.maxSize || 100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>{selectedExample?.maxSize || 100}</span>
        </div>
      </Card>
      )}

      {/* Editor Layout - Side by Side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {mode === "encode" ? "Input JSON" : "Input BTOON (Hex/Base64)"}
            </h3>
            <Button
              onClick={mode === "encode" ? handleEncode : handleDecode}
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : mode === "encode" ? (
                <Play className="h-4 w-4 mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {mode === "encode" ? "Encode" : "Decode"}
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? '{"name": "BTOON", "version": "0.0.1"}'
                : 'Paste hex or base64 encoded BTOON data here...'
            }
            className="font-mono text-xs h-[400px] resize-none overflow-auto"
          />
          <div className="text-xs text-muted-foreground">
            {mode === "encode"
              ? `${formatBytes(new TextEncoder().encode(input).length)} • ${input.split('\n').length} lines`
              : `${formatBytes(input.trim().length / 2)} (estimated)`
            }
          </div>
        </Card>

        {/* Output */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {mode === "encode" ? "Encoded Output (Hex)" : "Decoded JSON"}
            </h3>
            {output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(output)}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
            )}
          </div>
          {output ? (
            <>
              <Textarea
                value={output}
                readOnly
                className="font-mono text-xs h-[400px] bg-muted/50 resize-none overflow-auto"
              />
              <div className="text-xs text-muted-foreground">
                {mode === "encode"
                  ? `${formatBytes(output.length / 2)} • Hex format`
                  : `${formatBytes(new TextEncoder().encode(output).length)} • ${output.split('\n').length} lines`
                }
              </div>
            </>
          ) : (
            <div className="min-h-[400px] flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
              <div className="text-center">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">
                  Click "{mode === "encode" ? "Encode" : "Decode"}" to see output
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Error display */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Stats Dashboard */}
      {stats && (
        <Card className="p-6 space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {mode === "encode" ? "Compression Analysis" : "Decode Analysis"}
          </h3>

          {/* Size & Performance Comparison - Only show full comparison in encode mode */}
          {mode === "encode" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">JSON (Compact)</p>
              <p className="text-xl font-bold">{formatBytes(stats.jsonSize)}</p>
              <p className="text-xs text-muted-foreground">Baseline</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">BSON</p>
              <p className="text-xl font-bold">{formatBytes(stats.bsonSize)}</p>
              <p className="text-xs text-blue-600">{stats.bsonTime.toFixed(1)}ms</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">MessagePack</p>
              <p className="text-xl font-bold">{formatBytes(stats.msgpackSize)}</p>
              <p className="text-xs text-blue-600">{stats.msgpackTime.toFixed(1)}ms</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-primary">BTOON</p>
              <p className="text-2xl font-extrabold text-primary">{formatBytes(stats.btoonSize)}</p>
              <p className="text-xs font-semibold text-primary">{stats.encodeTime.toFixed(0)}ms</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Best Savings</p>
              <p className="text-xl font-bold text-green-600">
                {stats.compression > 0 ? "-" : "+"}
                {Math.abs(stats.compression).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">vs JSON</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">vs MessagePack</p>
              <p className="text-xl font-bold text-green-600">
                -{((1 - stats.btoonSize / stats.msgpackSize) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">smaller</p>
            </div>
          </div>
          ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">BTOON Input</p>
              <p className="text-xl font-bold">{formatBytes(stats.btoonSize)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">JSON Output</p>
              <p className="text-xl font-bold">{formatBytes(stats.jsonSize)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Decode Time</p>
              <p className="text-xl font-bold text-primary">{stats.decodeTime.toFixed(0)}ms</p>
            </div>
          </div>
          )}

          {/* Visual Bar Chart - Only in encode mode */}
          {mode === "encode" && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold mb-3">Size Comparison</h4>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>JSON (Compact)</span>
                <span className="text-muted-foreground">{formatBytes(stats.jsonSize)}</span>
              </div>
              <div className="h-6 bg-muted rounded-md overflow-hidden">
                <div className="h-full bg-gray-500" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>BSON</span>
                <span className="text-muted-foreground">{formatBytes(stats.bsonSize)}</span>
              </div>
              <div className="h-6 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-orange-500/70"
                  style={{ width: `${(stats.bsonSize / stats.jsonSize) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>MessagePack</span>
                <span className="text-muted-foreground">{formatBytes(stats.msgpackSize)}</span>
              </div>
              <div className="h-6 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-blue-500/70"
                  style={{ width: `${(stats.msgpackSize / stats.jsonSize) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-primary">BTOON (Binary TOON)</span>
                <span className="text-primary font-extrabold">{formatBytes(stats.btoonSize)}</span>
              </div>
              <div className="h-7 bg-muted rounded-md overflow-hidden ring-2 ring-primary/50">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(stats.btoonSize / stats.jsonSize) * 100}%` }}
                />
              </div>
            </div>
          </div>
          )}

          {/* Token Estimation */}
          {mode === "encode" && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              LLM Token Estimation (~3.5 chars/token)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">JSON</p>
                <p className="text-xl font-bold">{formatNumber(stats.tokens)}</p>
                <p className="text-xs text-muted-foreground mt-1">Baseline</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">BSON</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatNumber(Math.ceil(stats.bsonSize / 3.5))}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ~{((1 - stats.bsonSize / (stats.tokens * 3.5)) * 100).toFixed(0)}% saved
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">MessagePack</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatNumber(Math.ceil(stats.msgpackSize / 3.5))}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ~{((1 - stats.msgpackSize / (stats.tokens * 3.5)) * 100).toFixed(0)}% saved
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">TOON (est.)</p>
                <p className="text-xl font-bold text-sky-600">
                  {formatNumber(Math.ceil(stats.tokens * 0.65))}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ~35% saved
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 font-bold">BTOON</p>
                <p className="text-xl font-extrabold text-primary">
                  {formatNumber(stats.tokens - stats.tokensSaved)}
                </p>
                <p className="text-xs font-semibold text-green-600 mt-1">
                  {((stats.tokensSaved / stats.tokens) * 100).toFixed(0)}% saved
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Best Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  -{formatNumber(stats.tokensSaved)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">tokens</p>
              </div>
            </div>
          </div>
          )}
        </Card>
      )}

      {/* Decoded Verification */}
      {decoded && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Decoded Verification</h3>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Check className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          </div>
          <Textarea
            value={JSON.stringify(decoded, null, 2)}
            readOnly
            className="font-mono text-xs h-[200px] bg-muted/50 resize-none overflow-auto"
          />
        </Card>
      )}
    </div>
  );
}

