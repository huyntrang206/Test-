const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey:
    "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",
  baseURL: "https://openrouter.ai/api/v1",
});

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Get all conversations
app.get("/api/conversations", (req, res) => {
  const sql = "SELECT * FROM conversations ORDER BY updated_at DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ conversations: rows });
  });
});

// Get single conversation with messages
app.get("/api/conversations/:id", (req, res) => {
  const { id } = req.params;
  const conversationSql = "SELECT * FROM conversations WHERE id = ?";
  const messagesSql =
    "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC";

  db.get(conversationSql, [id], (err, conversation) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    db.all(messagesSql, [id], (err, messages) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ conversation, messages });
    });
  });
});

// Create new conversation
app.post("/api/conversations", (req, res) => {
  const { title } = req.body;
  const sql = "INSERT INTO conversations (title) VALUES (?)";

  db.run(sql, [title || "New Conversation"], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      id: this.lastID,
      title: title || "New Conversation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });
});

// Update conversation title
app.put("/api/conversations/:id", (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const sql =
    "UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

  db.run(sql, [title, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Conversation updated" });
  });
});

// Delete conversation
app.delete("/api/conversations/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM conversations WHERE id = ?";

  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Conversation deleted" });
  });
});

// Add message to conversation
app.post("/api/conversations/:id/messages", (req, res) => {
  const { id } = req.params;
  const { role, content } = req.body;
  const sql =
    "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)";

  db.run(sql, [id, role, content], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Update conversation timestamp
    db.run(
      "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    res.json({
      id: this.lastID,
      conversation_id: id,
      role,
      content,
      created_at: new Date().toISOString(),
    });
  });
});

// Get AI response from OpenAI
app.post("/api/conversations/:id/ai-response", async (req, res) => {
  const { id } = req.params;

  try {
    // Get conversation history
    const messagesSql =
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC";
    db.all(messagesSql, [id], async (err, messages) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Format messages for OpenAI API
      const openaiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: openaiMessages,
          max_tokens: 1000,
        });

        const aiResponse = completion.choices[0].message.content;

        // Save AI response to database
        const insertSql =
          "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)";
        db.run(insertSql, [id, "assistant", aiResponse], function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          // Update conversation timestamp
          db.run(
            "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [id]
          );

          res.json({
            id: this.lastID,
            conversation_id: id,
            role: "assistant",
            content: aiResponse,
            created_at: new Date().toISOString(),
          });
        });
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
        res
          .status(500)
          .json({ error: "Failed to get AI response: " + openaiError.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search conversations and messages
app.get("/api/search", (req, res) => {
  const { q } = req.query;
  if (!q) {
    res.status(400).json({ error: "Search query required" });
    return;
  }

  const searchTerm = `%${q}%`;
  const sql = `
    SELECT DISTINCT c.*, m.role, m.content as message_content
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
    WHERE c.title LIKE ? OR m.content LIKE ?
    ORDER BY c.updated_at DESC
  `;

  db.all(sql, [searchTerm, searchTerm], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ results: rows });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
