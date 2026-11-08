import type { Metadata } from "next";
import { PayerTable } from "@/features/catalog/components/payer-table";
import { listPayers } from "@/features/catalog/server/queries";

export const metadata: Metadata = {
  title: "Payers",
};

export default async function PayersPage() {
  const payers = await listPayers();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-foreground text-base font-semibold">Payers &amp; TPAs</h2>
        <p className="text-muted-foreground text-xs">
          Manage empanelled TPAs and insurance companies, their email domains, and default query SLA windows.
        </p>
      </div>

      <PayerTable payers={payers} />
    </div>
  );
}
