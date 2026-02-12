// Role-Based Access Control Helpers for StockWatch Phase 2

export type Role = "OWNER" | "MANAGER" | "KITCHEN";

export function requireOwner(session: any): void {
    if (!session?.user) throw new Error("Unauthorized");
    if ((session.user as any).role !== "OWNER") {
        throw new Error("Access denied. Owner role required.");
    }
}

export function requireManager(session: any): void {
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    if (role !== "OWNER" && role !== "MANAGER") {
        throw new Error("Access denied. Manager or Owner role required.");
    }
}

export function requireStaff(session: any): void {
    if (!session?.user) throw new Error("Unauthorized");
}

export function canViewFinancials(role: string): boolean {
    return role === "OWNER";
}

export function canEditStock(role: string): boolean {
    return role === "OWNER" || role === "MANAGER";
}

export function canManageStaff(role: string): boolean {
    return role === "OWNER";
}

export function canDeleteStock(role: string): boolean {
    return role === "OWNER";
}

export function canRecordUsage(role: string): boolean {
    return true; // All roles can record usage
}

export function getRoleLabel(role: string): string {
    switch (role) {
        case "OWNER": return "👑 Owner";
        case "MANAGER": return "🧑‍💼 Manager";
        case "KITCHEN": return "👨‍🍳 Staff";
        default: return role;
    }
}
