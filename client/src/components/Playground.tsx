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
    compression: number;
    tokens: number;
    tokensSaved: number;
    encodeTime: number;
    decodeTime: number;
  } | null>(null);

  // Generate input JSON when example or size changes
  useMemo(() => {
    if (selectedExample) {
      const data = selectedExample.generator(datasetSize[0]);
      setInput(JSON.stringify(data, null, 2));
      setOutput(null);
      setDecoded(null);
      setError(null);
      setStats(null);
    }
  }, [selectedExample, datasetSize]);

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
          compression,
          tokens: jsonTokens,
          tokensSaved,
          encodeTime,
          decodeTime
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
      const response = await axios.post("/api/decode", {
        data: input.trim(),
      });
      
      if (response.data.success) {
        setDecoded(response.data.data);
        setOutput(JSON.stringify(response.data.data, null, 2));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Interactive Playground
        </h2>
        <p className="text-muted-foreground">
          Try BTOON with real datasets. Scale them up to see compression benefits grow.
        </p>
      </div>

      {/* Example Categories */}
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

      {/* Dataset Size Slider */}
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

      {/* Editor Layout - Side by Side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Input JSON</h3>
            <Button
              onClick={handleEncode}
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Encode
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name": "BTOON", "version": "0.0.1"}'
            className="font-mono text-xs h-[400px] resize-none overflow-auto"
          />
          <div className="text-xs text-muted-foreground">
            {formatBytes(new TextEncoder().encode(input).length)} • {input.split('\n').length} lines
          </div>
        </Card>

        {/* Output */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Encoded Output</h3>
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
                {formatBytes(output.length / 2)} • Hex format
              </div>
            </>
          ) : (
            <div className="min-h-[400px] flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
              <div className="text-center">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Click "Encode" to see output</p>
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
            Compression Analysis
          </h3>

          {/* Size & Performance Comparison */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">JSON (Pretty)</p>
              <p className="text-2xl font-bold">{formatBytes(stats.jsonPrettySize)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">JSON (Compact)</p>
              <p className="text-2xl font-bold">{formatBytes(stats.jsonSize)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">BTOON</p>
              <p className="text-2xl font-bold text-primary">{formatBytes(stats.btoonSize)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.compression > 0 ? "-" : "+"}
                {Math.abs(stats.compression).toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Encode Time</p>
              <p className="text-2xl font-bold">{stats.encodeTime.toFixed(0)}ms</p>
              {stats.decodeTime > 0 && (
                <p className="text-xs text-muted-foreground">Decode: {stats.decodeTime.toFixed(0)}ms</p>
              )}
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>JSON (Pretty)</span>
                <span className="text-muted-foreground">{formatBytes(stats.jsonPrettySize)}</span>
              </div>
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-blue-500/50"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>JSON (Compact)</span>
                <span className="text-muted-foreground">{formatBytes(stats.jsonSize)}</span>
              </div>
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-blue-500/70"
                  style={{ width: `${(stats.jsonSize / stats.jsonPrettySize) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-primary">BTOON</span>
                <span className="text-primary">{formatBytes(stats.btoonSize)}</span>
              </div>
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(stats.btoonSize / stats.jsonPrettySize) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Token Estimation */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              LLM Token Estimation
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">JSON Tokens</p>
                <p className="text-xl font-bold">{formatNumber(stats.tokens)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">BTOON Tokens</p>
                <p className="text-xl font-bold text-primary">
                  {formatNumber(stats.tokens - stats.tokensSaved)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Tokens Saved</p>
                <p className="text-xl font-bold text-green-600">
                  -{formatNumber(stats.tokensSaved)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              * Estimated using ~3.5 characters per token
            </p>
          </div>
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

