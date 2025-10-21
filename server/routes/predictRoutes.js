// routes/predictRoutes.js
const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const data = req.body;
  console.log("Received prediction request:", data);

  // Dummy logic (replace with ML model logic later)
  const result = {
    prediction: "Positive", // or "Negative"
    confidence: 0.85,
  };

  res.json(result);
});

module.exports = router;
