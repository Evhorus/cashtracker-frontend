"use server";
import { auth } from "@clerk/nextjs/server";
import { Envelope } from "@/features/envelopes/types";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { redirect } from "next/navigation";

export const getEnvelopeByIdAction = async (id: string) => {
  await auth.protect();

  try {
    const req = await authenticatedFetch(`/budgets/${id}`, {
      next: {
        tags: ["envelope"],
        revalidate: 60, // Revalidate every 60 seconds
      },
    });

    if (!req.ok) {
      redirect("/dashboard");
    }

    const json = await req.json();

    const envelope: Envelope = json;

    return envelope;
  } catch (error) {
    console.error("Error fetching envelope by id:", error);
    throw error;
  }
};
