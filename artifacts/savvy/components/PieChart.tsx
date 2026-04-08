import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { useCurrency } from "@/hooks/useCurrency";
import { useT } from "@/hooks/useTranslations";
import { CATEGORY_COLORS } from "@/utils/finance";
import { TransactionCategory } from "@/context/AppContext";

interface Slice {
  category: TransactionCategory;
  value: number;
  percentage: number;
}

interface PieChartProps {
  data: Record<string, number>;
  currency?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx: number, cy: number, r: number, innerR: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export default function PieChart({ data }: PieChartProps) {
  const colors = useColors();
  const { format } = useCurrency();
  const t = useT();
  const [selected, setSelected] = useState<TransactionCategory | null>(null);

  const total = Object.values(data).reduce((s, v) => s + v, 0);

  if (total === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.muted }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noExpenses}</Text>
      </View>
    );
  }

  const slices: Slice[] = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, value]) => ({
      category: cat as TransactionCategory,
      value,
      percentage: (value / total) * 100,
    }));

  const SIZE = 200;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const outerR = 85;
  const innerR = 52;

  let currentAngle = 0;
  const paths = slices.map((slice) => {
    const sliceAngle = (slice.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;
    return { ...slice, startAngle, endAngle };
  });

  const selectedSlice = selected ? slices.find((s) => s.category === selected) : null;

  const getCategoryLabel = (cat: TransactionCategory): string => {
    const map: Record<TransactionCategory, string> = {
      salary: t.catSalary, freelance: t.catFreelance, investment: t.catInvestment,
      gift: t.catGift, food: t.catFood, housing: t.catHousing, transport: t.catTransport,
      health: t.catHealth, entertainment: t.catEntertainment, shopping: t.catShopping,
      education: t.catEducation, utilities: t.catUtilities, travel: t.catTravel, other: t.catOther,
    };
    return map[cat];
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        <View style={styles.svgContainer}>
          <Svg width={SIZE} height={SIZE}>
            {paths.map((p) => (
              <Path
                key={p.category}
                d={arcPath(cx, cy, outerR, innerR, p.startAngle, p.endAngle)}
                fill={CATEGORY_COLORS[p.category]}
                opacity={selected && selected !== p.category ? 0.4 : 1}
                onPress={() => setSelected(p.category === selected ? null : p.category)}
              />
            ))}
            <Circle cx={cx} cy={cy} r={innerR} fill={colors.card} />
          </Svg>
          <View style={[styles.centerLabel, { top: cy - 28, left: cx - 40 }]}>
            {selectedSlice ? (
              <>
                <Text style={[styles.centerValue, { color: colors.foreground }]}>
                  {format(selectedSlice.value)}
                </Text>
                <Text style={[styles.centerSub, { color: colors.mutedForeground }]}>
                  {selectedSlice.percentage.toFixed(1)}%
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.centerValue, { color: colors.foreground }]}>
                  {format(total)}
                </Text>
                <Text style={[styles.centerSub, { color: colors.mutedForeground }]}>Total</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        {slices.slice(0, 6).map((slice) => (
          <TouchableOpacity
            key={slice.category}
            style={styles.legendItem}
            onPress={() => setSelected(slice.category === selected ? null : slice.category)}
            activeOpacity={0.7}
          >
            <View style={[styles.legendDot, { backgroundColor: CATEGORY_COLORS[slice.category] }]} />
            <Text style={[styles.legendLabel, { color: colors.foreground }]}>
              {getCategoryLabel(slice.category)}
            </Text>
            <Text style={[styles.legendPct, { color: colors.mutedForeground }]}>
              {slice.percentage.toFixed(0)}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  chartRow: { marginBottom: 16 },
  svgContainer: { position: "relative" },
  centerLabel: { position: "absolute", width: 80, alignItems: "center" },
  centerValue: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  centerSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  legend: { width: "100%", gap: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 2 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  legendPct: { fontSize: 13, fontFamily: "Inter_500Medium" },
  empty: { height: 120, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
