import { memo, useState, useCallback } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { truncateText, escapeHtml } from '../../utils';
import type { Conversation, Message, User } from '../../types';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: number;
  isActive: boolean;
  isUnread: boolean;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  isUnread,
  onClick,
}: ConversationItemProps) {
  const other = conversation.participants.find(p => p.id !== currentUserId);
  const lastMsg = conversation.messages?.[0];
  const firstLetter = other?.name?.charAt(0).toUpperCase() || '?';

  return (
    <button
      type="button"
      className={`conv-item${isActive ? ' active' : ''}${isUnread ? ' unread' : ''}`}
      onClick={onClick}
      data-name={escapeHtml(other?.name || 'Utilisateur')}
      title={escapeHtml(other?.name || 'Utilisateur')}
    >
      <div className="conv-avatar">
        {firstLetter}
      </div>
      <div className="conv-content">
        <div className="conv-header">
          <span className="conv-name">
            {escapeHtml(other?.name || 'Utilisateur')}
          </span>
          {isUnread && (
            <span className="conv-unread-badge" aria-label="Nouveau message" />
          )}
        </div>
        {lastMsg && (
          <span className="conv-preview">
            {truncateText(escapeHtml(lastMsg.content), 35)}
          </span>
        )}
      </div>
    </button>
  );
}

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: number;
  activeConvId: number | null;
  onSelectConversation: (convId: number) => void;
  isUnread: (conv: Conversation) => boolean;
}

function ConversationList({
  conversations,
  currentUserId,
  activeConvId,
  onSelectConversation,
  isUnread,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <p className="hint">
        Aucune conversation. Demarre un match et clique &quot;Contacter&quot;.
      </p>
    );
  }

  return (
    <aside className="conv-list">
      {conversations.map(conv => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          currentUserId={currentUserId}
          isActive={activeConvId === conv.id}
          isUnread={isUnread(conv)}
          onClick={() => onSelectConversation(conv.id)}
        />
      ))}
    </aside>
  );
}

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
      <span className="msg-content">{escapeHtml(message.content)}</span>
      <span className="msg-meta">{escapeHtml(message.sender?.name || '')}</span>
    </div>
  );
}

interface MessageThreadProps {
  messages: Message[];
  activeConvId: number | null;
  currentUserId: number;
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onSendMessage: (event: React.FormEvent) => void;
  sending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  activeConversation?: Conversation | null;
  onBack?: () => void;
}

function MessageThread({
  messages,
  activeConvId,
  currentUserId,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  sending,
  messagesEndRef,
  activeConversation,
  onBack,
}: MessageThreadProps) {
  if (!activeConvId) {
    return (
      <p className="hint">Selectionne une conversation ou demarre un match.</p>
    );
  }

  const other = activeConversation?.participants.find(p => p.id !== currentUserId);
  const firstLetter = other?.name?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <div className="thread-header">
        {onBack && (
          <button className="thread-header-back" onClick={onBack} aria-label="Retour aux conversations">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        <div className="thread-header-avatar">{firstLetter}</div>
        <div className="thread-header-name">{escapeHtml(other?.name || 'Utilisateur')}</div>
      </div>
      <div className="messages-area">
        {messages.length === 0 ? (
          <p className="hint">Aucun message. Ecris le premier !</p>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.sender?.id === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-form" onSubmit={onSendMessage}>
        <Input
          value={newMessage}
          onChange={e => onNewMessageChange(e.target.value)}
          placeholder="Ecris un message..."
          maxLength={500}
          required
        />
        <Button type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? '...' : 'Envoyer'}
        </Button>
      </form>
    </>
  );
}

interface MessagingPanelProps {
  currentUser: User | null;
  conversations: Conversation[];
  activeConvId: number | null;
  onSelectConversation: (convId: number) => void;
  messages: Message[];
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onSendMessage: (event: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isUnread: (conv: Conversation) => boolean;
  sending: boolean;
}

function MessagingPanel({
  currentUser,
  conversations,
  activeConvId,
  onSelectConversation,
  messages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  messagesEndRef,
  isUnread,
  sending,
}: MessagingPanelProps) {
  const [showThreadMobile, setShowThreadMobile] = useState(false);

  const handleSelectConversation = useCallback((convId: number) => {
    onSelectConversation(convId);
    setShowThreadMobile(true);
  }, [onSelectConversation]);

  const handleBackToList = useCallback(() => {
    setShowThreadMobile(false);
  }, []);

  if (!currentUser) {
    return <p className="hint">Connecte-toi pour acceder a la messagerie.</p>;
  }

  const showThread = activeConvId && showThreadMobile;

  return (
    <div className={`messaging-layout${showThread ? ' messaging-layout--thread-open' : ''}`}>
      <ConversationList
        conversations={conversations}
        currentUserId={currentUser.id}
        activeConvId={activeConvId}
        onSelectConversation={handleSelectConversation}
        isUnread={isUnread}
      />
      <div className="message-thread">
        <MessageThread
          messages={messages}
          activeConvId={activeConvId}
          currentUserId={currentUser.id}
          newMessage={newMessage}
          onNewMessageChange={onNewMessageChange}
          onSendMessage={onSendMessage}
          sending={sending}
          messagesEndRef={messagesEndRef}
          activeConversation={conversations.find(c => c.id === activeConvId)}
          onBack={activeConvId ? handleBackToList : undefined}
        />
      </div>
    </div>
  );
}

export default memo(MessagingPanel);
