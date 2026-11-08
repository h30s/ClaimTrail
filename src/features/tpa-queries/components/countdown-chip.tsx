"use client";

import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "cn";
import { formatDuration } from "@/lib/format";
import { getCountdown, type Countdown } from "../domain/countdown";

export function CountdownChip({
  deadlineAt,
  repliedAt,
  className,
}: {
  deadlineAt: Date | string;
  repliedAt?: Date | string | null;
  className?: string;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (repliedAt) return;
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => clearInterval(timer);
  }, [repliedAt]);

  const targetDate = typeof deadlineAt === "string" ? new Date(deadlineAt) : deadlineAt;
  const replyDate = repliedAt ? (typeof repliedAt === "string" ? new Date(repliedAt) : repliedAt) : null;

  const countdown = getCountdown({
    now,
    dueAt: targetDate,
    repliedAt: replyDate,
  });

  const formattedDeadline = targetDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const renderContent = (res: Countdown) => {
    switch (res.state) {
      case "ANSWERED":
        return {
          icon: CheckCircle,
          label: res.answeredOnTime ? "Answered · on time" : "Answered · late",
          className: res.answeredOnTime
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        };
      case "OVERDUE":
        return {
          icon: AlertCircle,
          label: `Overdue ${formatDuration(Math.abs(res.msLeft))}`,
          className: "border-destructive/30 bg-destructive/10 text-destructive font-semibold",
        };
      case "DUE_SOON":
        return {
          icon: AlertTriangle,
          label: `Due soon · ${formatDuration(res.msLeft)}`,
          className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium",
        };
      case "ON_TRACK":
        return {
          icon: Clock,
          label: `Due in ${formatDuration(res.msLeft)}`,
          className: "border-border bg-muted/50 text-muted-foreground",
        };
      default:
        return {
          icon: Clock,
          label: "Unknown",
          className: "border-border bg-muted/50 text-muted-foreground",
        };
    }
  };

  const { icon: Icon, label, className: stateClass } = renderContent(countdown);

  return (
    <span
      title={`Target deadline: ${formattedDeadline} IST`}
      aria-live={countdown.state === "OVERDUE" || countdown.state === "DUE_SOON" ? "polite" : "off"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
        stateClass,
        className,
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
