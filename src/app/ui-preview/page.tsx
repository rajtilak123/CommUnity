import { AlertTriangle, Inbox, Users } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge } from "@/components/priority-badge";
import { SearchInput } from "@/components/search-input";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { complaintPriorities, complaintStatuses } from "@/types/ui";

export default function UiPreviewPage() {
  return (
    <main className="mx-auto min-h-screen max-w-container-max space-y-2xl bg-background p-margin-mobile py-xl md:p-xl">
      <PageHeader
        title="Phase 0 UI Preview"
        description="Temporary page for visual verification of CommUnity design system components."
        breadcrumbs={
          <span>
            CommUnity <span className="text-outline">/</span> UI Preview
          </span>
        }
        actions={
          <Button variant="secondary" size="sm">
            Sample Action
          </Button>
        }
      />

      <section className="space-y-md">
        <h2 className="text-headline-sm text-on-surface">ThemeToggle</h2>
        <ThemeToggle className="max-w-md" />
      </section>

      <section className="space-y-md">
        <h2 className="text-headline-sm text-on-surface">MetricCard</h2>
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Residents" value="1,248" icon={Users} trend="+12%" accent="primary" />
          <MetricCard
            label="Open Complaints"
            value="24"
            icon={AlertTriangle}
            trend="High Priority"
            accent="error"
          />
          <MetricCard label="Resolved" value="186" trend="92% Rate" accent="secondary" />
          <MetricCard label="Pending Bookings" value="42" trend="4 Today" accent="tertiary" />
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-headline-sm text-on-surface">StatusBadge</h2>
        <div className="flex flex-wrap gap-sm">
          {complaintStatuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-headline-sm text-on-surface">PriorityBadge</h2>
        <div className="flex flex-wrap gap-sm">
          {complaintPriorities.map((priority) => (
            <PriorityBadge key={priority} priority={priority} />
          ))}
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-headline-sm text-on-surface">SearchInput</h2>
        <SearchInput placeholder="Search complaints, residents, or IDs..." className="max-w-lg" />
      </section>

      <section className="space-y-md">
        <h2 className="text-headline-sm text-on-surface">EmptyState</h2>
        <EmptyState
          icon={Inbox}
          title="No items found"
          description="This is a placeholder empty state for list screens."
          action={<Button size="sm">Create New</Button>}
        />
      </section>
    </main>
  );
}
