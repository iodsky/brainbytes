import { ConvoGenParam } from "./../../service/llm-service";
import { generateResponse } from "../../service/prompt-service";

const mockPrompt: ConvoGenParam = {
  prompt: "Mock prompt",
  template: "default",
};

const mockResponse = {
  text: "Mock Response",
  image: "",
};

// Mock LLM with no prompt
const mockLLM = {
  invoke: jest.fn(),
};

const mockNoPrompt: ConvoGenParam = { prompt: "", template: "default" };

describe("generate prompt", () => {
  // Missing prompt
  test("should return error when prompt is missing", async () => {
    await expect(generateResponse(mockNoPrompt, mockLLM)).rejects.toThrow(
      "User input is required"
    );
  });

  // With prompt
  test("should return response when prompt is provided", async () => {
    // Configure `invoke` as a Jest mock so we can set its return value
    (mockLLM.invoke as jest.Mock).mockResolvedValue(mockResponse);

    const response = await generateResponse(mockPrompt, mockLLM);
    expect(response).toEqual(mockResponse);
  });

  // With prompt and invoke fails
  test("should return error when llm fails", async () => {
    (mockLLM.invoke as jest.Mock).mockRejectedValue(new Error("LLM Failure"));
    const response = await generateResponse(mockPrompt, mockLLM);

    expect(response).toEqual({
      response: JSON.parse(
        JSON.stringify({ error: "Failed to generate response" })
      ),
      image: "",
    });
  });
});
