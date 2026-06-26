import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab'
import { Typography } from '@mui/material'
import type { BookHistory } from '../types/book'

interface HistoryTimelineProps {
  history: BookHistory[]
}

export function HistoryTimeline({ history }: HistoryTimelineProps) {
  return (
    <Timeline position="alternate">
      {history.map((h) => (
        <TimelineItem key={h.id}>
          <TimelineOppositeContent>
            <Typography color="text.secondary">
              {new Date(h.timestamp).toLocaleString()}
            </Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color={h.action === 'Deleted' ? 'error' : h.action === 'Created' ? 'success' : 'primary'} />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6">{h.action}</Typography>
            <Typography variant="body2">{h.bookSlug}</Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}