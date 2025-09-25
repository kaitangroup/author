'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Send, MoreVertical, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import {
  acGetMessages,
  acSendMessage,
  ACMessage,
  ConversationItem,
  buildConversationFromMessages,
  WP_API_BASE,
} from '@/lib/authorconnect';

/* ================= Utils ================= */
type WPUserLite = { id: number; name: string; avatar?: string , role?: string};
type ConvWithPresence = ConversationItem & {
  isActive: boolean;
  hasMessages?: boolean;
  unread?: boolean;
  role?: string;
};

function initials(name?: string) {
  if (!name) return '?';
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || name[0]?.toUpperCase() || '?';
}

/* ======== Local API helpers ======== */
async function ensureOk(res: Response, label: string) {
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`${label} (${res.status}): ${t || res.statusText}`);
  }
}

async function updateMessageAPI(id: number, content: string, token: string, otherUserId: number) {
  const url = `${WP_API_BASE}/authorconnect/v1/messages/${id}?other_user=${otherUserId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });
  await ensureOk(res, 'Update message failed');
  return res.json() as Promise<{ status: string; id: number; content: string }>;
}

async function deleteMessageAPI(id: number, token: string, otherUserId: number) {
  const url = `${WP_API_BASE}/authorconnect/v1/messages/${id}?other_user=${otherUserId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await ensureOk(res, 'Delete message failed');
  return res.json() as Promise<{ status: string; id: number }>;
}

function onComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.nativeEvent?.isComposing) return;
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  }
}

/* ================= Page ================= */
export default function MessagesPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const onlyUserParam = searchParams.get('to'); // /messages?to=123
  const onlyUserId = onlyUserParam ? Number(onlyUserParam) : null;

  // আমার ইউজার (/me)
  const [myId, setMyId] = useState<number | null>(null);
  const [myName, setMyName] = useState<string>('');
  const [myAvatar, setMyAvatar] = useState<string>('');

  // লেফট সাইড
  const [users, setUsers] = useState<WPUserLite[]>([]);
  const [conversations, setConversations] = useState<ConvWithPresence[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // রাইট সাইড (চ্যাট)
  const [messages, setMessages] = useState<ACMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const composeRef = useRef<HTMLTextAreaElement | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // মেনু/এডিট স্টেট
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // unread ট্র্যাকিং
  const [lastSeenAt, setLastSeenAt] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('ac_last_seen') || '{}'); } catch { return {}; }
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ac_last_seen', JSON.stringify(lastSeenAt));
    }
  }, [lastSeenAt]);

  useEffect(() => {
    setToken(localStorage.getItem('wpToken'));
  }, [session, status]);

  /* ===== /me ===== */
  useEffect(() => {
    let alive = true;
    if (!token) { setMyId(null); setMyName(''); setMyAvatar(''); return () => { alive = false; }; }

    (async () => {
      try {
        const res = await fetch(`${WP_API_BASE}/authorconnect/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await ensureOk(res, '/me failed');
        const me = await res.json();
        if (!alive) return;
        setMyId(me?.id ?? null);
        setMyName(me?.name ?? '');
        setMyAvatar(me?.avatar ?? '');
      } catch (err: any) {
        if (!alive) return;
        console.error(err);
        toast.error(err?.message || 'Failed to load current user');
      }
    })();

    return () => { alive = false; };
  }, [token]);

  /* ===== Users (sidebar) ===== */
useEffect(() => {
  if (!token) return;
  let mounted = true;

  (async () => {
    try {
      // Build URL and include ?to=<id> when present
      const usersUrl = new URL(`${WP_API_BASE}/authorconnect/v1/users`);
      if (onlyUserId) usersUrl.searchParams.set('to', String(onlyUserId));

      const res = await fetch(usersUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      await ensureOk(res, '/users failed');
      const data = await res.json();
      const list: WPUserLite[] = (data?.users || []).map((u: any) => ({
        id: u.id, name: u.name, avatar: u.avatar,role: u.role,
      }));

      if (!mounted) return;

      if (onlyUserId) {
        const target = list.find(u => u.id === onlyUserId);
        const merged: WPUserLite[] = target
          ? [target, ...list.filter(u => u.id !== onlyUserId)]
          : [{ id: onlyUserId, name: '(loading...)', avatar: '' }, ...list];
        setUsers(merged);
        setSelectedUserId(prev => prev ?? onlyUserId);
      } else {
        setUsers(list);
        setSelectedUserId(prev => prev ?? (list[0]?.id ?? null));
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to load users');
    }
  })();

  return () => { mounted = false; };
}, [token, onlyUserId]);


  /* ===== Conversations (only with messages) ===== */
  /* ===== Conversations (sidebar metadata; no message fetching here) ===== */
useEffect(() => {
  if (!token || users.length === 0) return;

  // Build shallow list from users only (no per-user message fetch).
  const list: ConvWithPresence[] = users.map((u) => ({
    // The ConversationItem fields that buildConversationFromMessages would set
    userId: u.id,
    participant: u.name,
    role: u.role,
    avatar: u.avatar || '',
    lastMessage: '',       // unknown until thread is opened
    timestamp: '',         // unknown until thread is opened
    // Presence/flags we can best-effort guess (or leave false)
    isActive: false,
    hasMessages: undefined,
    unread: false,
  }));

  // Optional: if URL param points to a user not in the fetched list yet,
  // ensure they still appear at the top (already handled in your users effect).
  setConversations(list);
}, [token, users]);

/* ===== After messages load, backfill that conversation's preview/unread ===== */
useEffect(() => {
  if (!selectedUserId) return;
  if (!messages.length) {
    // If empty, still mark unread=false & clear preview
    setConversations((prev) =>
      prev.map((c) =>
        c.userId === selectedUserId
          ? { ...c, lastMessage: '', timestamp: '', unread: false, hasMessages: false }
          : c
      )
    );
    return;
  }

  const selUser = users.find((u) => u.id === selectedUserId);
  if (!selUser) return;

  // Build preview from the messages we *just* fetched for this user
  const conv = buildConversationFromMessages(
    selUser.id,
    selUser.name,
    selUser.role ?? '', 
    selUser.avatar,
    messages
  );



  // Compute unread for the selected user based on lastSeenAt
  const last = messages[messages.length - 1];
  const seenISO = lastSeenAt[String(selectedUserId)];
  let unread = false;
  if (last && myId != null && last.from !== myId && last.timestamp) {
    if (!seenISO || new Date(seenISO) < new Date(last.timestamp)) unread = true;
  }

  setConversations((prev) =>
    prev.map((c) =>
      c.userId === selectedUserId
        ? { ...c, ...conv, hasMessages: true, unread }
        : c
    )
  );
}, [messages, selectedUserId, users, myId, lastSeenAt]);



  /* ===== Thread load + polling ===== */
  useEffect(() => {
    if (selectedUserId == null || !token) return;
    const userId = selectedUserId;
    let mounted = true;

    const loadThread = async (initial = false) => {
      try {
        if (initial) setLoading(true);
        const data = await acGetMessages(userId, 'ASC', token);
        if (!mounted) return;
        setMessages(data.messages || []);
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Failed to load messages');
      } finally {
        if (initial) setLoading(false);
      }
    };

    loadThread(true);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadThread(false), 5000);

    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedUserId, token]);

  /* ===== unread → read ===== */
  useEffect(() => {
    if (!selectedUserId) return;
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (!last?.timestamp) return;

    setLastSeenAt((prev) => ({ ...prev, [String(selectedUserId)]: last.timestamp ?? '' }));

    setConversations((prev) =>
      prev.map((c) => (c.userId === selectedUserId ? { ...c, unread: false } : c))
    );
  }, [messages, selectedUserId]);

  /* ===== Send / Update ===== */
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId || !token || myId == null) return;

    const text = newMessage.trim();
    if (!text) return;

    if (editingId) {
      try {
        setSending(true);
        const r = await updateMessageAPI(editingId, text, token, selectedUserId);
        setMessages(prev => prev.map(m => (m.id === editingId ? { ...m, id: r.id, content: r.content } : m)));
        setEditingId(null);
        setNewMessage('');
        toast.success('Message updated');
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Update failed');
      } finally {
        setSending(false);
      }
      return;
    }

    setSending(true);
    const tempId = Date.now();
    const optimistic: ACMessage = {
      id: tempId,
      from: myId,
      to: selectedUserId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await acSendMessage(selectedUserId, newMessage, token);
      setNewMessage('');
      toast.success('Message sent!');
      const convData = await acGetMessages(selectedUserId, 'ASC', token);
      setMessages(convData.messages || []);
    } catch (e: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      console.error(e);
      toast.error(e?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  /* ===== Delete ===== */
  async function handleDelete(messageId: number) {
    if (!token || !selectedUserId) return;
    try {
      await deleteMessageAPI(messageId, token, selectedUserId);
      const data = await acGetMessages(selectedUserId, 'ASC', token);
      setMessages(data.messages || []);
      setMenuFor(null);
      toast.success('Message deleted');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Delete failed');
    }
  }

  /* ===== Edit helpers ===== */
  function startEdit(m: ACMessage) {
    setEditingId(m.id);
    const plain = m.content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
    setNewMessage(plain);
    setMenuFor(null);
    setTimeout(() => composeRef.current?.focus(), 0);
  }
  function cancelEdit() { setEditingId(null); setNewMessage(''); }

  /* ===== UI niceties ===== */
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (!el.closest?.('[data-msg-menu]')) setMenuFor(null);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const base = conversations;
    if (!q) return base;
    return base.filter((c) => c.participant.toLowerCase().includes(q));
  }, [conversations, searchTerm]);

  const selectedConv = conversations.find(c => c.userId === selectedUserId);
  const selectedName = selectedConv?.participant || users.find(u => u.id === selectedUserId)?.name || '';
  const selectedAvatar = selectedConv?.avatar || users.find(u => u.id === selectedUserId)?.avatar || '';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="py-4 px-2 sm:py-8 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Messages</h1>
            <p className="text-gray-600 text-sm sm:text-base">Communicate with your tutors and students.</p>
          </div>

          {/* 📱 Mobile-first: list OR chat; 🖥️ Desktop: split view */}
          <div
            className="min-h-0 h-[calc(100dvh-220px)] grid lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {/* Left: Conversations (hide on mobile when a chat is open) */}
            <div className={`min-h-0 ${selectedUserId ? 'hidden lg:block' : 'block'} lg:col-span-1`}>
              <Card className="h-full flex flex-col min-h-0">
                <CardHeader className="sticky top-0 z-10 bg-white">
                  <CardTitle>Conversations</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 overflow-y-auto min-h-0">
                  <div className="space-y-1">
                    {filteredConversations.map((item) => {
                      const isUnread = !!item.unread;
                      return (
                        <button
                          key={item.userId}
                          onClick={() => setSelectedUserId(item.userId)}
                          className={`w-full text-left p-4 hover:bg-gray-50 border-b transition-colors ${
                            selectedUserId === item.userId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={item.avatar} />
                              <AvatarFallback>{initials(item.participant)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className={`text-sm flex items-center gap-2 ${isUnread ? 'font-bold' : 'font-medium'}`}>
                                  {item.participant}
                                  {item.isActive && <Badge variant="default">Active</Badge>}
                                  {isUnread && <span className="inline-block h-2 w-2 rounded-full bg-blue-600" aria-label="unread" />}
                                </h4>
                                <span className={`text-xs ${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                  {item.timestamp}
                                </span>
                              </div>
                              <p className={`text-sm truncate mt-1 ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                {item.lastMessage}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {filteredConversations.length === 0 && (
                      <div className="p-5 text-sm text-gray-500">No conversations found.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Chat (hide on mobile until a chat is selected) */}
            <div className={`min-h-0 ${selectedUserId ? 'block' : 'hidden lg:block'} lg:col-span-2`}>
              <Card className="h-full flex flex-col min-h-0">
                {selectedUserId ? (
                  <>
                    {/* Sticky chat header with mobile Back */}
                    <CardHeader className="border-b sticky top-0 z-10 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Back only on mobile */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserId(null)}
                            className="lg:hidden -ml-2 mr-1 p-2 rounded hover:bg-gray-100"
                            aria-label="Back to list"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </button>

                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedAvatar} />
                            <AvatarFallback>{initials(selectedName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="font-medium truncate max-w-[50vw] lg:max-w-none">
                              {selectedName || 'Loading…'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {selectedConv?.role ? selectedConv?.role : 'hello'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Messages list (scrollable) */}
                    <CardContent
                      ref={scrollRef}
                      className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0 space-y-4"
                    >
                      {loading ? (
                        <div className="text-sm text-gray-500">Loading messages…</div>
                      ) : (
                        <>
                          {messages.map((m) => {
                            const isMine = myId != null && m.from === myId;
                            const open = menuFor === m.id;

                            return (
                              <div key={m.id} className={`group flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className="relative inline-block max-w-[80%] sm:max-w-[70%]" data-msg-menu>
                                  <div className={`${isMine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-3 py-2`}>
                                    <p
                                      className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                                      dangerouslySetInnerHTML={{ __html: m.content }}
                                    />
                                  </div>

                                  {isMine && (
                                    <button
                                      type="button"
                                      onClick={() => setMenuFor(open ? null : m.id)}
                                      className="absolute top-0 left-full ml-[2px] p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition"
                                      aria-label="Message menu"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  )}

                                  {isMine && open && (
                                    <div className="absolute right-0 top-6 z-10 w-44 rounded-md border bg-white shadow-md">
                                      <button
                                        onClick={() => startEdit(m)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                                      >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDelete(m.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {messages.length === 0 && (
                            <div className="text-sm text-gray-500">No messages yet. Say hello 👋</div>
                          )}
                        </>
                      )}
                    </CardContent>

                    {/* Sticky composer */}
                    <div className="border-t p-2 sm:p-3 sticky bottom-0 bg-white">
                      {token ? (
                        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                          <div className="flex-1">
                            {editingId && (
                              <div className="text-xs mb-1 text-amber-600">
                                Editing message…{' '}
                                <button type="button" onClick={cancelEdit} className="underline">Cancel</button>
                              </div>
                            )}
                            <Textarea
                              ref={composeRef}
                              onKeyDown={onComposerKeyDown}
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder={editingId ? 'Edit your message…' : 'Type your message...'}
                              className="flex-1 min-h-[40px] max-h-[140px] resize-none"
                              rows={1}
                            />
                          </div>
                          <Button
                            type="submit"
                            size="sm"
                            className="self-end"
                            disabled={!newMessage.trim() || sending}
                          >
                            {editingId ? 'Update' : <Send className="h-4 w-4" />}
                          </Button>
                          {editingId && (
                            <Button type="button" size="sm" variant="secondary" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          )}
                        </form>
                      ) : (
                        <div className="text-sm text-gray-500">Please sign in to send messages.</div>
                      )}
                    </div>
                  </>
                ) : (
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                      <p className="text-gray-500">Choose a conversation from the list to start messaging.</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
