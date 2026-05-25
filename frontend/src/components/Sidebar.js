import React, { useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  X,
  Clock,
} from "lucide-react";
import "./Sidebar.css";

function Sidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateTitle,
  searchQuery,
  onSearch,
  searchResults,
  isSearching,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleEditStart = (conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = (id) => {
    if (editTitle.trim()) {
      onUpdateTitle(id, editTitle);
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewConversation}>
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <X
              size={16}
              className="clear-search"
              onClick={() => onSearch("")}
            />
          )}
        </div>
      </div>

      <div className="conversations-list">
        {isSearching ? (
          <div className="search-results">
            <div className="search-results-header">
              <Clock size={16} />
              <span>Search Results</span>
            </div>
            {searchResults.length === 0 ? (
              <div className="no-results">No results found</div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result.id}
                  className="conversation-item search-result"
                  onClick={() => onSelectConversation(result.id)}
                >
                  <MessageSquare size={16} />
                  <div className="conversation-info">
                    <div className="conversation-title">{result.title}</div>
                    {result.message_content && (
                      <div className="message-preview">
                        {result.message_content.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${currentConversation?.id === conversation.id ? "active" : ""}`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageSquare size={16} />
              {editingId === conversation.id ? (
                <div className="edit-form" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    className="edit-input"
                  />
                  <button
                    className="edit-btn save"
                    onClick={() => handleEditSave(conversation.id)}
                  >
                    ✓
                  </button>
                  <button
                    className="edit-btn cancel"
                    onClick={handleEditCancel}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <span className="conversation-title">
                    {conversation.title}
                  </span>
                  <div className="conversation-actions">
                    <Edit2
                      size={14}
                      className="action-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(conversation);
                      }}
                    />
                    <Trash2
                      size={14}
                      className="action-icon delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this conversation?")) {
                          onDeleteConversation(conversation.id);
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
