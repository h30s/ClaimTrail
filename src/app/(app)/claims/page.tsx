import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export default function ClaimsPage() {
  return (
    <div>
      <PageHeader
        title="Claims"
        description="Active cashless admissions, required documents, and pending queries"
      />
      <EmptyState
        title="No claims to display yet"
        description="Seed data and claims worklist management arrive in the next phase."
      />
    </div>
  );
}
