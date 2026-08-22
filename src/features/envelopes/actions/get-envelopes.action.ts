"use server";
import { auth } from "@clerk/nextjs/server";
import { EnvelopesResponse } from "@/features/envelopes/types";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

export const getEnvelopesAction = async () => {
  await auth.protect();

  try {
    const req = await authenticatedFetch("/budgets", {
      next: {
        tags: ["all-envelopes"],
        revalidate: 60, // Revalidate every 60 seconds
      },
    });

    const json = await req.json();

    if (!req.ok) {
      throw new Error("Failed to fetch envelopes");
    }

    const envelopes: EnvelopesResponse = json;

    return envelopes;
  } catch (error) {
    console.error("Error fetching envelopes:", error);
    throw error;
  }
};
