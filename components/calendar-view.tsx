"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import type { SavedItem } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CalendarViewProps {
  items: SavedItem[]
}

export function CalendarView({ items }: CalendarViewProps) {
  const [groupedItems, setGroupedItems] = useState<Record<string, SavedItem[]>>({})

  useEffect(() => {
    // Group items by date
    const grouped: Record<string, SavedItem[]> = {}

    items.forEach((item) => {
      const date = new Date(item.createdAt)
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(item)
    })

    setGroupedItems(grouped)
  }, [items])

  const sortedDates = Object.keys(groupedItems).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  if (sortedDates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline
          </CardTitle>
          <CardDescription>Your saved items organized by date</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No items saved yet. Start saving links, notes, or code!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline
        </CardTitle>
        <CardDescription>Your saved items organized by date</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background/80 backdrop-blur-sm py-2">
              {date}
            </h3>
            <div className="space-y-2 pl-4 border-l-2 border-border">
              {groupedItems[date].map((item) => (
                <div
                  key={item.id}
                  className="pl-4 py-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                      {item.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {item.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {item.type}
                        </span>
                        {item.domain && (
                          <span className="text-xs text-muted-foreground">{item.domain}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
