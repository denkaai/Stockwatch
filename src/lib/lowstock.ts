// Low Stock Detection System for StockWatch Phase 2

export interface LowStockItem {
    id: string;
    name: string;
    unit: string;
    currentBalance: number;
    minimumLevel: number;
    reorderLevel: number;
    buyingPrice: number;
    severity: "CRITICAL" | "WARNING" | "OK";
}

export function analyzeLowStock(
    items: Array<{
        id: string;
        name: string;
        unit: string;
        buyingPrice: number;
        minimumLevel: number;
        reorderLevel: number;
        entries: Array<{ quantity: number }>;
        usages: Array<{ quantity: number }>;
    }>
): LowStockItem[] {
    return items.map(item => {
        const totalAdded = item.entries.reduce((s, e) => s + e.quantity, 0);
        const totalUsed = item.usages.reduce((s, u) => s + u.quantity, 0);
        const currentBalance = totalAdded - totalUsed;

        let severity: "CRITICAL" | "WARNING" | "OK" = "OK";
        if (item.minimumLevel > 0 && currentBalance <= item.minimumLevel) {
            severity = "CRITICAL";
        } else if (item.reorderLevel > 0 && currentBalance <= item.reorderLevel) {
            severity = "WARNING";
        }

        return {
            id: item.id,
            name: item.name,
            unit: item.unit,
            currentBalance,
            minimumLevel: item.minimumLevel,
            reorderLevel: item.reorderLevel,
            buyingPrice: item.buyingPrice,
            severity,
        };
    });
}

export function getLowStockCount(items: LowStockItem[]): number {
    return items.filter(i => i.severity !== "OK").length;
}

export function getCriticalItems(items: LowStockItem[]): LowStockItem[] {
    return items.filter(i => i.severity === "CRITICAL");
}
