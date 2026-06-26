import { memo } from 'react'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import type { BookHistoryEntry } from '../types/book'

function getActionChipColor(action: string): 'success' | 'error' | 'info' | 'warning' | 'default' {
  switch (action) {
    case 'Created':
      return 'success'
    case 'Updated':
      return 'info'
    case 'Deleted':
      return 'error'
    default:
      return 'default'
  }
}

function getActionDotColor(action: string): 'success' | 'error' | 'info' | 'warning' | 'grey' {
  switch (action) {
    case 'Created':
      return 'success'
    case 'Updated':
      return 'info'
    case 'Deleted':
      return 'error'
    default:
      return 'grey'
  }
}

function groupByDate(entries: BookHistoryEntry[]) {
  const groups = new Map<string, BookHistoryEntry[]>()
  for (const entry of entries) {
    const dateKey = new Date(entry.changedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(entry)
  }
  return groups
}

interface HistoryTimelineProps {
  entries: BookHistoryEntry[]
}

function HistoryTimeline({ entries }: HistoryTimelineProps) {
  const groups = groupByDate(entries)

  if (entries.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No history entries yet.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {Array.from(groups.entries()).map(([date, groupEntries]) => (
        <Card key={date} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ pb: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary' }}>
              {date}
            </Typography>
            <Timeline position="right" sx={{ p: 0, m: 0 }}>
              {groupEntries.map((entry, index) => (
                <TimelineItem key={entry.id}>
                  <TimelineOppositeContent sx={{ flex: 0.2, minWidth: 80 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(entry.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getActionDotColor(entry.action)} variant="filled" />
                    {index < groupEntries.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={entry.action} color={getActionChipColor(entry.action)} size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {entry.propertyName}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{entry.description}</Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

export default memo(HistoryTimeline)