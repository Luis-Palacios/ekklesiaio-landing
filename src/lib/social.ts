/** ekklesiaio's social profiles: footer links and the Organization JSON-LD `sameAs`. */
export const socialProfiles = {
  facebook: "https://www.facebook.com/ekklesiaio",
  x: "https://x.com/EkklesiaIO",
  linkedin: "https://www.linkedin.com/company/ekklesiaio",
} as const;

export type SocialNetwork = keyof typeof socialProfiles;
