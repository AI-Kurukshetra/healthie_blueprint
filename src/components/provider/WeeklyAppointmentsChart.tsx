"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface WeeklyAppointmentsChartDatum {
  count: number;
  day: string;
}

interface WeeklyAppointmentsChartProps {
  data: WeeklyAppointmentsChartDatum[];
}

export function WeeklyAppointmentsChart({ data }: WeeklyAppointmentsChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="day"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              color: "hsl(var(--popover-foreground))",
            }}
            cursor={{ fill: "hsl(var(--accent) / 0.25)" }}
            formatter={(value) => [`${value}`, "Appointments"]}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
          />
          <Bar dataKey="count" fill="#14B8A6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
