export type UserProfile = {
  email: string;
  name: string;
  role: "Administrator";
  avatar: string;
};

export const defaultUserProfile: UserProfile = {
  email: mockConfig.demoEmail,
  name: "Admin",
  role: "Administrator",
  avatar: "",
};

export function nameFromEmail(email: string) {
  const localPart = email.trim().split("@")[0] || "Admin";
  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

export function initialsForName(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "AD";
}
import { mockConfig } from "@/lib/mock-data";

