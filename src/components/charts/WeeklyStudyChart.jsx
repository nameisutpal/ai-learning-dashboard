import { useId, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useResolvedDarkMode } from '../../hooks/useResolvedDarkMode.js'

/**
 * WeeklyStudyChart — area chart. `yMax` pads the axis when all values are small.
 */
export function WeeklyStudyChart({ data, yMax = 5 }) {
  const isDark = useResolvedDarkMode()
  const reactId = useId().replace(/:/g, '')
  const fillId = `studyFill-${reactId}`
  const strokeId = `studyStroke-${reactId}`

  const domainMax = useMemo(() => {
    const peak = Math.max(0, ...data.map((d) => Number(d.hours) || 0))
    const padded = Math.ceil(peak + 0.5)
    return Math.max(yMax, padded || 1)
  }, [data, yMax])

  const gridStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(24, 24, 27, 0.08)'
  const axisLine = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24, 24, 27, 0.12)'
  const tickPrimary = isDark ? '#a1a1aa' : '#52525b'
  const tickSecondary = isDark ? '#71717a' : '#71717a'
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke={gridStroke} vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: tickPrimary, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: axisLine }}
        />
        <YAxis
          tick={{ fill: tickSecondary, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
          domain={[0, domainMax]}
        />
        <Tooltip
          cursor={{ stroke: 'rgba(167,139,250,0.35)', strokeWidth: 1 }}
          contentStyle={tooltipStyle}
          formatter={(value) => [`${value} hrs`, 'Studied']}
        />
        <Area
          type="monotone"
          dataKey="hours"
          stroke={`url(#${strokeId})`}
          strokeWidth={2.2}
          fill={`url(#${fillId})`}
          activeDot={{ r: 5, strokeWidth: 0, fill: '#e9d5ff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
