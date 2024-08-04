import { Button } from "@repo/ui/components/Button";

// CtaSection: A functional component that displays a call to action
export function CtaSection() {
  return (
    <div className="flex flex-col gap-4 text-center bg-muted px-8 md:px-48 py-24">
      <div className="flex flex-col gap-8 text-center px-8">
        <h2 className="text-foreground text-4xl font-semibold">A single solution for you to build on</h2>
        <p className="text-muted-foreground text-xl font-normal">
          Join Startups and Enterprises already building on TypeScriptPlatform
        </p>
        <div className="flex flex-col md:gap-8 items-center">
          <Button variant="secondary">Get started today - it&apos;s free</Button>
        </div>
      </div>
    </div>
  );
}
