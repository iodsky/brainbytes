import request from "supertest";
import app from "../../app";
import { clearDatabase, closeDatabase, connectDatabase } from "../util/test-db";
import User, { IUser } from "../../model/user.model";
import Chat, { IChat, Subject } from "../../model/chat.model";
import * as promptService from "../../service/prompt-service";
import { PromptResponse } from "../../service/prompt-service";

const testUser = {
  firstName: "Test",
  lastName: "User",
  email: "testuser@email.com",
  password: "testpassword",
};

const mockResponse: PromptResponse<"default"> = {
  response: {
    response: "Mock response",
  },
  image: "",
};

describe("/message", () => {
  const testAgent = request.agent(app);
  let loggedInUser: IUser;
  let testChat: IChat;

  beforeAll(async () => {
    await connectDatabase();

    loggedInUser = await User.create(testUser);

    const res = await testAgent
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);

    testChat = await Chat.create({
      user: loggedInUser._id,
      title: "Test title",
      subject: Subject.MATH,
    });
  });

  afterAll(async () => {
    await clearDatabase();

    await closeDatabase();
  });

  test("should return 201 and metadata", async () => {
    jest
      .spyOn(promptService, "generateResponse")
      .mockResolvedValue(mockResponse);

    const res = await testAgent.post(`/message/${testChat.id}`).send({
      prompt: "What is 1 + 1",
    });

    expect(res.status).toEqual(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.chat).toEqual(testChat.id);
    expect(res.body.data.json_response.response).toEqual(
      mockResponse.response.response
    );
  });

  test("should return 200 and messages", async () => {
    const res = await testAgent.get(`/message/${testChat.id}`);

    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toEqual(1);
  });
});
