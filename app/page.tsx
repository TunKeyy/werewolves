"use client"

import { useState, useEffect } from "react"
import { PlayerInput } from "@/components/player-input"
import { getIconByName, RoleSelection } from "@/components/role-selection"
import { RoleAssignment } from "@/components/role-assignment"
import { GameDashboard } from "@/components/game-dashboard"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Moon,
  Users,
  Eye,
  Heart,
  FlaskRoundIcon as Flask,
  Crown,
  Bomb,
  Baby,
  CloudMoon,
  EyeOff,
  KeyRound,
  MoonStar,
  Music2,
  ShieldCheck,
  Smile,
  SunMoon,
  UserCheck,
  UserMinus,
  Sword,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { JSX } from "react/jsx-runtime"

// Game state types
export type Player = {
  id: string
  name: string
  role?: Role
  status: "alive" | "dead" | "bitten" | "protected" | "bombed"
  actions: Record<string, boolean>
  notes: Record<string, string>
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

export type PhaseType = "day" | "night"

export type Phase = {
  type: PhaseType
  number: number
}

export type PhaseData = {
  players: Player[]
  whatHappened?: string
}

export type PhaseHistory = {
  [key: string]: PhaseData // key format: "day-1", "night-1", etc.
}

export type GameState = {
  step: number
  players: Player[]
  availableRoles: Role[]
  selectedRoles: Role[]
  currentPhase: Phase
  phaseHistory: PhaseHistory
}

// Helper function to prepare state for localStorage
function prepareStateForStorage(state: GameState) {
  return {
    ...state,
    availableRoles: state.availableRoles.map((role) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { icon, ...restRole } = role
      return restRole
    }),
    selectedRoles: state.selectedRoles.map((role) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { icon, ...restRole } = role
      return restRole
    }),
    players: state.players.map((player) => {
      if (player.role) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { icon, ...restRole } = player.role
        return { ...player, role: restRole }
      }
      return player
    }),
    phaseHistory: Object.entries(state.phaseHistory).reduce((acc, [phase, phaseData]) => {
      acc[phase] = {
        ...phaseData,
        players: phaseData.players.map((player) => {
          if (player.role) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { icon, ...restRole } = player.role
            return { ...player, role: restRole }
          }
          return player
        }),
      }
      return acc
    }, {} as PhaseHistory),
  }
}

// Helper function to rehydrate state from localStorage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          // Ensure notes field exists
          notes: player.notes || {},
        }
      }
      return {
        ...player,
        notes: player.notes || {},
      }
    }),
    phaseHistory: Object.entries(state.phaseHistory || {}).reduce((acc, [phase, phaseData]) => {
      acc[phase] = {
        ...phaseData as PhaseData,
        players: (phaseData as PhaseData).players.map((player) => {
          if (player.role) {
            return {
              ...player,
              role: {
                ...player.role,
                icon: getIconByName(player.role.iconName),
              },
              notes: player.notes || {},
            }
          }
          return {
            ...player,
            notes: player.notes || {},
          }
        }),
      }
      return acc
    }, {} as PhaseHistory),
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
        iconName: "Sword",
        icon: <Sword className="h-5 w-5" />,
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
      {
        id: "protector",
        name: "Protector",
        description: "Protects one person each night from being bitten.",
        iconName: "ShieldCheck",
        icon: <ShieldCheck className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "white-wolf",
        name: "White Wolf",
        description: "Kills villagers at night and werewolves every other night.",
        iconName: "MoonStar",
        icon: <MoonStar className="h-5 w-5" />,
        team: "werewolf",
        limit: 1,
        count: 0,
      },
      {
        id: "half-wolf",
        name: "Half Wolf",
        description: "Appears as a villager to the Seer, but may turn into a werewolf.",
        iconName: "ClouldMoon",
        icon: <CloudMoon className="h-5 w-5" />,
        team: "werewolf",
        limit: 1,
        count: 0,
      },
      {
        id: "thief",
        name: "Thief",
        description: "Chooses one of two extra roles at game start.",
        iconName: "KeyRound",
        icon: <KeyRound className="h-5 w-5" />,
        team: "special",
        limit: 1,
        count: 0,
      },
      {
        id: "bomber",
        name: "Bomber",
        description: "Can bomb one player during the game.",
        iconName: "Bomb",
        icon: <Bomb className="h-5 w-5" />,
        team: "special",
        limit: 1,
        count: 0,
      },
      {
        id: "moon-lady",
        name: "Moon Lady",
        description: "A mysterious character with unique powers (custom rules).",
        iconName: "SunMoon",
        icon: <SunMoon className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "prince",
        name: "Prince",
        description: "Immune to elimination by voting.",
        iconName: "Crown",
        icon: <Crown className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "elder",
        name: "Elder",
        description: "Survives the first attack.",
        iconName: "UserCheck",
        icon: <UserCheck className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "idiot",
        name: "Idiot",
        description: "If voted out, reveals role but remains in the game.",
        iconName: "Smile",
        icon: <Smile className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "little-girl",
        name: "Little Girl",
        description: "Can peek during the wolves' turn but risks death if seen.",
        iconName: "EyeOff",
        icon: <EyeOff className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "scapegoat",
        name: "Scapegoat",
        description: "Gets eliminated during vote ties and picks next voters.",
        iconName: "UserMinus",
        icon: <UserMinus className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      },
      {
        id: "pied-piper",
        name: "Pied Piper",
        description: "Charms players each night. Wins if all others are charmed or dead.",
        iconName: "Music2",
        icon: <Music2 className="h-5 w-5" />,
        team: "special",
        limit: 1,
        count: 0,
      },
      {
        id: "wild-child",
        name: "Wild Child",
        description: "Picks a role model. If they die, becomes a werewolf.",
        iconName: "Baby",
        icon: <Baby className="h-5 w-5" />,
        team: "village",
        limit: 1,
        count: 0,
      }
    ],
    selectedRoles: [],
    currentPhase: {
      type: "night",
      number: 1,
    },
    phaseHistory: {},
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
        phaseHistory: {},
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
