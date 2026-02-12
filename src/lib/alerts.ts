export async function sendAlert(type: "SMS" | "WHATSAPP", message: string, recipient: string, receiptUrl?: string) {
    const timestamp = new Date().toLocaleString();

    if (type === "SMS") {
        // Standard Plan: Short text, no images
        console.log(`\n[SMS ALERT]`);
        console.log(`Sender: DENKAAI`);
        console.log(`To: ${recipient}`);
        console.log(`Message: ${message}`);
        console.log(`(Receipt image hidden for Standard plan)`);
    } else {
        // Premium Plan: Rich text + Receipt
        console.log(`\n[WHATSAPP ALERT]`);
        console.log(`Sender: STOCKWATCH`);
        console.log(`To: ${recipient}`);
        console.log(`Message:`);
        console.log(`🧾 STOCK ALERT`);
        console.log(`${message}`);
        if (receiptUrl) console.log(`📎 Receipt: ${receiptUrl}`);
        console.log(`Time: ${timestamp}`);
        console.log(`\n-- Denkaai © 2026`);
    }

    return { success: true };
}
