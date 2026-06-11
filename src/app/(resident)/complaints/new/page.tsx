import { ComplaintForm } from "@/components/complaints/complaint-form";
import { requireResident } from "@/lib/auth/session";

export default async function RaiseComplaintPage() {
  const profile = await requireResident();

  return (
    <div className="mx-auto w-full max-w-[800px]">
      <div className="mb-xl">
        <h1 className="mb-xs text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Raise a Complaint
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Tell us what&apos;s wrong and we&apos;ll get it fixed as soon as possible.
        </p>
      </div>
      <ComplaintForm userId={profile.id} />
    </div>
  );
}
