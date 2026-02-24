// Temporary seed script — run once to populate test movements
import "dotenv/config";
import mongoose from "mongoose";
import { Movement } from "./models/Movement.js";

const MONGODB_URI = process.env.MONGODB_URI!;

const testMovements = [
    {
        name: "Back Squat",
        abbreviation: "BS",
        modality: "W",
        stimulusTags: ["strength", "power"],
        equipmentRequired: ["barbell"],
        bodyweightOnly: false,
        family: "squat",
        variants: ["Front Squat", "Goblet Squat", "Air Squat"],
        progressions: [
            { level: "beginner", variant: "Air Squat" },
            { level: "scaled", variant: "Goblet Squat" },
            { level: "rx", variant: "Back Squat" },
        ],
        defaultLoadKg: { beginner: 0, scaled: 30, rx: 60 },
        isLoaded: true,
        description: "Barbell back squat — posterior chain and quad strength.",
        cues: ["Chest up", "Drive through heels", "Knees track over toes"],
    },
    {
        name: "Pull-Up",
        modality: "G",
        stimulusTags: ["strength", "skill"],
        equipmentRequired: ["pullup_bar"],
        bodyweightOnly: false,
        family: "pull",
        variants: ["Kipping Pull-Up", "Strict Pull-Up", "Butterfly Pull-Up"],
        progressions: [
            { level: "beginner", variant: "Ring Row" },
            { level: "scaled", variant: "Banded Pull-Up" },
            { level: "rx", variant: "Pull-Up" },
        ],
        isLoaded: false,
        description: "Vertical pulling movement — upper body strength & skill.",
        cues: ["Engage lats", "Full extension at bottom", "Chin over bar"],
    },
    {
        name: "Deadlift",
        abbreviation: "DL",
        modality: "W",
        stimulusTags: ["strength", "power"],
        equipmentRequired: ["barbell"],
        bodyweightOnly: false,
        family: "hinge",
        variants: ["Sumo Deadlift", "Romanian Deadlift"],
        progressions: [
            { level: "beginner", variant: "Kettlebell Deadlift" },
            { level: "scaled", variant: "Deadlift" },
            { level: "rx", variant: "Deadlift" },
        ],
        defaultLoadKg: { beginner: 20, scaled: 50, rx: 100 },
        isLoaded: true,
        description: "Hip hinge pulling from the floor — total body strength.",
        cues: ["Flat back", "Push the floor away", "Lock out hips at top"],
    },
    {
        name: "Push-Up",
        modality: "G",
        stimulusTags: ["strength", "endurance"],
        equipmentRequired: [],
        bodyweightOnly: true,
        family: "press",
        variants: ["Hand-Release Push-Up", "Diamond Push-Up"],
        progressions: [
            { level: "beginner", variant: "Elevated Push-Up" },
            { level: "scaled", variant: "Push-Up" },
            { level: "rx", variant: "Hand-Release Push-Up" },
        ],
        isLoaded: false,
        description: "Horizontal pressing — chest, shoulders, triceps.",
        cues: ["Core tight", "Elbows at 45°", "Full lockout at top"],
    },
    {
        name: "Box Jump",
        abbreviation: "BJ",
        modality: "G",
        stimulusTags: ["power", "coordination"],
        equipmentRequired: ["box"],
        bodyweightOnly: false,
        family: "jump",
        variants: ["Box Step-Up", "Box Jump-Over"],
        progressions: [
            { level: "beginner", variant: "Box Step-Up" },
            { level: "scaled", variant: "Box Jump (20in)" },
            { level: "rx", variant: "Box Jump (24in)" },
        ],
        isLoaded: false,
        description: "Explosive lower body movement — jump onto box.",
        cues: ["Swing arms", "Land softly", "Full hip extension on top"],
    },
    {
        name: "Kettlebell Swing",
        abbreviation: "KBS",
        modality: "W",
        stimulusTags: ["power", "endurance"],
        equipmentRequired: ["kettlebells"],
        bodyweightOnly: false,
        family: "hinge",
        variants: ["Russian Swing", "American Swing"],
        progressions: [
            { level: "beginner", variant: "Russian Kettlebell Swing" },
            { level: "scaled", variant: "Kettlebell Swing" },
            { level: "rx", variant: "American Kettlebell Swing" },
        ],
        defaultLoadKg: { beginner: 8, scaled: 16, rx: 24 },
        isLoaded: true,
        description: "Ballistic hip hinge — posterior chain power and conditioning.",
        cues: ["Hike the bell", "Snap the hips", "Squeeze glutes at top"],
    },
    {
        name: "Row (Erg)",
        modality: "M",
        stimulusTags: ["endurance", "stamina"],
        equipmentRequired: ["rower"],
        bodyweightOnly: false,
        family: "row",
        variants: [],
        progressions: [
            { level: "beginner", variant: "Row (Erg)" },
            { level: "scaled", variant: "Row (Erg)" },
            { level: "rx", variant: "Row (Erg)" },
        ],
        isLoaded: false,
        description: "Full-body monostructural cardio — low impact.",
        cues: ["Legs-back-arms on drive", "Arms-back-legs on recovery"],
    },
    {
        name: "Double-Under",
        abbreviation: "DU",
        modality: "M",
        stimulusTags: ["coordination", "endurance"],
        equipmentRequired: ["jump_rope"],
        bodyweightOnly: false,
        family: "jump",
        variants: ["Single-Under"],
        progressions: [
            { level: "beginner", variant: "Single-Under" },
            { level: "scaled", variant: "Double-Under Attempts" },
            { level: "rx", variant: "Double-Under" },
        ],
        isLoaded: false,
        description: "Jump rope — two rotations per jump.",
        cues: ["Wrists only", "Stay tall", "Small bounce"],
    },
    {
        name: "Burpee",
        modality: "G",
        stimulusTags: ["endurance", "stamina"],
        equipmentRequired: [],
        bodyweightOnly: true,
        family: "full_body",
        variants: ["Burpee Box Jump-Over", "Bar-Facing Burpee"],
        progressions: [
            { level: "beginner", variant: "Step-Back Burpee" },
            { level: "scaled", variant: "Burpee" },
            { level: "rx", variant: "Burpee" },
        ],
        isLoaded: false,
        description: "Full body conditioning movement — down and up.",
        cues: ["Chest to floor", "Jump and clap overhead"],
    },
    {
        name: "Shoulder Press",
        abbreviation: "SP",
        modality: "W",
        stimulusTags: ["strength"],
        equipmentRequired: ["barbell"],
        bodyweightOnly: false,
        family: "press",
        variants: ["Push Press", "Push Jerk", "Dumbbell Press"],
        progressions: [
            { level: "beginner", variant: "Dumbbell Press" },
            { level: "scaled", variant: "Push Press" },
            { level: "rx", variant: "Shoulder Press" },
        ],
        defaultLoadKg: { beginner: 10, scaled: 25, rx: 40 },
        isLoaded: true,
        description: "Overhead pressing — shoulder and tricep strength.",
        cues: ["Tight core", "Press straight up", "Lock out overhead"],
    },
];

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing test data
    await Movement.deleteMany({});
    console.log("Cleared existing movements");

    // Insert test movements
    const result = await Movement.insertMany(testMovements);
    console.log(`Seeded ${result.length} movements`);

    await mongoose.disconnect();
    console.log("Done!");
}

seed().catch(console.error);
