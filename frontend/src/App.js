import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import "./App.css";

const API_URL = "http://localhost:3001";

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversations`);
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchConversation = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/conversations/${id}`);
      const data = await response.json();
      setCurrentConversation(data.conversation);
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
      });
      const data = await response.json();
      await fetchConversations();
      setCurrentConversation(data);
      setMessages([]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await fetch(`${API_URL}/api/conversations/${id}`, {
        method: "DELETE",
      });
      await fetchConversations();
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const updateConversationTitle = async (id, title) => {
    try {
      await fetch(`${API_URL}/api/conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      await fetchConversations();
    } catch (error) {
      console.error("Error updating conversation:", error);
    }
  };

  const sendMessage = async (content) => {
    if (!currentConversation) {
      await createNewConversation();
      return;
    }

    try {
      // Send user message
      const response = await fetch(
        `${API_URL}/api/conversations/${currentConversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", content }),
        }
      );
      const data = await response.json();
      setMessages([...messages, data]);

      // Auto-name conversation if it's the first message and title is still "New Conversation"
      if (
        messages.length === 0 &&
        currentConversation.title === "New Conversation"
      ) {
        const autoTitle =
          content.length > 30 ? content.substring(0, 30) + "..." : content;
        await updateConversationTitle(currentConversation.id, autoTitle);
        setCurrentConversation({ ...currentConversation, title: autoTitle });
      }

      // Set loading state
      setIsLoading(true);

      // Get AI response from OpenAI
      const aiResponse = await fetch(
        `${API_URL}/api/conversations/${currentConversation.id}/ai-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const aiData = await aiResponse.json();
      setMessages((prev) => [...prev, aiData]);
      await fetchConversations();
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      try {
        const response = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setSearchResults(data.results);
      } catch (error) {
        console.error("Error searching:", error);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={fetchConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onUpdateTitle={updateConversationTitle}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        searchResults={searchResults}
        isSearching={isSearching}
      />
      <ChatArea
        conversation={currentConversation}
        messages={messages}
        onSendMessage={sendMessage}
        onNewConversation={createNewConversation}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
