import { prisma } from "./prisma";

export async function checkFeatureAccess(hotelId: string, feature: "WHATSAPP" | "RECEIPTS" | "ANALYTICS") {
    const subscription = await prisma.subscription.findUnique({
        where: { hotelId }
    });

    if (!subscription) return false;

    const now = new Date();
    const trialEnds = new Date(subscription.startDate);
    trialEnds.setDate(trialEnds.getDate() + 30);

    const isTrialActive = now <= trialEnds;

    if (subscription.type === "PREMIUM") return true;
    if (isTrialActive) return true; // Everything unlocked during trial

    // Free Tier limitations after 30 days
    const freeTierFeatures = ["DASHBOARD_ONLY"];
    return false;
}
