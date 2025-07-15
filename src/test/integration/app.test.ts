import request from "supertest";
import app from "../../app";

describe("GET /health", () => {
  test("should return 200 ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toEqual(200);
  });
});
