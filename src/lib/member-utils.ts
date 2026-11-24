type Names = { firstName: string; lastName: string; stageName: string | null };

export function displayName(m: Names) {
  return m.stageName?.trim() || [m.firstName, m.lastName].filter(Boolean).join(" ");
}

export function fullName(m: Names) {
  return [m.firstName, m.lastName].filter(Boolean).join(" ") || displayName(m);
}
