import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useResolvedDarkMode } from '../../hooks/useResolvedDarkMode.js'

const barColors = ['#a855f7', '#8b5cf6', '#6366f1', '#c026d3']

/**
 * CourseCompletionChart — simple horizontal-style progress per course.
 */
export function CourseCompletionChart({ data }) {
  const isDark = useResolvedDarkMode()
  const gridStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(24, 24, 27, 0.08)'
  const tickFill = isDark ? '#d4d4d8' : '#3f3f46'
  const tooltipStyle = isDark
    ? {
        backgroundColor: 'rgba(12, 10, 18, 0.94)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        fontSize: '12px',
        color: '#e4e4e7',
      }
    : {
        backgroundColor: 'rgba(255,255,255,0.96)',
        border: '1px solid rgba(24, 24, 27, 0.12)',
        borderRadius: '12px',
        fontSize: '12px',
        color: '#18181b',
      }
  const cursorFill = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99, 102, 241, 0.08)'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        barCategoryGap={14}
      >
        <CartesianGrid strokeDasharray="3 6" stroke={gridStroke} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={118}
          tick={{ fill: tickFill, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: cursorFill }}
          contentStyle={tooltipStyle}
          formatter={(value) => [`${value}%`, 'Complete']}
        />
        <Bar dataKey="percent" radius={[0, 10, 10, 0]} barSize={18}>
          {data.map((_, i) => (
            <Cell key={i} fill={barColors[i % barColors.length]} fillOpacity={0.92} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
