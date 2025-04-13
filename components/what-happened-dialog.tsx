"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type WhatHappenedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  phaseKey: string
  initialValue?: string
  onSave: (phaseKey: string, text: string) => void
  isReadOnly?: boolean
}

export function WhatHappenedDialog({
  open,
  onOpenChange,
  phaseKey,
  initialValue = "",
  onSave,
  isReadOnly = false,
}: WhatHappenedDialogProps) {
  const [text, setText] = useState(initialValue)

  const handleSave = () => {
    onSave(phaseKey, text)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly ? "What Happened" : "Record What Happened"} - {phaseKey.replace("-", " ").toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? "View the significant events that occurred during this phase."
              : "Record the significant events that occurred during this phase."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Describe what happened during this phase..."
            value={isReadOnly ? initialValue : text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px]"
            readOnly={isReadOnly}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly && <Button onClick={handleSave}>Save</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
