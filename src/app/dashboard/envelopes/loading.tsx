import { PageHeaderSkeleton } from "@/components/common/PageHeaderSkeleton";
import { EnvelopesListSkeleton } from "@/features/envelopes/components/EnvelopesListSkeleton";

export default function EnvelopesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      <EnvelopesListSkeleton />
    </div>
  );
}
