import "server-only";
import { db } from "@/lib/db";
import type { Gender } from "@/lib/enums";

export type SearchedPatientDto = {
  id: string;
  uhid: string;
  name: string;
  gender: Gender;
  dateOfBirth: Date;
};

export async function searchPatients(q: string): Promise<SearchedPatientDto[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  const patients = await db.patient.findMany({
    where: {
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { uhid: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    take: 8,
    orderBy: { name: "asc" },
    select: {
      id: true,
      uhid: true,
      name: true,
      gender: true,
      dateOfBirth: true,
    },
  });

  return patients;
}
