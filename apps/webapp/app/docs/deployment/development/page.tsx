import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Development Setup | Vexa API Documentation",
  description: "Local development setup with hot reload for contributors and developers. Perfect for contributing to Vexa or building custom integrations.",
};

export default function DevelopmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Development Setup</h1>
          <Badge variant="secondary">Contributors</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          Local development setup with hot reload for contributors and developers. Perfect for contributing to Vexa or building custom integrations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why Development Setup?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Development setup provides:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Hot reload</strong> for all services - see changes instantly</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Full debugging capabilities</strong> - set breakpoints, inspect state</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Access to all source code</strong> - modify and test changes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Test integrations</strong> - build and test custom features</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Python 3.10+ (for backend services)</li>
            <li>Node.js 18+ (for bot services and frontend)</li>
            <li>Docker and Docker Compose (for database and Redis)</li>
            <li>PostgreSQL (can use Docker Compose)</li>
            <li>Git (for cloning the repository)</li>
            <li>Optional: NVIDIA GPU with CUDA (for GPU transcription testing)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Set up your development environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 1: Clone the repository</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`git clone https://github.com/Vexa-ai/vexa.git
cd vexa`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 2: Set up Python environment</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 3: Set up environment variables</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`cp env-example.cpu .env
# Edit .env with your local configuration`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 4: Start database and Redis</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`docker-compose up -d postgres redis`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 5: Run database migrations</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`alembic upgrade head`}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Step 6: Start services in development mode</h3>
            <div className="rounded-lg bg-muted p-4">
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
{`# Terminal 1: API Gateway
cd services/api-gateway
python main.py

# Terminal 2: Bot Manager
cd services/bot-manager
python main.py

# Terminal 3: Transcription Service
cd services/transcription-service
python main.py

# ... and so on for other services`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Hot Reload</h3>
              <p className="text-sm text-muted-foreground">
                Most services support hot reload when run directly. Use <code className="bg-muted px-1 rounded">python main.py</code> 
                instead of Docker to enable automatic reloading on file changes.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Debugging</h3>
              <p className="text-sm text-muted-foreground">
                Use your IDE's debugger to set breakpoints. Most Python services can be debugged directly 
                when run with <code className="bg-muted px-1 rounded">python main.py</code>.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Testing</h3>
              <p className="text-sm text-muted-foreground">
                Run tests with <code className="bg-muted px-1 rounded">pytest</code>. Check the 
                <code className="bg-muted px-1 rounded">testing/</code> directory for test examples.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Code Style</h3>
              <p className="text-sm text-muted-foreground">
                Follow the existing code style. Use <code className="bg-muted px-1 rounded">black</code> 
                for formatting and <code className="bg-muted px-1 rounded">flake8</code> for linting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contributing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We welcome contributions! Here's how to get started:
          </p>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Join our <Link href="https://discord.gg/Ga9duGkVz9" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Discord</Link> to discuss ideas</li>
            <li>Browse available tasks and issues on GitHub</li>
            <li>Fork the repository and create a feature branch</li>
            <li>Make your changes and test thoroughly</li>
            <li>Submit a pull request with a clear description</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="https://github.com/Vexa-ai/vexa/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
                View Contributing Guide
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="https://discord.gg/Ga9duGkVz9" target="_blank" rel="noopener noreferrer">
                Join Discord Community
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/deployment/compose">
                Docker Compose Deployment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





