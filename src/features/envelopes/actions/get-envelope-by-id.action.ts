"use server";
import { auth } from "@clerk/nextjs/server";
import { EnvelopesService } from "@/features/envelopes/services/envelopes.service";
import { redirect } from "next/navigation";

export const getEnvelopeByIdAction = async (id: string) => {
  await auth.protect();

  try {
    // Delegates to EnvelopesService (fetchApi + Zod validation +
    // EnvelopeMapper), instead of casting the raw API response directly -
    // the previous raw cast silently produced an Envelope missing
    // `currency` and with string dates instead of real Date objects,
    // since it skipped the mapper entirely.
    return await EnvelopesService.getById(id);
  } catch (error) {
    console.error("Error fetching envelope by id:", error);
    redirect("/dashboard");
  }
};
