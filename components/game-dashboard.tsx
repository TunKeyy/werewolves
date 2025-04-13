"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, Clock, HelpCircle, Moon, PencilLine, Sun } from "lucide-react"
import type { GameState, Phase, Player } from "@/app/page"
import { getPhaseKey } from "@/app/page"
import { WhatHappenedDialog } from "@/components/what-happened-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"

type GameDashboardProps = {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  onBack: () => void
}

export function GameDashboard({ gameState, setGameState, onBack }: GameDashboardProps) {
  const { setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState(`${gameState.currentPhase.type}-${gameState.currentPhase.number}`)
  const [phaseTransition, setPhaseTransition] = useState(false)
  const [viewingHistory, setViewingHistory] = useState(false)
  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>(gameState.players)
  const [whatHappenedDialogOpen, setWhatHappenedDialogOpen] = useState(false)
  const [viewWhatHappenedDialogOpen, setViewWhatHappenedDialogOpen] = useState(false)

  const { players, currentPhase, phaseHistory } = gameState

  // Update displayed players when active tab changes
  useEffect(() => {
    if (activeTab === getPhaseKey(currentPhase)) {
      setDisplayedPlayers(players)
      setViewingHistory(false)
    } else if (phaseHistory[activeTab]) {
      setDisplayedPlayers(phaseHistory[activeTab].players)
      setViewingHistory(true)
    } else {
      setDisplayedPlayers(players)
      setViewingHistory(false)
    }
  }, [activeTab, currentPhase, phaseHistory, players])

  // Count villagers and werewolves
  const villagersCount = players.filter((p) => p.role?.team === "village" && p.status === "alive").length
  const werewolvesCount = players.filter((p) => p.role?.team === "werewolf" && p.status === "alive").length

  // Check if game is over
  const isGameOver = werewolvesCount >= villagersCount || werewolvesCount === 0

  // Move to next phase
  const nextPhase = () => {
    let newPhase: Phase

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

    // Set transition animation
    setPhaseTransition(true)

    // Save current state to history
    const currentPhaseKey = getPhaseKey(currentPhase)

    // Update phase after animation
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        currentPhase: newPhase,
        // Store current player state in phase history
        phaseHistory: {
          ...prev.phaseHistory,
          [currentPhaseKey]: {
            players: [...prev.players],
            whatHappened: prev.phaseHistory[currentPhaseKey]?.whatHappened || "",
          },
        },
      }))
      setActiveTab(getPhaseKey(newPhase))

      // End transition
      setTimeout(() => {
        setPhaseTransition(false)
        setTheme(newPhase.type === "day" ? "light" : "dark")
      }, 300)
    }, 300)
  }

  // Update player status
  const updatePlayerStatus = (playerId: string, status: Player["status"]) => {
    if (viewingHistory) return // Don't allow changes in history view

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === playerId ? { ...p, status } : p)),
    }))
  }

  // Update player note
  const updatePlayerNote = (playerId: string, phase: string, note: string) => {
    if (viewingHistory) return // Don't allow changes in history view

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              notes: {
                ...p.notes,
                [phase]: note,
              },
            }
          : p,
      ),
    }))
  }

  // Save what happened text
  const saveWhatHappened = (phaseKey: string, text: string) => {
    setGameState((prev) => ({
      ...prev,
      phaseHistory: {
        ...prev.phaseHistory,
        [phaseKey]: {
          ...(prev.phaseHistory[phaseKey] || { players: [] }),
          whatHappened: text,
        },
      },
    }))
  }

  // Generate tabs for all phases
  const generatePhaseTabs = () => {
    const tabs = []
    const maxPhaseNumber = Math.max(
      currentPhase.number,
      ...Object.keys(phaseHistory)
        .filter((key) => key.startsWith("night-"))
        .map((key) => Number.parseInt(key.split("-")[1])),
    )

    // Add current and past phases
    for (let i = 1; i <= maxPhaseNumber; i++) {
      const nightKey = `night-${i}`
      if (i <= currentPhase.number || phaseHistory[nightKey]) {
        tabs.push({
          id: nightKey,
          label: `Night ${i}`,
          icon: <Moon className="h-4 w-4" />,
        })
      }

      const dayKey = `day-${i}`
      if (
        i < currentPhase.number ||
        (i === currentPhase.number && currentPhase.type === "day") ||
        phaseHistory[dayKey]
      ) {
        tabs.push({
          id: dayKey,
          label: `Day ${i}`,
          icon: <Sun className="h-4 w-4" />,
        })
      }
    }

    return tabs
  }

  const phaseTabs = generatePhaseTabs()

  // Sort players - alive first, then dead/bitten/bombed
  const sortedPlayers = [...displayedPlayers].sort((a, b) => {
    if (a.status !== "dead" && b.status === "dead") return -1
    if (a.status === "dead" && b.status !== "dead") return 1
    return 0
  })

  // Get what happened text for current tab
  const getWhatHappenedText = (phaseKey: string) => {
    return phaseHistory[phaseKey]?.whatHappened || ""
  }

  return (
    <TooltipProvider>
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
          <div className={`space-y-6 transition-opacity duration-300 ${phaseTransition ? "opacity-0" : "opacity-100"}`}>
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
                <Button onClick={nextPhase} className="transition-all duration-200 hover:scale-105">
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

              {viewingHistory && (
                <div className="mb-4 p-2 bg-muted rounded-md flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Viewing historical data from {activeTab}. Changes are not allowed in history view.</span>
                </div>
              )}

              {phaseTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        {tab.icon} {tab.label}
                      </h3>

                      <div className="flex items-center gap-2">
                        {phaseHistory[tab.id]?.whatHappened && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewWhatHappenedDialogOpen(true)}
                                className="h-8 w-8"
                              >
                                <HelpCircle className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View what happened in this phase</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {
                          activeTab === getPhaseKey(currentPhase) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setWhatHappenedDialogOpen(true)}
                              className="flex items-center gap-1"
                              disabled={viewingHistory && tab.id !== activeTab}
                            >
                              <PencilLine className="h-4 w-4" />
                              <span>What Happened?</span>
                            </Button>
                          )
                        }
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">Player</th>
                            <th className="text-left py-2 px-3">Role</th>
                            <th className="text-left py-2 px-3">Status</th>
                            <th className="text-left py-2 px-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedPlayers.map((player) => (
                            <tr
                              key={player.id}
                              className={`border-b transition-colors duration-200 ${
                                player.status === "dead" ? "bg-muted/30 text-muted-foreground" : ""
                              }`}
                            >
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
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={viewingHistory}
                                      className={viewingHistory ? "opacity-80" : ""}
                                    >
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
                                    <DropdownMenuItem onClick={() => updatePlayerStatus(player.id, "bombed")}>
                                      <StatusBadge status="bombed" />
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                              <td className="py-2 px-3">
                                <Textarea
                                  placeholder="Add notes here..."
                                  className="min-h-[60px] text-sm"
                                  value={player.notes?.[tab.id] || ""}
                                  onChange={(e) => updatePlayerNote(player.id, tab.id, e.target.value)}
                                  disabled={viewingHistory}
                                  readOnly={viewingHistory}
                                />
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

        {/* What Happened Dialog for adding entries */}
        <WhatHappenedDialog
          open={whatHappenedDialogOpen}
          onOpenChange={setWhatHappenedDialogOpen}
          phaseKey={activeTab}
          initialValue={getWhatHappenedText(activeTab)}
          onSave={saveWhatHappened}
          isReadOnly={false}
        />

        {/* What Happened Dialog for viewing entries */}
        <WhatHappenedDialog
          open={viewWhatHappenedDialogOpen}
          onOpenChange={setViewWhatHappenedDialogOpen}
          phaseKey={activeTab}
          initialValue={getWhatHappenedText(activeTab)}
          onSave={saveWhatHappened}
          isReadOnly={true}
        />
      </Card>
    </TooltipProvider>
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
    case "bombed":
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
          Bombed
        </Badge>
      )
  }
}
