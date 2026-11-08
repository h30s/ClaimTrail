import type { Metadata } from "next";
import { DocumentTypeTable } from "@/features/catalog/components/document-type-table";
import { listDocumentTypes } from "@/features/catalog/server/queries";

export const metadata: Metadata = {
  title: "Document Types",
};

export default async function DocumentTypesPage() {
  const docTypes = await listDocumentTypes();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-foreground text-base font-semibold">Document Types</h2>
        <p className="text-muted-foreground text-xs">
          Types recognized by the cashless desk. The description serves as the semantic hint used by Gemini.
        </p>
      </div>

      <DocumentTypeTable docTypes={docTypes} />
    </div>
  );
}
