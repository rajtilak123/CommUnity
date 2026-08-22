"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Users,
  Shield,
  Building,
  CheckCircle,
  Copy,
  Trash2,
  AlertTriangle,
  Mail,
  User,
  Plus,
  Loader2,
  Terminal,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import {
  createResidentInvitationAction,
  createAdminInvitationAction,
  revokeInvitationAction,
  updateAdminProfileAction,
  updateSocietyAction,
} from "@/lib/settings/actions";
import type { SettingsActionState } from "@/lib/settings/actions";

type Invitation = {
  id: string;
  society_id: string;
  email: string;
  type: "admin_bootstrap" | "resident_onboard";
  token_hash: string;
  is_redeemed: boolean;
  redeemed_by: string | null;
  redeemed_at: string | null;
  created_at: string;
  expires_at: string;
  created_by: string | null;
  redeemed_by_profile?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
};

type SettingsManagerProps = {
  society: {
    id: string;
    name: string;
    address: string | null;
    created_at: string;
  } | null;

  adminProfile: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: string;
  };

  invitations: Invitation[];

  stats: {
    totalResidents: number;
    totalFacilities: number;
  };

  env: string;
};

export function SettingsManager({
  society,
  adminProfile,
  invitations,
  stats,
  env,
}: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<
    "society" | "profile" | "invitations" | "system"
  >("society");

  // ---------------------------------------------------------------------------
  // PROFILE FORM
  // ---------------------------------------------------------------------------

  const [profileName, setProfileName] = useState(
    adminProfile.full_name || ""
  );
  const [profilePhone, setProfilePhone] = useState(
    adminProfile.phone || ""
  );

  const [profileState, setProfileState] =
    useState<SettingsActionState>({});

  const [isProfilePending, startProfileTransition] =
    useTransition();

  // ---------------------------------------------------------------------------
  // SOCIETY FORM
  // ---------------------------------------------------------------------------

  const [societyName, setSocietyName] = useState(
    society?.name || ""
  );

  const [societyAddress, setSocietyAddress] = useState(
    society?.address || ""
  );

  const [societyState, setSocietyState] =
    useState<SettingsActionState>({});

  const [isSocietyPending, startSocietyTransition] =
    useTransition();

  // ---------------------------------------------------------------------------
  // INVITATION FORM
  // ---------------------------------------------------------------------------

  const [inviteEmail, setInviteEmail] = useState("");

  const [inviteType, setInviteType] = useState<
    "resident_onboard" | "admin_bootstrap"
  >("resident_onboard");

  const [inviteState, setInviteState] =
    useState<SettingsActionState>({});

  const [isInvitePending, startInviteTransition] =
    useTransition();

  const [generatedToken, setGeneratedToken] =
    useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // INVITATION FILTERS
  // ---------------------------------------------------------------------------

  const [inviteSearch, setInviteSearch] = useState("");

  const [inviteStatusFilter, setInviteStatusFilter] = useState<
    "all" | "active" | "redeemed" | "expired"
  >("all");

  const [isRevokePending, startRevokeTransition] =
    useTransition();

  const [copySuccess, setCopySuccess] = useState(false);

  // ---------------------------------------------------------------------------
  // COMMON INPUT CLASS
  // ---------------------------------------------------------------------------

  const inputClassName =
    "block w-full min-w-0 box-border h-11 rounded-lg border border-outline-variant bg-surface px-md py-2.5 text-body-md text-on-surface shadow-sm outline-none transition-colors placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-outline";

  const selectClassName =
    "block w-full min-w-0 box-border h-11 rounded-lg border border-outline-variant bg-surface px-md py-2.5 text-body-md text-on-surface shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";

  // ---------------------------------------------------------------------------
  // PROFILE SUBMIT
  // ---------------------------------------------------------------------------

  const handleProfileSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setProfileState({});

    const formData = new FormData();

    formData.append("full_name", profileName);
    formData.append("phone", profilePhone);

    startProfileTransition(async () => {
      const res = await updateAdminProfileAction(
        {},
        formData
      );

      setProfileState(res);
    });
  };

  // ---------------------------------------------------------------------------
  // SOCIETY SUBMIT
  // ---------------------------------------------------------------------------

  const handleSocietySubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSocietyState({});

    const formData = new FormData();

    formData.append("name", societyName);
    formData.append("address", societyAddress);

    startSocietyTransition(async () => {
      const res = await updateSocietyAction(
        {},
        formData
      );

      setSocietyState(res);
    });
  };

  // ---------------------------------------------------------------------------
  // CREATE INVITATION
  // ---------------------------------------------------------------------------

  const handleCreateInvite = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setInviteState({});
    setGeneratedToken(null);

    startInviteTransition(async () => {
      const action =
        inviteType === "resident_onboard"
          ? createResidentInvitationAction
          : createAdminInvitationAction;

      const res = await action(inviteEmail);

      setInviteState(res);

      if (res.token) {
        setGeneratedToken(res.token);
        setInviteEmail("");
      }
    });
  };

  // ---------------------------------------------------------------------------
  // REVOKE INVITATION
  // ---------------------------------------------------------------------------

  const handleRevokeInvite = (id: string) => {
    if (
      confirm(
        "Are you sure you want to revoke this invitation token? Invitee will no longer be able to onboard."
      )
    ) {
      startRevokeTransition(async () => {
        await revokeInvitationAction(id);
      });
    }
  };

  // ---------------------------------------------------------------------------
  // COPY TOKEN
  // ---------------------------------------------------------------------------

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);

    setCopySuccess(true);

    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  // ---------------------------------------------------------------------------
  // FILTER INVITATIONS
  // ---------------------------------------------------------------------------

  const filteredInvitations = useMemo(() => {
    return invitations.filter((invite) => {
      const matchesSearch =
        !inviteSearch ||
        invite.email
          .toLowerCase()
          .includes(inviteSearch.toLowerCase().trim());

      const now = new Date();

      const isExpired =
        new Date(invite.expires_at) < now;

      let matchesStatus = true;

      if (inviteStatusFilter === "active") {
        matchesStatus =
          !invite.is_redeemed && !isExpired;
      } else if (inviteStatusFilter === "redeemed") {
        matchesStatus = invite.is_redeemed;
      } else if (inviteStatusFilter === "expired") {
        matchesStatus =
          !invite.is_redeemed && isExpired;
      }

      return matchesSearch && matchesStatus;
    });
  }, [
    invitations,
    inviteSearch,
    inviteStatusFilter,
  ]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-gutter lg:grid-cols-12">

      {/* =====================================================================
          LEFT SETTINGS NAVIGATION
      ====================================================================== */}

      <nav className="min-w-0 lg:col-span-3">
        <div className="flex min-w-0 flex-row gap-xs overflow-x-auto border-b border-outline-variant/60 pb-2 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:pb-0 lg:pr-md">

          <button
            type="button"
            onClick={() => setActiveTab("society")}
            className={cn(
              "flex min-w-max w-full shrink-0 cursor-pointer items-center gap-md rounded-lg px-md py-sm text-left text-label-md font-bold transition-all",
              activeTab === "society"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            <Building className="size-4 shrink-0" />
            Society Info
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex min-w-max w-full shrink-0 cursor-pointer items-center gap-md rounded-lg px-md py-sm text-left text-label-md font-bold transition-all",
              activeTab === "profile"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            <User className="size-4 shrink-0" />
            Admin Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invitations")}
            className={cn(
              "flex min-w-max w-full shrink-0 cursor-pointer items-center gap-md rounded-lg px-md py-sm text-left text-label-md font-bold transition-all",
              activeTab === "invitations"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            <Mail className="size-4 shrink-0" />
            Invitations
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("system")}
            className={cn(
              "flex min-w-max w-full shrink-0 cursor-pointer items-center gap-md rounded-lg px-md py-sm text-left text-label-md font-bold transition-all",
              activeTab === "system"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            <Terminal className="size-4 shrink-0" />
            System Settings
          </button>

        </div>
      </nav>

      {/* =====================================================================
          RIGHT CONTENT
      ====================================================================== */}

      <div className="min-w-0 lg:col-span-9">

        {/* ===================================================================
            SOCIETY INFORMATION
        ==================================================================== */}

        {activeTab === "society" && (
          <div className="space-y-lg">

            <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg">

              <div className="mb-lg flex items-center gap-sm">
                <Building className="size-5 shrink-0 text-primary" />

                <h3 className="text-body-lg font-bold text-on-surface">
                  Society Information
                </h3>
              </div>

              <form
                onSubmit={handleSocietySubmit}
                className="space-y-lg"
              >

                <div className="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2">

                  <div className="min-w-0 space-y-1.5">
                    <label className="text-label-sm font-semibold text-outline">
                      Society Name
                    </label>

                    <input
                      type="text"
                      value={societyName}
                      onChange={(e) =>
                        setSocietyName(e.target.value)
                      }
                      required
                      className={inputClassName}
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label className="text-label-sm font-semibold text-outline">
                      Society Address
                    </label>

                    <input
                      type="text"
                      value={societyAddress}
                      onChange={(e) =>
                        setSocietyAddress(e.target.value)
                      }
                      required
                      className={inputClassName}
                    />
                  </div>

                </div>

                {societyState.error && (
                  <p className="flex items-center gap-1 text-body-sm font-medium text-error">
                    <AlertTriangle className="size-4 shrink-0" />
                    {societyState.error}
                  </p>
                )}

                {societyState.success && (
                  <p className="flex items-center gap-1 text-body-sm font-medium text-success">
                    <CheckCircle className="size-4 shrink-0" />
                    {societyState.success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSocietyPending}
                  className="flex h-10 cursor-pointer items-center gap-sm rounded-lg bg-primary px-md text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSocietyPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}

                  Save Information
                </button>

              </form>
            </div>

            {/* Society Stats */}

            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2">

              <div className="flex items-center gap-md rounded-[0.75rem] border border-outline-variant bg-surface p-md">

                <span className="shrink-0 rounded-lg bg-primary/10 p-3 text-primary">
                  <Users className="size-6" />
                </span>

                <div className="min-w-0">
                  <p className="text-display-sm font-bold text-on-surface">
                    {stats.totalResidents}
                  </p>

                  <p className="text-label-sm font-semibold uppercase text-outline">
                    Total Residents
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-md rounded-[0.75rem] border border-outline-variant bg-surface p-md">

                <span className="shrink-0 rounded-lg bg-violet-500/10 p-3 text-violet-600 dark:text-violet-400">
                  <Building className="size-6" />
                </span>

                <div className="min-w-0">
                  <p className="text-display-sm font-bold text-on-surface">
                    {stats.totalFacilities}
                  </p>

                  <p className="text-label-sm font-semibold uppercase text-outline">
                    Total Facilities
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            ADMIN PROFILE
        ==================================================================== */}

        {activeTab === "profile" && (
          <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg">

            <div className="mb-lg flex items-center gap-sm">
              <User className="size-5 shrink-0 text-primary" />

              <h3 className="text-body-lg font-bold text-on-surface">
                Admin Profile Settings
              </h3>
            </div>

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-lg"
            >

              <div className="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2">

                {/* Full Name */}

                <div className="min-w-0 space-y-1.5">
                  <label className="text-label-sm font-semibold text-outline">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) =>
                      setProfileName(e.target.value)
                    }
                    required
                    className={inputClassName}
                  />
                </div>

                {/* Phone */}

                <div className="min-w-0 space-y-1.5">
                  <label className="text-label-sm font-semibold text-outline">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) =>
                      setProfilePhone(e.target.value)
                    }
                    className={inputClassName}
                  />
                </div>

                {/* Email */}

                <div className="min-w-0 space-y-1.5">
                  <label className="flex items-center gap-1 text-label-sm font-semibold text-outline">
                    Email Address

                    <span className="rounded bg-slate-500/10 px-1 py-0.5 text-[10px] font-mono font-semibold text-slate-600">
                      READ-ONLY
                    </span>
                  </label>

                  <input
                    type="email"
                    value={adminProfile.email}
                    disabled
                    className={inputClassName}
                  />
                </div>

                {/* Role */}

                <div className="min-w-0 space-y-1.5">
                  <label className="flex items-center gap-1 text-label-sm font-semibold text-outline">
                    System Role

                    <span className="rounded bg-slate-500/10 px-1 py-0.5 text-[10px] font-mono font-semibold text-slate-600">
                      READ-ONLY
                    </span>
                  </label>

                  <input
                    type="text"
                    value={adminProfile.role}
                    disabled
                    className={cn(
                      inputClassName,
                      "capitalize"
                    )}
                  />
                </div>

              </div>

              {profileState.error && (
                <p className="flex items-center gap-1 text-body-sm font-medium text-error">
                  <AlertTriangle className="size-4 shrink-0" />
                  {profileState.error}
                </p>
              )}

              {profileState.success && (
                <p className="flex items-center gap-1 text-body-sm font-medium text-success">
                  <CheckCircle className="size-4 shrink-0" />
                  {profileState.success}
                </p>
              )}

              <button
                type="submit"
                disabled={isProfilePending}
                className="flex h-10 cursor-pointer items-center gap-sm rounded-lg bg-primary px-md text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProfilePending && (
                  <Loader2 className="size-4 animate-spin" />
                )}

                Save Changes
              </button>

            </form>
          </div>
        )}

        {/* ===================================================================
            INVITATIONS
        ==================================================================== */}

        {activeTab === "invitations" && (
          <div className="space-y-lg">

            {/* Generate Invitation */}

            <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg">

              <div className="mb-lg flex items-center gap-sm">
                <Plus className="size-5 shrink-0 text-primary" />

                <h3 className="text-body-lg font-bold text-on-surface">
                  Generate Invitation Token
                </h3>
              </div>

              <form
                onSubmit={handleCreateInvite}
                className="space-y-lg"
              >

                <div className="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2">

                  <div className="min-w-0 space-y-1.5">
                    <label className="text-label-sm font-semibold text-outline">
                      Recipient Email
                    </label>

                    <input
                      type="email"
                      required
                      placeholder="e.g. resident@email.com"
                      value={inviteEmail}
                      onChange={(e) =>
                        setInviteEmail(e.target.value)
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label className="text-label-sm font-semibold text-outline">
                      Invitation Type
                    </label>

                    <select
                      value={inviteType}
                      onChange={(e) =>
                        setInviteType(
                          e.target.value as
                            | "resident_onboard"
                            | "admin_bootstrap"
                        )
                      }
                      className={selectClassName}
                    >
                      <option value="resident_onboard">
                        Resident Invitation (Onboarding)
                      </option>

                      <option value="admin_bootstrap">
                        Admin Invitation (Bootstrap)
                      </option>
                    </select>
                  </div>

                </div>

                {inviteState.error && (
                  <p className="flex items-center gap-1 text-body-sm font-medium text-error">
                    <AlertTriangle className="size-4 shrink-0" />
                    {inviteState.error}
                  </p>
                )}

                {inviteState.success && (
                  <p className="flex items-center gap-1 text-body-sm font-medium text-success">
                    <CheckCircle className="size-4 shrink-0" />
                    {inviteState.success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isInvitePending}
                  className="flex h-10 cursor-pointer items-center gap-sm rounded-lg bg-primary px-md text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isInvitePending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}

                  Generate Token
                </button>

              </form>

              {/* Generated Token */}

              {generatedToken && (
                <div className="mt-lg space-y-sm rounded-xl border border-primary/30 bg-primary/5 p-md">

                  <p className="text-label-sm font-bold uppercase tracking-wider text-primary">
                    Plaintext Token Generated
                  </p>

                  <p className="text-body-sm text-on-surface-variant">
                    Please copy and share this token with the invitee
                    immediately. This token is hashed in the database
                    and cannot be viewed again.
                  </p>

                  <div className="flex min-w-0 flex-col gap-sm sm:flex-row sm:items-center">

                    <span className="min-w-0 flex-1 break-all rounded bg-surface-container-high px-3 py-2 font-mono text-body-sm font-bold text-on-surface select-all">
                      {generatedToken}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyToken(generatedToken)
                      }
                      className={cn(
                        "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border px-3 text-label-sm font-semibold transition-colors",
                        copySuccess
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                          : "border-outline-variant bg-surface text-on-surface hover:bg-surface-container-low"
                      )}
                    >
                      <Copy className="size-4" />

                      {copySuccess
                        ? "Copied!"
                        : "Copy"}
                    </button>

                  </div>

                </div>
              )}

            </div>

            {/* Invitation Logs */}

            <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg">

              <div className="mb-md flex flex-col gap-md border-b border-outline-variant/60 pb-md sm:flex-row sm:items-center sm:justify-between">

                <h3 className="flex items-center gap-sm text-body-lg font-bold text-on-surface">
                  <Mail className="size-5 shrink-0 text-primary" />
                  Invitation Logs
                </h3>

                <div className="relative w-full min-w-0 sm:max-w-md">
                  <SearchInput
                    placeholder="Search email..."
                    value={inviteSearch}
                    onChange={(e) =>
                      setInviteSearch(e.target.value)
                    }
                    className="w-full min-w-0 rounded-[0.75rem] border-outline-variant bg-surface py-2 pl-10 shadow-sm"
                  />
                </div>

              </div>

              {/* Status Filters */}

              <div className="mb-md flex flex-wrap gap-xs border-b border-outline-variant/40 pb-md">

                {(
                  [
                    ["all", "All Statuses"],
                    ["active", "Active / Pending"],
                    ["redeemed", "Redeemed"],
                    ["expired", "Expired"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setInviteStatusFilter(value)
                    }
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1 text-label-sm font-medium transition-all",
                      inviteStatusFilter === value
                        ? "border-primary bg-primary text-on-primary shadow-sm"
                        : "border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low"
                    )}
                  >
                    {label}
                  </button>
                ))}

              </div>

              {/* Empty State */}

              {filteredInvitations.length === 0 ? (
                <EmptyState
                  title="No invitations found"
                  description={
                    invitations.length === 0
                      ? "No invitations have been issued for this society yet."
                      : "No invitations match your active search/filters."
                  }
                  className="py-xl"
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-outline-variant">
                  <table className="w-full min-w-[800px] border-collapse text-left text-body-sm">

                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-low">

                        <th className="px-md py-3 text-label-md font-bold uppercase tracking-wider text-outline">
                          Email
                        </th>

                        <th className="px-md py-3 text-label-md font-bold uppercase tracking-wider text-outline">
                          Type
                        </th>

                        <th className="px-md py-3 text-label-md font-bold uppercase tracking-wider text-outline">
                          Status
                        </th>

                        <th className="px-md py-3 text-label-md font-bold uppercase tracking-wider text-outline">
                          Created
                        </th>

                        <th className="px-md py-3 text-label-md font-bold uppercase tracking-wider text-outline">
                          Expires
                        </th>

                        <th className="px-md py-3 text-right text-label-md font-bold uppercase tracking-wider text-outline">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-outline-variant">

                      {filteredInvitations.map((invite) => {

                        const isExpired =
                          new Date(invite.expires_at) <
                          new Date();

                        let statusText = "Active";

                        let statusClass =
                          "border-primary/20 bg-primary/10 text-primary";

                        if (invite.is_redeemed) {
                          statusText = `Redeemed by ${
                            invite.redeemed_by_profile
                              ?.full_name || "User"
                          }`;

                          statusClass =
                            "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
                        } else if (isExpired) {
                          statusText = "Expired";

                          statusClass =
                            "border-error/20 bg-error/10 text-error";
                        }

                        return (
                          <tr
                            key={invite.id}
                            className="transition-colors hover:bg-surface-container-low"
                          >

                            <td className="max-w-[260px] px-md py-3 font-semibold text-on-surface">
                              <span className="break-all">
                                {invite.email}
                              </span>
                            </td>

                            <td className="px-md py-3 capitalize text-on-surface-variant">
                              {invite.type ===
                              "resident_onboard"
                                ? "Resident"
                                : "Admin"}
                            </td>

                            <td className="px-md py-3">
                              <span
                                className={cn(
                                  "inline-block rounded-full border px-2 py-0.5 text-label-sm font-semibold",
                                  statusClass
                                )}
                              >
                                {statusText}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-md py-3 text-outline">
                              {new Date(
                                invite.created_at
                              ).toLocaleDateString()}
                            </td>

                            <td className="whitespace-nowrap px-md py-3 text-outline">
                              {new Date(
                                invite.expires_at
                              ).toLocaleDateString()}
                            </td>

                            <td className="px-md py-3 text-right">

                              {!invite.is_redeemed && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRevokeInvite(
                                      invite.id
                                    )
                                  }
                                  disabled={
                                    isRevokePending
                                  }
                                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Revoke Token"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              )}

                            </td>

                          </tr>
                        );
                      })}

                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ===================================================================
            SYSTEM SETTINGS
        ==================================================================== */}

        {activeTab === "system" && (
          <div className="space-y-lg">

            {/* System Information */}

            <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg">

              <div className="mb-lg flex items-center gap-sm">
                <Terminal className="size-5 shrink-0 text-primary" />

                <h3 className="text-body-lg font-bold text-on-surface">
                  System & Environment Info
                </h3>
              </div>

              <div className="divide-y divide-outline-variant/40">

                <div className="grid grid-cols-1 gap-xs py-sm sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-md">
                  <span className="text-body-sm font-medium text-outline">
                    Society ID
                  </span>

                  <span className="min-w-0 break-all font-mono text-xs text-on-surface select-all">
                    {society?.id || "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-xs py-sm sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-md">
                  <span className="text-body-sm font-medium text-outline">
                    Current Administrator ID
                  </span>

                  <span className="min-w-0 break-all font-mono text-xs text-on-surface select-all">
                    {adminProfile.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-xs py-sm sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-md">
                  <span className="text-body-sm font-medium text-outline">
                    Active Role
                  </span>

                  <span className="text-body-sm font-semibold capitalize text-on-surface">
                    {adminProfile.role}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-xs py-sm sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-md">
                  <span className="text-body-sm font-medium text-outline">
                    Hosting Environment
                  </span>

                  <span className="text-body-sm font-semibold capitalize text-on-surface">
                    {env}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-xs py-sm sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-md">
                  <span className="text-body-sm font-medium text-outline">
                    Last Refreshed
                  </span>

                  <span className="text-body-sm font-semibold text-on-surface">
                    {new Date().toLocaleString()}
                  </span>
                </div>

              </div>

            </div>

            {/* Security */}

            <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg">

              <div className="mb-lg flex items-center gap-sm">
                <Shield className="size-5 shrink-0 text-primary" />

                <h3 className="text-body-lg font-bold text-on-surface">
                  Core Security Indicators
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-md pt-sm sm:grid-cols-2">

                <div className="flex min-w-0 items-center gap-md rounded-xl border border-outline-variant bg-surface-container-low p-md">

                  <span className="shrink-0 rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <h4 className="text-body-md font-bold text-on-surface">
                      Row Level Security (RLS)
                    </h4>

                    <p className="text-body-sm text-outline">
                      Database queries locked to tenant
                    </p>
                  </div>

                </div>

                <div className="flex min-w-0 items-center gap-md rounded-xl border border-outline-variant bg-surface-container-low p-md">

                  <span className="shrink-0 rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <h4 className="text-body-md font-bold text-on-surface">
                      Multi-Tenant Isolation
                    </h4>

                    <p className="text-body-sm text-outline">
                      Strict cross-society separation active
                    </p>
                  </div>

                </div>

                <div className="flex min-w-0 items-center gap-md rounded-xl border border-outline-variant bg-surface-container-low p-md">

                  <span className="shrink-0 rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <h4 className="text-body-md font-bold text-on-surface">
                      Invitation Safeguard
                    </h4>

                    <p className="text-body-sm text-outline">
                      Users restricted to matched emails
                    </p>
                  </div>

                </div>

                <div className="flex min-w-0 items-center gap-md rounded-xl border border-outline-variant bg-surface-container-low p-md">

                  <span className="shrink-0 rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <h4 className="text-body-md font-bold text-on-surface">
                      Secure Alerts Service
                    </h4>

                    <p className="text-body-sm text-outline">
                      Private notification triggers locked
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}