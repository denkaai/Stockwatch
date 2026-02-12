// Smart Hint Engine for StockWatch Phase 2
// Rule-based intelligence — no AI, just smart rules

export interface SmartHint {
    type: "OVERUSE" | "REORDER" | "SPIKE" | "INFO";
    icon: string;
    message: string;
    severity: "high" | "medium" | "low";
}

interface ItemUsageData {
    name: string;
    unit: string;
    currentBalance: number;
    thisMonthUsage: number;
    lastMonthUsage: number;
    todayUsage: number;
    avgDailyUsage: number;
}

export function generateHints(items: ItemUsageData[]): SmartHint[] {
    const hints: SmartHint[] = [];

    for (const item of items) {
        // 1. Overuse Detection: >15% increase month-over-month
        if (item.lastMonthUsage > 0 && item.thisMonthUsage > item.lastMonthUsage * 1.15) {
            const pctIncrease = Math.round(((item.thisMonthUsage - item.lastMonthUsage) / item.lastMonthUsage) * 100);
            hints.push({
                type: "OVERUSE",
                icon: "⚠️",
                message: `${item.name} usage increased by ${pctIncrease}% compared to last month.`,
                severity: pctIncrease > 30 ? "high" : "medium",
            });
        }

        // 2. Reorder Prediction: stock will finish in <3 days
        if (item.avgDailyUsage > 0) {
            const daysRemaining = Math.floor(item.currentBalance / item.avgDailyUsage);
            if (daysRemaining <= 3 && daysRemaining >= 0) {
                hints.push({
                    type: "REORDER",
                    icon: "📦",
                    message: `${item.name} will finish in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. Consider reordering.`,
                    severity: daysRemaining <= 1 ? "high" : "medium",
                });
            }
        }

        // 3. Usage Spike: 30% increase in one day vs average
        if (item.avgDailyUsage > 0 && item.todayUsage > item.avgDailyUsage * 1.3) {
            hints.push({
                type: "SPIKE",
                icon: "📈",
                message: `Unusual spike in ${item.name} usage today (${item.todayUsage} ${item.unit} vs avg ${item.avgDailyUsage.toFixed(1)} ${item.unit}).`,
                severity: "high",
            });
        }
    }

    // Sort by severity
    const order = { high: 0, medium: 1, low: 2 };
    hints.sort((a, b) => order[a.severity] - order[b.severity]);

    return hints;
}
