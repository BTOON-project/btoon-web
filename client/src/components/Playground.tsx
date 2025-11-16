import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Copy, Check, Loader2, RefreshCw } from "lucide-react";
import axios from "axios";

const EXAMPLE_DATA = {
  basic: {
    name: "BTOON",
    version: "0.0.1",
    features: ["fast", "compact", "typed"],
    metrics: {
      speed: 9000,
      size: 0.5,
    },
  },
  tabular: [
    { id: 1, name: "Alice", age: 30, score: 95 },
    { id: 2, name: "Bob", age: 25, score: 87 },
    { id: 3, name: "Charlie", age: 35, score: 92 },
  ],
  nested: {
    users: [
      { id: 1, name: "Alice", tags: ["admin", "user"] },
      { id: 2, name: "Bob", tags: ["user"] },
    ],
    metadata: {
      total: 2,
      created: "2024-01-01",
    },
  },
};

export default function Playground() {
  const [input, setInput] = useState(JSON.stringify(EXAMPLE_DATA.basic, null, 2));
  const [output, setOutput] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{
    btoonSize: number;
    jsonSize: number;
    compression: number;
  } | null>(null);

  const handleEncode = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Parse and validate JSON input
      const data = JSON.parse(input);
      const jsonSize = new TextEncoder().encode(JSON.stringify(data)).length;
      
      // Encode with btoon
      const response = await axios.post("/api/encode", {
        data,
        options: { autoTabular: true },
      });
      
      if (response.data.success) {
        setOutput(response.data.hex);
        setStats({
          btoonSize: response.data.size,
          jsonSize,
          compression: ((1 - response.data.size / jsonSize) * 100),
        });
        
        // Decode to verify
        try {
          const decodeResponse = await axios.post("/api/decode", {
            data: response.data.data, // base64
          });
          if (decodeResponse.data.success) {
            setDecoded(decodeResponse.data.data);
          }
        } catch (decodeError: any) {
          console.error("Decode error:", decodeError);
        }
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

  const loadExample = (key: keyof typeof EXAMPLE_DATA) => {
    setInput(JSON.stringify(EXAMPLE_DATA[key], null, 2));
    setOutput(null);
    setDecoded(null);
    setError(null);
    setStats(null);
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

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Live Playground</h3>
        <p className="text-muted-foreground text-sm">
          Try encoding and decoding data with BTOON. See the size comparison with JSON.
        </p>
      </div>

      {/* Example buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadExample("basic")}
        >
          Basic Example
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadExample("tabular")}
        >
          Tabular Data
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadExample("nested")}
        >
          Nested Objects
        </Button>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Input JSON</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEncode}
            disabled={loading}
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
          className="font-mono text-sm min-h-[200px]"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-md">
          <div>
            <p className="text-xs text-muted-foreground mb-1">JSON Size</p>
            <p className="text-lg font-semibold">{formatBytes(stats.jsonSize)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">BTOON Size</p>
            <p className="text-lg font-semibold">{formatBytes(stats.btoonSize)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Compression</p>
            <p className="text-lg font-semibold">
              {stats.compression > 0 ? "-" : "+"}
              {Math.abs(stats.compression).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Output tabs */}
      {output && (
        <Tabs defaultValue="hex" className="space-y-4">
          <TabsList>
            <TabsTrigger value="hex">Hex Output</TabsTrigger>
            <TabsTrigger value="decoded">Decoded</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hex" className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Encoded (Hex)</label>
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
            </div>
            <Textarea
              value={output}
              readOnly
              className="font-mono text-xs min-h-[150px] bg-muted/50 break-all"
            />
          </TabsContent>
          
          <TabsContent value="decoded" className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Decoded Result</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(decoded, null, 2))}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
            </div>
            <Textarea
              value={JSON.stringify(decoded, null, 2)}
              readOnly
              className="font-mono text-sm min-h-[200px] bg-muted/50 break-all"
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Decode section */}
      {!output && (
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Or decode hex/base64</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecode}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Decode
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste hex or base64 encoded BTOON data to decode
          </p>
        </div>
      )}
    </Card>
  );
}

