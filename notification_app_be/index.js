import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/register", (req, res) => {
  return res.status(201).json({
    message: "Registration endpoint placeholder",
    data: req.body,
  });
});

app.post("/notifications", (req, res) => {
  return res.status(200).json({
    message: "Notification received",
    payload: req.body,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Notification backend placeholder running on http://localhost:${PORT}`);
});
