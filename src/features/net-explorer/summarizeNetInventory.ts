import type { NetInventorySummary, NormalizedNet } from "../../domain";

function increment(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

export function summarizeNetInventory(nets: readonly NormalizedNet[]): NetInventorySummary {
  const classificationDistribution: Record<string, number> = {};
  const sourceDistribution: Record<string, number> = {};

  nets.forEach((net) => {
    increment(classificationDistribution, net.classification);
    net.sources.forEach((source) => increment(sourceDistribution, source));
  });

  return {
    totalNets: nets.length,
    classifiedNets: nets.filter((net) => net.classification !== "Unknown").length,
    unknownNets: nets.filter((net) => net.classification === "Unknown").length,
    powerNets: nets.filter((net) => net.classification === "Power").length,
    groundNets: nets.filter((net) => net.classification === "Ground").length,
    communicationNets: nets.filter((net) =>
      ["UART", "I2C", "SPI", "USB", "CAN"].includes(net.classification)
    ).length,
    diagnosticsCount: nets.reduce((total, net) => total + net.diagnostics.length, 0),
    classificationDistribution,
    sourceDistribution
  };
}
