import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format-currency";
import { RevenueTrendChart } from "@/components/shared/revenue-trend-chart";
import { RepairStatusChart } from "@/components/shared/repair-status-chart";

const statusColorNames: Record<string, string> = {
  DIAGNOSING: "Diagnosing",
  WAITING_FOR_PARTS: "Waiting for Parts",
  REPAIRING: "Repairing",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

export default async function ReportsPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayPayments, weekPayments, monthPayments, statusCounts, deviceGroups, partGroups] =
    await Promise.all([
      prisma.payment.findMany({ where: { createdAt: { gte: startOfToday } } }),
      prisma.payment.findMany({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.payment.findMany({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.repairTicket.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
      prisma.repairTicket.groupBy({ by: ["deviceModel"], where: { deletedAt: null }, _count: true }),
      prisma.repairPart.groupBy({ by: ["partId"], _sum: { quantityUsed: true } }),
    ]);

  const sum = (arr: { amount: number }[]) => arr.reduce((s, p) => s + p.amount, 0);
  const todayIncome = sum(todayPayments);
  const weekIncome = sum(weekPayments);
  const monthIncome = sum(monthPayments);

  const trendData: { day: string; income: number }[] = [];
  const incomeByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    incomeByDay[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
  }
  weekPayments.forEach((p) => {
    const label = p.createdAt.toLocaleDateString("en-US", { weekday: "short" });
    if (label in incomeByDay) incomeByDay[label] += p.amount;
  });
  Object.entries(incomeByDay).forEach(([day, income]) => trendData.push({ day, income }));

  const totalStatusCount = statusCounts.reduce((s, sc) => s + sc._count, 0);
  const statusChartData = statusCounts.map((sc) => ({
    name: statusColorNames[sc.status] ?? sc.status,
    value: sc._count,
  }));

  const mostCommonRepairs = [...deviceGroups]
    .sort((a, b) => b._count - a._count)
    .slice(0, 5);
  const maxRepairCount = mostCommonRepairs[0]?._count ?? 1;

  const topPartsRaw = [...partGroups]
    .sort((a, b) => (b._sum.quantityUsed ?? 0) - (a._sum.quantityUsed ?? 0))
    .slice(0, 5);
  const partIds = topPartsRaw.map((p) => p.partId);
  const parts = await prisma.sparePart.findMany({ where: { id: { in: partIds } } });
  const mostUsedParts = topPartsRaw.map((tp) => ({
    name: parts.find((p) => p.id === tp.partId)?.name ?? "Unknown",
    qty: tp._sum.quantityUsed ?? 0,
  }));
  const maxPartQty = mostUsedParts[0]?.qty ?? 1;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">Reports</h1>
      <p className="text-slate-500 mb-6">Performance analytics overview.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Today's Income</p>
          <p className="text-2xl font-semibold">{formatCurrency(todayIncome)}</p>
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Weekly Income</p>
          <p className="text-2xl font-semibold">{formatCurrency(weekIncome)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4">
          <p className="text-xs opacity-90 mb-1">Monthly Revenue</p>
          <p className="text-2xl font-semibold">{formatCurrency(monthIncome)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Daily Revenue Trend (7 Days)</h2>
          <RevenueTrendChart data={trendData} />
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Repair Status Distribution</h2>
          <RepairStatusChart data={statusChartData} total={totalStatusCount} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Most Common Repairs</h2>
          <div className="space-y-3">
            {mostCommonRepairs.map((r) => (
              <div key={r.deviceModel}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{r.deviceModel}</span>
                  <span className="font-medium">{r._count}</span>
                </div>
                <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 rounded-full"
                    style={{ width: `${(r._count / maxRepairCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {mostCommonRepairs.length === 0 && (
              <p className="text-sm text-slate-500">No repair data yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Most Used Spare Parts</h2>
          <div className="space-y-3">
            {mostUsedParts.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{p.name}</span>
                  <span className="font-medium">{p.qty} units</span>
                </div>
                <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${(p.qty / maxPartQty) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {mostUsedParts.length === 0 && (
              <p className="text-sm text-slate-500">No parts used yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}