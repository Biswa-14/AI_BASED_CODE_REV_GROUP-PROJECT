import { useEffect, useState } from 'react';
import { History, MessageSquarePlus, MoreHorizontal, Trash2 } from 'lucide-react';

import { useAuth } from '../context/auth-context';
import { fetchJson } from '../lib/api';
import { cn } from '../lib/utils';

export function ConversationSidebar({ activeConversationId, onNewConversation, onSelectConversation, refreshKey }) {
  const { isAuthenticated, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const loadConversations = async () => {
    if (!isAuthenticated || !token) {
      setConversations([]);
      return;
    }

    try {
      const payload = await fetchJson('/conversations/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(payload.conversations ?? []);
    } catch {
      setConversations([]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [isAuthenticated, token, refreshKey]);

  const handleDelete = async (event, conversationId) => {
    event.stopPropagation();
    if (!token) return;

    try {
      await fetchJson(`/conversations/${conversationId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((current) => current.filter((item) => item.id !== conversationId));
      setOpenMenuId(null);
      if (activeConversationId === conversationId) onNewConversation();
    } catch {
      setOpenMenuId(null);
    }
  };

  return (
    <aside className="conversation-sidebar" aria-label="Conversation history">
      <button type="button" className="conversation-sidebar__new" onClick={onNewConversation}>
        <MessageSquarePlus className="h-4 w-4" />
        <span>New chat</span>
      </button>

      <div className="conversation-sidebar__label">
        <History className="h-3.5 w-3.5" />
        <span>{isAuthenticated ? 'Recent chats' : 'Conversation history'}</span>
      </div>

      <div className="conversation-sidebar__list">
        {!isAuthenticated ? (
          <p className="conversation-sidebar__empty">Sign in to keep chats here and return to them anytime.</p>
        ) : conversations.length === 0 ? (
          <p className="conversation-sidebar__empty">Your saved chats will appear here.</p>
        ) : (
          conversations.map((conversation) => (
            <div key={conversation.id} className="conversation-sidebar__item-wrap">
              <button
                type="button"
                className={cn(
                  'conversation-sidebar__item',
                  activeConversationId === conversation.id && 'conversation-sidebar__item--active',
                )}
                onClick={() => onSelectConversation(conversation.id)}
                title={conversation.title}
              >
                <span>{conversation.title}</span>
              </button>
              <button
                type="button"
                aria-label={`Options for ${conversation.title}`}
                className="conversation-sidebar__more"
                onClick={() => setOpenMenuId((current) => (current === conversation.id ? null : conversation.id))}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {openMenuId === conversation.id && (
                <button
                  type="button"
                  className="conversation-sidebar__delete"
                  onClick={(event) => handleDelete(event, conversation.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete chat
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
