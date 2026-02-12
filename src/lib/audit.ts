// Audit Log System for StockWatch Phase 2
import { prisma } from "./prisma";

export type AuditAction =
    | "STOCK_ADDED"
    | "STOCK_USED"
    | "STOCK_EDITED"
    | "STOCK_DELETED"
    | "ITEM_CREATED"
    | "ITEM_DELETED"
    | "USER_LOGIN"
    | "REPORT_GENERATED";

export async function createAuditLog(
    action: AuditAction,
    details: string,
    userId: string,
    userName: string,
    hotelId: string
) {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                details,
                userId,
                userName,
                hotelId,
            },
        });
    } catch (err) {
        console.error("[AUDIT LOG ERROR]", err);
    }
}
