import { PageHeaderSkeleton } from "@/components/common/page-header-skeleton";
import { EnvelopesListSkeleton } from "@/features/envelopes/components/envelopes-list-skeleton";

export default function EnvelopesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      <EnvelopesListSkeleton />
    </div>
  );
}
