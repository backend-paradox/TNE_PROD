import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent rounded-md", className)}
      style={{ animation: 'pulse-skeleton-loading 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
      {...props}
    />
  );
}

export { Skeleton };
