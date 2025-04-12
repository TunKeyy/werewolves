"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import type { GameState, Player } from "@/app/page"

type PlayerInputProps = {
  players: Player[]
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onNext: () => void
}

export function PlayerInput({ players, setGameState, onNext }: PlayerInputProps) {
  const [inputMethod, setInputMethod] = useState<"list" | "text">("list")
  const [newPlayerName, setNewPlayerName] = useState("")
  const [bulkText, setBulkText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const addPlayer = () => {
    if (!newPlayerName.trim()) {
      setError("Player name cannot be empty")
      return
    }

    if (players.some((p) => p.name.toLowerCase() === newPlayerName.toLowerCase())) {
      setError("Player name already exists")
      return
    }

    setGameState((prev) => ({
      ...prev,
      players: [
        ...prev.players,
        {
          id: Date.now().toString(),
          name: newPlayerName.trim(),
          status: "alive",
          actions: {},
        },
      ],
    }))
    setNewPlayerName("")
    setError(null)
  }

  const removePlayer = (id: string) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
    }))
  }

  const processBulkText = () => {
    const names = bulkText
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0)

    // Check for duplicates within the new names
    const duplicates = names.filter(
      (name, index, self) => self.findIndex((n) => n.toLowerCase() === name.toLowerCase()) !== index,
    )

    // Check for duplicates with existing players
    const existingDuplicates = names.filter((name) => players.some((p) => p.name.toLowerCase() === name.toLowerCase()))

    if (duplicates.length > 0 || existingDuplicates.length > 0) {
      setError(`Duplicate names found: ${[...duplicates, ...existingDuplicates].join(", ")}`)
      return
    }

    const newPlayers = names.map((name) => ({
      id: Date.now() + Math.random().toString(),
      name,
      status: "alive" as const,
      actions: {},
    }))

    setGameState((prev) => ({
      ...prev,
      players: [...prev.players, ...newPlayers],
    }))
    setBulkText("")
    setError(null)
  }

  const handleNext = () => {
    if (players.length < 5) {
      setError("You need at least 5 players for a good game")
      return
    }
    onNext()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Input Players</CardTitle>
        <CardDescription>
          Enter the names of all players participating in the game. Minimum 5 players recommended for a balanced game.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={inputMethod === "list" ? "default" : "outline"}
              onClick={() => setInputMethod("list")}
              className="flex-1"
            >
              Add One by One
            </Button>
            <Button
              variant={inputMethod === "text" ? "default" : "outline"}
              onClick={() => setInputMethod("text")}
              className="flex-1"
            >
              Bulk Add
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {inputMethod === "list" ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                />
                <Button onClick={addPlayer}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {players.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No players added yet</div>
                ) : (
                  players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span>{player.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => removePlayer(player.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                placeholder="Enter one player name per line"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={5}
              />
              <Button onClick={processBulkText}>
                <Plus className="h-4 w-4 mr-2" />
                Add All
              </Button>

              <div className="space-y-2">
                {players.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No players added yet</div>
                ) : (
                  <div className="p-2 bg-muted rounded-md">
                    <div className="font-medium mb-2">Current Players ({players.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center gap-1 bg-background rounded-md px-2 py-1">
                          <span>{player.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => removePlayer(player.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {players.length} player{players.length !== 1 ? "s" : ""} added
        </div>
        <Button onClick={handleNext} disabled={players.length < 3}>
          Next: Select Roles
        </Button>
      </CardFooter>
    </Card>
  )
}
