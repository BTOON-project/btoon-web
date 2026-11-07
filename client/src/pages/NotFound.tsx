import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <Card className="w-full max-w-lg">
        <CardContent className="py-8 text-center">
          <AlertCircle className="mx-auto mb-6 h-14 w-14 text-destructive" />
          <h1 className="mb-2 text-4xl font-bold">404</h1>
          <p className="mb-8 text-muted-foreground">This page doesn't exist.</p>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
