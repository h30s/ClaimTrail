import { DeadlineLine } from "./deadline-line";
import { LinkCard } from "./link-card";
import { AskList, type QueryAskDto } from "./ask-list";
import { ReplyComposer, type ClaimDocDto } from "./reply-composer";
import { OriginalEmail } from "./original-email";

export type QueryDetailDto = {
  id: string;
  fromAddress: string;
  subject: string;
  body: string;
  receivedAt: Date;
  deadlineAt: Date;
  deadlineSource: "STATED" | "DEFAULT";
  deadlineSnippet: string | null;
  summary: string | null;
  status: "OPEN" | "ANSWERED";
  replyBody: string | null;
  repliedAt: Date | null;
  replyDocumentIds: string[];
  payer: { name: string; kind: string; queryReplyHours: number } | null;
  claim: {
    id: string;
    code: string;
    patient: { name: string };
    documents: ClaimDocDto[];
  } | null;
  suggestedClaim: {
    id: string;
    code: string;
    patient: { name: string };
  } | null;
  asks: QueryAskDto[];
  repliedBy: { name: string } | null;
};

export function QueryDetail({ query, currentUserName }: { query: QueryDetailDto; currentUserName: string }) {
  return (
    <div className="max-w-4xl space-y-4 p-4 lg:p-6">
      <div>
        <h2 className="text-foreground text-lg font-bold tracking-tight">{query.subject}</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          From: <span className="text-foreground font-mono">{query.fromAddress}</span>
          {query.payer && <span> ({query.payer.name})</span>}
        </p>
      </div>

      <DeadlineLine
        deadlineAt={query.deadlineAt}
        deadlineSource={query.deadlineSource}
        deadlineSnippet={query.deadlineSnippet}
        repliedAt={query.repliedAt}
        payerName={query.payer?.name}
        replyHours={query.payer?.queryReplyHours}
      />

      <LinkCard queryId={query.id} claim={query.claim} suggestedClaim={query.suggestedClaim} />

      <AskList summary={query.summary} asks={query.asks} claimCode={query.claim?.code} />

      <ReplyComposer
        queryId={query.id}
        status={query.status}
        replyBody={query.replyBody}
        repliedAt={query.repliedAt}
        repliedByName={query.repliedBy?.name}
        replyDocumentIds={query.replyDocumentIds}
        claim={query.claim}
        asks={query.asks}
        currentUserName={currentUserName}
      />

      <OriginalEmail
        fromAddress={query.fromAddress}
        subject={query.subject}
        body={query.body}
        receivedAt={query.receivedAt}
      />
    </div>
  );
}
