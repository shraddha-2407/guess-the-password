const request = require("supertest");
const game = require('./index');
const express = require('express');
const bodyParser = require('body-parser');

const initGame = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(game);
  return app;
}

describe("Test the /new-password endpoint", () => {
  test("It should response the GET method with 200", async () => {
      const res = await request(initGame()).get("/new-password");
      expect(res.statusCode).toBe(200);
  });

  test("It should response the GET method with hint", () => {
    let hint;
    request(initGame()).get('/new-password').then(({ body }) => {
        hint = body.hint;
        expect(hint).toEqual(expect.anything());
    });
  });
});

describe("Test the /verify-password endpoint", () => {
  test("It should response the POST method with status 200 when hint is generated and stored", async () => {
    const app = initGame();
    const { body } = await request(app).get("/new-password");
    const data = {
        hint: body.hint,
        answer: '68901234'
    };
    await request(app).post("/verify-password").send(data).then(async (res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expect.anything());
    });
  });

  test("It should response the POST method with status 404 when hint is not generated and stored", async () => {
    const app = initGame();
    const data = {
        hint: '12093864',
        answer: '68901234'
    };
    await request(app).post("/verify-password").send(data).then(async (res) => {
        expect(res.statusCode).toBe(404);
    });
  });
});