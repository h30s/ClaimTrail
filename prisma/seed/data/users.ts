export type UserSeed = {
  name: string;
  email: string;
  role: "DESK_HEAD" | "DESK_EXECUTIVE";
};

export const SEED_USERS: readonly UserSeed[] = [
  { name: "Meera Kulkarni", email: "meera.kulkarni@claimtrail.example", role: "DESK_HEAD" },
  { name: "Arjun Patil", email: "arjun.patil@claimtrail.example", role: "DESK_EXECUTIVE" },
  { name: "Sneha Joshi", email: "sneha.joshi@claimtrail.example", role: "DESK_EXECUTIVE" },
  { name: "Farhan Sayyed", email: "farhan.sayyed@claimtrail.example", role: "DESK_EXECUTIVE" },
];
