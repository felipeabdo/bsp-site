type MusicAdminIdentity = { memberId: string; email: string | null } | null | undefined;

/** Admin permissions are granted only by server-side environment allowlists. */
export function isMusicAdmin(user: MusicAdminIdentity): boolean {
  if (!user) return false;
  const memberIds = (process.env.BSP_ADMIN_MEMBER_IDS ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  const emails = (process.env.BSP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return memberIds.includes(user.memberId.toUpperCase()) || Boolean(user.email && emails.includes(user.email.toLowerCase()));
}
