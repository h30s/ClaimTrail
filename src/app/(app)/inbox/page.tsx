import { Inbox } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="bg-muted/50 mb-3 rounded-full p-3">
        <Inbox className="text-muted-foreground size-6" />
      </div>
      <h3 className="text-foreground text-sm font-semibold">No query selected</h3>
      <p className="text-muted-foreground mt-1 max-w-xs text-xs">
        Select a query email from the list to view requirements, live countdown, and compose a reply.
      </p>
    </div>
  );
}
