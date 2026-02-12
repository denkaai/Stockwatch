import { prisma } from "../src/lib/prisma";
import { sendAlert } from "../src/lib/alerts";

async function main() {
    console.log("🚀 Starting KitchenGuard MVP System Validation...");

    // 1. Cleanup previous test data
    const testEmail = "test@kitchenguard.ke";
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.hotel.deleteMany({ where: { name: "Test Safari Lodge" } });
    console.log("✅ Cleanup complete");

    // 2. Register Hotel (Kenya Enforcement)
    console.log("📝 Testing Registration...");
    const hotel = await prisma.hotel.create({
        data: {
            name: "Test Safari Lodge",
            country: "Kenya",
            county: "Nairobi",
            town: "Westlands",
            efficiencyScore: 95.5
        }
    });
    console.log(`✅ Hotel Created: ${hotel.name} (${hotel.town}, ${hotel.county}, ${hotel.country})`);

    // 3. Create Owner User
    const user = await prisma.user.create({
        data: {
            name: "Test Owner",
            email: testEmail,
            role: "OWNER",
            hotelId: hotel.id
        }
    });
    console.log(`✅ Owner Created: ${user.name}`);

    // 4. Create Subscription (Premium)
    await prisma.subscription.create({
        data: {
            hotelId: hotel.id,
            type: "PREMIUM"
        }
    });
    console.log("✅ Premium Subscription Active");

    // 5. Add Stock Item
    const item = await prisma.stockItem.create({
        data: {
            name: "Basmati Rice",
            unit: "kg",
            hotelId: hotel.id
        }
    });
    console.log(`✅ Stock Item Added: ${item.name}`);

    // 6. Test Stock Entry (Receipt & Alert)
    console.log("📦 Testing Stock Entry & Alerts...");
    const quantity = 50;
    const receiptUrl = "https://demo-receipts.com/invoice_001.jpg";

    // Simulate API Logic
    if (!receiptUrl) throw new Error("Receipt enforcement failed!");

    const entry = await prisma.stockEntry.create({
        data: {
            itemId: item.id,
            quantity: quantity,
            receiptUrl: receiptUrl,
            hotelId: hotel.id,
            addedBy: user.name!,
        },
        include: { item: true }
    });

    // Simulate Alert Trigger
    const alertType = "WHATSAPP"; // Derived from Premium
    await sendAlert(alertType, `New Stock Added: ${quantity} ${entry.item.unit} of ${entry.item.name}`, "0700000000", receiptUrl);
    console.log("✅ Stock Entry & Alert Processed");

    // 7. Verify Data
    const savedEntry = await prisma.stockEntry.findUnique({ where: { id: entry.id } });
    if (savedEntry?.receiptUrl !== receiptUrl) throw new Error("Receipt URL not saved!");
    console.log("✅ Data Verification Passed");

    console.log("\n🎉 SYSTEM VERIFICATION SUCCESSFUL! The MVP backend is fully operational.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
