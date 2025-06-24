import { clearDatabase, closeDatabase, connectDatabase } from "../util/test-db";
import app from "../../app";
import request from "supertest";
import User, { IUser } from "../../model/user.model";
import * as promptService from "../../service/prompt-service";
import Chat, { Subject } from "../../model/chat.model";

const testUser = {
  firstName: "Test",
  lastName: "User",
  email: "testuser@email.com",
  password: "testpassword",
};

const mockChatMetaData = {
  text: JSON.stringify({
    title: "Mock Title",
    subject: Subject.GENERAL_KNOWLEDGE,
  }),
  image: "",
};

const mockResponse = {
  text: JSON.stringify({
    response:
      "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.",
  }),
  image: "",
};

describe("/chat", () => {
  const testAgent = request.agent(app);
  let loggedInUser: IUser;

  const createChat = async () => {
    return await Chat.create({
      user: loggedInUser._id,
      title: "Test",
      subject: Subject.GENERAL_KNOWLEDGE,
    });
  };

  beforeAll(async () => {
    await connectDatabase();

    // Save test user
    loggedInUser = await User.create(testUser);

    // Login to obtain token
    const res = await testAgent.post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  afterAll(async () => {
    // Clear
    await clearDatabase();
    // Close
    await closeDatabase();
  });

  test("should return 201 and metdata if created", async () => {
    jest
      .spyOn(promptService, "generateResponse")
      .mockResolvedValueOnce(mockChatMetaData)
      .mockResolvedValueOnce(mockResponse);

    const res = await testAgent
      .post("/chat/")
      .send({ prompt: "What is photosynthesis?" });

    expect(res.status).toEqual(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.chat.title).toEqual("Mock Title");
    expect(res.body.data.chat.subject).toEqual("general_knowledge");
    expect(res.body.data.message.response).toEqual(
      JSON.parse(mockResponse.text).response
    );
  });

  test("should return 200 and data", async () => {
    const res = await testAgent.get("/chat/");

    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toEqual(1);
  });

  test("should return 200 if chat deleted", async () => {
    const chat = await createChat();

    const res = await testAgent.delete(`/chat/${chat.id}`);

    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  test("should return 200 if chat updated", async () => {
    const chat = await createChat();

    const res = await testAgent
      .patch(`/chat/${chat.id}`)
      .send({ title: "Updated" });

    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.title).toEqual("Updated");
  });
});
