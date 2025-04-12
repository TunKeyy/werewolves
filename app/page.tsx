"use client"

import { useState, useEffect } from "react"
import { PlayerInput } from "@/components/player-input"
import { RoleSelection } from "@/components/role-selection"
import { RoleAssignment } from "@/components/role-assignment"
import { GameDashboard } from "@/components/game-dashboard"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Moon, Sun, Users, Eye, Heart, FlaskRoundIcon as Flask, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { JSX } from "react/jsx-runtime"

// Game state types
export type Player = {
  id: string
  name: string
  role?: Role
  status: "alive" | "dead" | "bitten" | "protected"
  actions: Record<string, boolean>
}

export type Role = {
  id: string
  name: string
  description: string
  iconName: string // Store icon name instead of JSX element
  icon?: JSX.Element // Optional JSX element not stored in localStorage
  team: "village" | "werewolf" | "special"
  limit: number
  count: number
}

export type GameState = {
  step: number
  players: Player[]
  availableRoles: Role[]
  selectedRoles: Role[]
  currentPhase: {
    type: "day" | "night"
    number: number
  }
}

// Helper function to get icon component from name
function getIconByName(iconName: string): JSX.Element {
  switch (iconName) {
    case "Users":
      return <Users className="h-5 w-5" />
    case "Moon":
      return <Moon className="h-5 w-5" />
    case "Sun":
      return <Sun className="h-5 w-5" />
    case "Eye":
      return <Eye className="h-5 w-5" />
    case "Heart":
      return <Heart className="h-5 w-5" />
    case "Flask":
      return <Flask className="h-5 w-5" />
    case "Shield":
      return <Shield className="h-5 w-5" />
    default:
      return <Users className="h-5 w-5" />
  }
}

// Helper function to prepare state for localStorage
function prepareStateForStorage(state: GameState): any {
  return {
    ...state,
    availableRoles: state.availableRoles.map((role) => {
      const { icon, ...restRole } = role
      return restRole
    }),
    selectedRoles: state.selectedRoles.map((role) => {
      const { icon, ...restRole } = role
      return restRole
    }),
    players: state.players.map((player) => {
      if (player.role) {
        const { icon, ...restRole } = player.role
        return { ...player, role: restRole }
      }
      return player
    }),
  }
}

// Helper function to rehydrate state from localStorage
function rehydrateState(state: any): GameState {
  return {
    ...state,
    availableRoles: state.availableRoles.map((role: Role) => ({
      ...role,
      icon: getIconByName(role.iconName),
    })),
    selectedRoles: state.selectedRoles.map((role: Role) => ({
      ...role,
      icon: getIconByName(role.iconName),
    })),
    players: state.players.map((player: Player) => {
      if (player.role) {
        return {
          ...player,
          role: {
            ...player.role,
            icon: getIconByName(player.role.iconName),
          },
        }
      }
      return player
    }),
  }
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    step: 1,
    players: [],
    availableRoles: [
      {
        id: "villager",
        name: "Villager",
        description: "A simple villager with no special abilities.",
        iconName: "Users",
        icon: <Users className="h-5 w-5" />,
        team: "village",
        limit: 999,
        count: 0,
      },
      {
        id: "werewolf",
        name: "Werewolf",
        description: "Devours a villager each night. Wins when werewolves equal or outnumber villagers.",
        iconName: "Moon",
        icon: <Moon className="h-5 w-5" />,
        team: "werewolf",
        limit: 999,
        count: 0,
      },
      {
        id: "seer",
        name: "Seer",
        description: "Can check one player's identity each night.",
        iconName: "Eye",
        icon: <Eye className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "witch",
        name: "Witch",
        description: "Has two potions: one to save and one to kill.",
        iconName: "Flask",
        icon: <Flask className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "hunter",
        name: "Hunter",
        description: "Can take someone with them when they die.",
        iconName: "Shield",
        icon: <Shield className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "cupid",
        name: "Cupid",
        description: "Links two players who will die if the other dies.",
        iconName: "Heart",
        icon: <Heart className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
    ],
    selectedRoles: [],
    currentPhase: {
      type: "night",
      number: 1,
    },
  })

  // Load state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem("werewolvesGameState")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        setGameState(rehydrateState(parsedState))
      } catch (e) {
        console.error("Failed to parse saved game state", e)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToStore = prepareStateForStorage(gameState)
      localStorage.setItem("werewolvesGameState", JSON.stringify(stateToStore))
    } catch (e) {
      console.error("Failed to save game state", e)
    }
  }, [gameState])

  const nextStep = () => {
    setGameState((prev) => ({ ...prev, step: prev.step + 1 }))
  }

  const prevStep = () => {
    setGameState((prev) => ({ ...prev, step: prev.step - 1 }))
  }

  const resetGame = () => {
    if (confirm("Are you sure you want to reset the game? All progress will be lost.")) {
      setGameState({
        step: 1,
        players: [],
        availableRoles: gameState.availableRoles.map((role) => ({ ...role, count: 0 })),
        selectedRoles: [],
        currentPhase: {
          type: "night",
          number: 1,
        },
      })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Werewolves Host Assistant</h1>
        <div className="flex items-center gap-2">
          {gameState.step > 1 && (
            <Button variant="outline" size="sm" onClick={resetGame}>
              Reset Game
            </Button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Step {gameState.step} of {gameState.step >= 4 ? 4 : 3}
            </span>
            <span className="text-sm text-muted-foreground">
              {gameState.step === 1 && "Input Players"}
              {gameState.step === 2 && "Select Roles"}
              {gameState.step === 3 && "Assign Roles"}
              {gameState.step >= 4 && "Game Dashboard"}
            </span>
          </div>
          <Progress value={(gameState.step / (gameState.step >= 4 ? 4 : 3)) * 100} className="h-2" />
        </div>

        {gameState.step === 1 && (
          <PlayerInput players={gameState.players} setGameState={setGameState} onNext={nextStep} />
        )}

        {gameState.step === 2 && (
          <RoleSelection gameState={gameState} setGameState={setGameState} onNext={nextStep} onBack={prevStep} />
        )}

        {gameState.step === 3 && (
          <RoleAssignment gameState={gameState} setGameState={setGameState} onNext={nextStep} onBack={prevStep} />
        )}

        {gameState.step >= 4 && <GameDashboard gameState={gameState} setGameState={setGameState} onBack={prevStep} />}
      </main>

      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        Werewolves of Millers Hollow Host Assistant
      </footer>
    </div>
  )
}
