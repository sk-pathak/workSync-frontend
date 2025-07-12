import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatService } from '@/lib/services';
import type { Message, User } from '@/types';
import { Loader2 } from 'lucide-react';

interface ChatBoxProps {
  projectId?: string;
  chatId?: string;
  members?: User[];
}

export const ChatBox = ({ chatId: propChatId, members = [] }: ChatBoxProps) => {
  const { id: urlProjectId } = useParams();
  const { user } = useAuthStore();
  const {
    messages,
    setMessagesFromPagedResponse,
    prependMessagesFromPagedResponse,
    addMessage,
    clearMessages,
    pagination
  } = useChatStore();
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const hasMore = currentPage < (pagination.totalPages - 1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  
  const chatId = propChatId || urlProjectId;

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    setCurrentPage(0);
    ChatService.getChatMessages(chatId, 0)
      .then(response => {
        setMessagesFromPagedResponse(response);
        setLoading(false);
      })
      .catch(error => {
        setError('Failed to load chat messages.');
        setLoading(false);
        console.error('Failed to load chat messages:', error);
      });

    return () => {
      clearMessages();
      ChatService.disconnect();
    };
  }, [chatId, setMessagesFromPagedResponse, clearMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = async () => {
      if (container.scrollTop === 0 && hasMore && !loadingMore && chatId) {
        setLoadingMore(true);
        try {
          const nextPage = currentPage + 1;
          const response = await ChatService.getChatMessages(chatId, nextPage);
          prependMessagesFromPagedResponse(response);
          setCurrentPage(response.number || nextPage);
        } catch (err) {
          console.error('[ChatBox] Error loading older messages:', err);
        } finally {
          setLoadingMore(false);
        }
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [chatId, hasMore, loadingMore, currentPage, prependMessagesFromPagedResponse]);

  useEffect(() => {
    if (!loadingMore && messages.length > 0) {
      const newLastMessageId = messages[messages.length - 1]?.id;
      if (lastMessageId !== newLastMessageId) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setLastMessageId(newLastMessageId);
      }
    }
  }, [messages, loadingMore]);

  useEffect(() => {
    if (!chatId) return;
    ChatService.connectToChat(chatId, (message: Message) => {
      addMessage(message);
    });
    setConnected(true);
    return () => {
      ChatService.disconnect();
      setConnected(false);
    };
  }, [chatId, addMessage]);

  useEffect(() => {
    if (!chatId) return;
    let interval: NodeJS.Timeout | undefined;
    function pollMessages() {
      if (!chatId) return;
      ChatService.getChatMessages(chatId)
        .then(response => {
          setMessagesFromPagedResponse(response);
        })
        .catch(error => {
          console.error('Polling failed:', error);
        });
    }
    interval = setInterval(pollMessages, 7000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chatId, setMessagesFromPagedResponse]);

  const handleSend = () => {
    if (!input.trim() || !connected || !user) return;
    ChatService.sendMessage(input);
    setInput('');
  };

  const getSenderName = (m: Message) => {
    if (m.senderId === user?.id) return 'You';
    if (m.sender?.name) return m.sender.name;
    if (m.sender?.username) return m.sender.username;
    const member = members.find(mem => mem.id === m.senderId);
    if (member) return member.name || member.username;
    if (typeof m.senderId === 'string' && m.senderId.length < 20) return m.senderId;
    if (m.senderId) return m.senderId.slice(0, 8) + '...';
    return 'Unknown';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Team Chat
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        </CardTitle>
      </CardHeader>
      <CardContent ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-2 relative">
        {loadingMore && (
          <div className="absolute top-0 left-0 w-full flex justify-center z-10">
            <Loader2 className="animate-spin w-5 h-5 text-muted-foreground my-2" />
          </div>
        )}
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading chat...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No messages yet.</div>
        ) : (
          messages.map((m, idx) => (
            <div key={m.id + idx} className={m.senderId === user?.id ? 'text-right' : 'text-left'}>
              <span className="font-semibold">{getSenderName(m)}</span>
              <div className="inline-block bg-muted rounded px-3 py-1 ml-2">{m.content}</div>
              <div className="text-xs text-muted-foreground">{new Date(m.sentAt).toLocaleTimeString()}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      {!connected && !loading && (
        <div className="text-center text-yellow-500 text-xs pb-2">Disconnected. Trying to reconnect...</div>
      )}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 p-2 border-t"
      >
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={!connected || loading}
        />
        <Button type="submit" disabled={!connected || !input.trim() || loading}>
          Send
        </Button>
      </form>
    </Card>
  );
}
