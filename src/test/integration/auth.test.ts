import { connectDatabase, closeDatabase, clearDatabase } from "../util/test-db";
import User from "../../model/user.model";
import request from "supertest";
import app from "../../app";

const testUser = {
  firstName: "Test",
  lastName: "User",
  email: "testuser@email.com",
  password: "testpassword",
};

const createUser = async () => {
  return await User.create({ ...testUser });
};

const postRegister = async (overrides = {}) => {
  return request(app)
    .post("/auth/register")
    .send({ ...testUser, ...overrides });
};

const postLogin = async (overrides = {}) => {
  return request(app)
    .post("/auth/login")
    .send({ ...testUser, ...overrides });
};

describe("/auth", () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  // Missing fields
  describe("POST /auth/register", () => {
    test("should return 400 if required fields are missing", async () => {
      const res = await postRegister({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });

      expect(res.status).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toBe("Validation failed");
    });

    // Already exists
    test("should return 409 if user already exists", async () => {
      await createUser();

      const res = await postRegister();

      expect(res.status).toEqual(409);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toBe("User already exists");
    });

    // Successful sign up
    test("should return 201 created and create user if data is valid", async () => {
      const res = await postRegister();

      expect(res.status).toEqual(201);
      expect(res.body.success).toEqual(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("POST /auth/login", () => {
    // Successful login
    test("should return 200 and login successfully with valid credentials", async () => {
      await createUser();

      const res = await postLogin();

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.message).toBe("Login success");
    });

    // Non existing user
    test("should return 404 if user does not exist", async () => {
      const res = await postLogin({ email: "nouser@email.com" });

      expect(res.status).toEqual(404);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toBe("User not found");
    });

    // Incorrect password
    test("should return 400 if password is incorrect", async () => {
      await createUser();

      const res = await postLogin({ password: "wrongpassword" });

      expect(res.status).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toBe("Incorrect password");
    });

    // Missing fields
    test("should return 400 if email or password is missing", async () => {
      const res = await postLogin({ email: "", password: "" });

      expect(res.status).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toBe("Email and password required");
    });
  });
});
