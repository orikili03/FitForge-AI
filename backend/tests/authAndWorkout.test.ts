import request from "supertest";
import { app } from "../src/server";
import { connectMongo, mongoose } from "../src/infrastructure/database/mongoClient";

describe("Auth and workout flow", () => {
  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("registers, logs in, and generates a workout", async () => {
    const email = `user+${Date.now()}@example.com`;

    const registerRes = await request(app)
      .post("/auth/register")
      .send({
        email,
        password: "Password123!",
        fitnessLevel: "beginner",
        goals: ["strength"],
        equipmentAccess: ["barbell"],
        movementConstraints: [],
        injuryFlags: [],
      })
      .expect(201);

    expect(registerRes.body.success).toBe(true);
    const token = registerRes.body.data.token as string;
    expect(token).toBeDefined();

    const generateRes = await request(app)
      .post("/workouts/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        timeCapMinutes: 20,
        equipment: ["barbell"],
      })
      .expect(201);

    expect(generateRes.body.success).toBe(true);
    expect(generateRes.body.data.wod).toBeDefined();
    expect(generateRes.body.data.wod.movements.length).toBeGreaterThan(0);
  });
});

