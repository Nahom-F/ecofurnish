import { getDriverApplications } from "@/app/dispatcher/actions";
import { DriverApplicationsList } from "@/components/dispatcher/DriverApplicationsList";

export default async function DispatcherApplicationsPage() {
  const applications = await getDriverApplications();

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Driver Applications</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Review applications submitted from the public{" "}
        <a href="/drive" target="_blank" className="underline underline-offset-2">
          driver sign-up form
        </a>
        . Approving or rejecting notifies the applicant by email, if they gave one.
      </p>
      <DriverApplicationsList applications={applications} />
    </div>
  );
}
