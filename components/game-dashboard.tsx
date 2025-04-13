"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Moon, Sun } from "lucide-react"
import type { GameState, Player } from "@/app/page"
import { useTheme } from "next-themes"

type GameDashboardProps = {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onBack: () => void
}

export function GameDashboard({ gameState, setGameState, onBack }: GameDashboardProps) {
  const { setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState(`${gameState.currentPhase.type}-${gameState.currentPhase.number}`)

  const { players, currentPhase } = gameState

  // Count villagers and werewolves
  const villagersCount = players.filter((p) => p.role?.team === "village" && p.status === "alive").length
  const werewolvesCount = players.filter((p) => p.role?.team === "werewolf" && p.status === "alive").length

  // Check if game is over
  const isGameOver = werewolvesCount >= villagersCount || werewolvesCount === 0

  // Move to next phase
  const nextPhase = () => {
    let newPhase

    if (currentPhase.type === "night") {
      newPhase = {
        type: "day" as const,
        number: currentPhase.number,
      }
    } else {
      newPhase = {
        type: "night" as const,
        number: currentPhase.number + 1,
      }
    }

    setGameState((prev) => ({
      ...prev,
      currentPhase: newPhase,
    }))

    setActiveTab(`${newPhase.type}-${newPhase.number}`)

    setTheme(newPhase.type === "night" ? "dark" : "light")
  }

  // Update player status
  const updatePlayerStatus = (playerId: string, status: Player["status"]) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === playerId ? { ...p, status } : p)),
    }))
  }

  // Toggle player action
  const togglePlayerAction = (playerId: string, action: string) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              actions: {
                ...p.actions,
                [action]: !p.actions[action],
              },
            }
          : p,
      ),
    }))
  }

  // Generate tabs for all phases
  const generatePhaseTabs = () => {
    const tabs = []

    // Add current and past phases
    for (let i = 1; i <= currentPhase.number; i++) {
      tabs.push({
        id: `night-${i}`,
        label: `Night ${i}`,
        icon: <Moon className="h-4 w-4" />,
      })

      if (i === currentPhase.number && currentPhase.type === "night") {
        break
      }

      tabs.push({
        id: `day-${i}`,
        label: `Day ${i}`,
        icon: <Sun className="h-4 w-4" />,
      })
    }

    return tabs
  }

  const phaseTabs = generatePhaseTabs()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Game Dashboard</CardTitle>
          <Badge variant={isGameOver ? "destructive" : "outline"} className="text-sm">
            {isGameOver ? "Game Over" : `${currentPhase.type === "night" ? "Night" : "Day"} ${currentPhase.number}`}
          </Badge>
        </div>
        <CardDescription>Track player status and game progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-sm">
                Villagers: {villagersCount}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Werewolves: {werewolvesCount}
              </Badge>
            </div>

            {!isGameOver && (
              <Button onClick={nextPhase}>
                Next: {currentPhase.type === "night" ? "Day" : "Night"}{" "}
                {currentPhase.type === "night" ? currentPhase.number : currentPhase.number + 1}
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 mb-4">
              {phaseTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {phaseTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    {tab.icon} {tab.label}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Player</th>
                          <th className="text-left py-2 px-3">Role</th>
                          <th className="text-left py-2 px-3">Status</th>
                          <th className="text-left py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((player) => (
                          <tr key={player.id} className="border-b">
                            <td className="py-2 px-3">{player.name}</td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <span>{player.role?.icon}</span>
                                <span>{player.role?.name}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <StatusBadge status={player.status} />
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem onClick={() => updatePlayerStatus(player.id, "alive")}>
                                    <StatusBadge status="alive" />
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updatePlayerStatus(player.id, "dead")}>
                                    <StatusBadge status="dead" />
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updatePlayerStatus(player.id, "bitten")}>
                                    <StatusBadge status="bitten" />
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updatePlayerStatus(player.id, "protected")}>
                                    <StatusBadge status="protected" />
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex flex-wrap gap-1">
                                {player.role?.id === "seer" && tab.id.startsWith("night") && (
                                  <Button
                                    variant={player.actions[`checked-${tab.id}`] ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => togglePlayerAction(player.id, `checked-${tab.id}`)}
                                  >
                                    Checked
                                  </Button>
                                )}

                                {player.role?.id === "werewolf" && tab.id.startsWith("night") && (
                                  <Button
                                    variant={player.actions[`bit-${tab.id}`] ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => togglePlayerAction(player.id, `bit-${tab.id}`)}
                                  >
                                    Bit
                                  </Button>
                                )}

                                {tab.id.startsWith("day") && (
                                  <Button
                                    variant={player.actions[`voted-${tab.id}`] ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => togglePlayerAction(player.id, `voted-${tab.id}`)}
                                  >
                                    Voted Out
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Setup
        </Button>

        {isGameOver && (
          <Button variant="default">{werewolvesCount === 0 ? "Villagers Win!" : "Werewolves Win!"}</Button>
        )}
      </CardFooter>
    </Card>
  )
}

function StatusBadge({ status }: { status: Player["status"] }) {
  switch (status) {
    case "alive":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Alive
        </Badge>
      )
    case "dead":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          Dead
        </Badge>
      )
    case "bitten":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
          Bitten
        </Badge>
      )
    case "protected":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Protected
        </Badge>
      )
  }
}
