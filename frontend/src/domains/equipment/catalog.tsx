import {
    Dumbbell,
    Bike,
    Circle,
    Package,
    Minus,
    BarChart3,
    Waves,
    Frame,
    type LucideIcon,
} from "lucide-react";

export type EquipmentCategory = "Gymnastics" | "Strength" | "Conditioning" | "Optional";

export interface EquipmentCatalogItem {
    id: string;
    label: string;
    category: EquipmentCategory;
    Icon: LucideIcon;
    weightDependent?: boolean;
}

export const EQUIPMENT_CATALOG: EquipmentCatalogItem[] = [
    { id: "pullup_bar", label: "Pull-up bar", category: "Gymnastics", Icon: BarChart3 },
    { id: "rings", label: "Rings", category: "Gymnastics", Icon: Circle },
    { id: "box", label: "Box", category: "Gymnastics", Icon: Package },
    { id: "rack", label: "Squat Rack / Rig", category: "Strength", Icon: Frame },
    { id: "barbell", label: "Barbell", category: "Strength", Icon: Dumbbell, weightDependent: true },
    { id: "kettlebells", label: "Kettlebells", category: "Strength", Icon: Dumbbell, weightDependent: true },
    { id: "dumbbells", label: "Dumbbells", category: "Strength", Icon: Dumbbell, weightDependent: true },
    { id: "rower", label: "Rower", category: "Conditioning", Icon: Waves },
    { id: "assault_bike", label: "Assault bike", category: "Conditioning", Icon: Bike },
    { id: "jump_rope", label: "Jump rope", category: "Conditioning", Icon: Minus },
];

export interface BuiltinPreset {
    id: string;
    name: string;
    description: string;
    selected: Array<{ id: string; minWeight?: number; maxWeight?: number }>;
}

export const BUILTIN_PRESETS: BuiltinPreset[] = [
    { id: "none", name: "No equipment", description: "Bodyweight only", selected: [] },
    {
        id: "travel",
        name: "Travel",
        description: "Minimal equipment",
        selected: [{ id: "pullup_bar" }, { id: "jump_rope" }],
    },
    {
        id: "home",
        name: "Home / Garage",
        description: "Barbell + basics",
        selected: [
            { id: "rack" },
            { id: "barbell" },
            { id: "pullup_bar" },
            { id: "kettlebells" },
            { id: "dumbbells" },
            { id: "jump_rope" },
        ],
    },
    {
        id: "full",
        name: "Full box",
        description: "Full gym access",
        selected: EQUIPMENT_CATALOG.map((e) => ({ id: e.id })),
    },
    { id: "custom", name: "Custom", description: "Create your own preset", selected: [] },
];
