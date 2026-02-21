import {
  Bike,
  Circle,
  Dumbbell,
  Footprints,
  GraduationCap,
  Hand,
  Hop,
  Medal,
  Move,
  Package,
  PersonStanding,
  Pilcrow,
  PlusSquare,
  Shield,
  Swords,
  Timer,
  Weight,
} from "lucide-react";

export type EquipmentCategory = "Gymnastics" | "Strength" | "Conditioning" | "Optional";

export interface EquipmentItem {
  id: string;
  label: string;
  category: EquipmentCategory;
  weightDependent?: boolean;
  Icon: React.ComponentType<{ className?: string }>;
}

export const EQUIPMENT_CATALOG: EquipmentItem[] = [
  // Gymnastics
  { id: "pullup_bar", label: "Pull-up bar", category: "Gymnastics", Icon: PersonStanding },
  { id: "rings", label: "Rings", category: "Gymnastics", Icon: Move },
  { id: "jump_rope", label: "Jump rope", category: "Gymnastics", Icon: Hop },
  { id: "abmat", label: "Ab mat", category: "Gymnastics", Icon: Shield },

  // Strength
  { id: "barbell", label: "Barbell", category: "Strength", weightDependent: true, Icon: Weight },
  { id: "dumbbells", label: "Dumbbells", category: "Strength", weightDependent: true, Icon: Dumbbell },
  { id: "kettlebells", label: "Kettlebells", category: "Strength", weightDependent: true, Icon: Circle },
  { id: "plates", label: "Plates", category: "Strength", Icon: PlusSquare },
  { id: "rack", label: "Rack", category: "Strength", Icon: Swords },

  // Conditioning
  { id: "rower", label: "Rower", category: "Conditioning", Icon: Timer },
  { id: "assault_bike", label: "Bike", category: "Conditioning", Icon: Bike },
  { id: "run", label: "Running", category: "Conditioning", Icon: Footprints },

  // Optional
  { id: "wall_ball", label: "Wall ball", category: "Optional", Icon: Medal },
  { id: "box", label: "Plyo box", category: "Optional", Icon: Package },
  { id: "mat", label: "Floor mat", category: "Optional", Icon: Hand },
  { id: "chalk", label: "Chalk", category: "Optional", Icon: Pilcrow },
  { id: "coach_mode", label: "Coach mode", category: "Optional", Icon: GraduationCap },
];

export const BUILTIN_PRESETS: Array<{
  id: "none" | "travel" | "home" | "full" | "custom";
  name: string;
  description: string;
  selected: Array<{ id: string; minWeight?: number; maxWeight?: number }>;
}> = [
  {
    id: "none",
    name: "No equipment",
    description: "Bodyweight only, no gear.",
    selected: [],
  },
  {
    id: "home",
    name: "Home/Garage",
    description: "Common home setup.",
    selected: [
      { id: "barbell", minWeight: 20, maxWeight: 100 },
      { id: "plates" },
      { id: "pullup_bar" },
      { id: "jump_rope" },
      { id: "kettlebells", minWeight: 8, maxWeight: 32 },
    ],
  },
  {
    id: "full",
    name: "Full Box",
    description: "Everything (typical affiliate).",
    selected: [
      { id: "barbell", minWeight: 20, maxWeight: 150 },
      { id: "plates" },
      { id: "rack" },
      { id: "dumbbells", minWeight: 5, maxWeight: 50 },
      { id: "kettlebells", minWeight: 8, maxWeight: 40 },
      { id: "rower" },
      { id: "assault_bike" },
      { id: "pullup_bar" },
      { id: "rings" },
      { id: "jump_rope" },
      { id: "wall_ball" },
      { id: "box" },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    description: "Light gear, bodyweight-friendly.",
    selected: [
      { id: "jump_rope" },
      { id: "mat" },
      { id: "pullup_bar" },
    ],
  },
  {
    id: "custom",
    name: "Custom",
    description: "Build your own below, then Save as.",
    selected: [],
  },
];

