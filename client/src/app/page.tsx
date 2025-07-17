import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Sweet Shop Management
          </CardTitle>
          <CardDescription>
            Built with Bun + Next.js + Tailwind + TypeScript + shadcn/ui 🎉
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button className="w-full">Get Started</Button>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
            <Button variant="secondary" className="w-full">
              View Components
            </Button>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            ✨ shadcn/ui successfully integrated!
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
