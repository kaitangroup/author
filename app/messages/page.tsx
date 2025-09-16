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
import { Search, Send, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
type WPUserLite = { id: number; name: string; avatar?: string };
type ConvWithPresence = ConversationItem & {
  isActive: boolean;
  hasMessages?: boolean;
  unread?: boolean;
};

function initials(name?: string) {
  if (!name) return '?';
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || name[0]?.toUpperCase() || '?';
}

/* ======== Local API helpers (match WP plugin routes) ======== */
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

/* ================= Page ================= */
export default function MessagesPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const onlyUserParam = searchParams.get('to');                 // ← /messages?to=123
  const onlyUserId = onlyUserParam ? Number(onlyUserParam) : null;

  // আমার ইউজার (/me)
  const [myId, setMyId] = useState<number | null>(null);
  const [myName, setMyName] = useState<string>('');
  const [myAvatar, setMyAvatar] = useState<string>('');

  // লেফট সাইড
  const [users, setUsers] = useState<WPUserLite[]>([]);
  const [conversations, setConversations] = useState<ConvWithPresence[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(onlyUserId);

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

  // unread ট্র্যাকিং (লোকাল): partnerId -> ISO timestamp last seen
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

  /* ===== 0) Load current user (/me) ===== */
  useEffect(() => {
    let alive = true;

    if (!token) {
      setMyId(null); setMyName(''); setMyAvatar('');
      return () => { alive = false; };
    }

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

  /* ===== 1) Load users for sidebar ===== */
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${WP_API_BASE}/authorconnect/v1/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await ensureOk(res, '/users failed');
        const data = await res.json();
        const list: WPUserLite[] = (data?.users || []).map((u: any) => ({
          id: u.id, name: u.name, avatar: u.avatar,
        }));

        if (!mounted) return;

        if (onlyUserId) {
          const target = list.find(u => u.id === onlyUserId);
          setUsers(target ? [target] : []);
          setSelectedUserId(onlyUserId);
        } else {
          setUsers(list);
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Failed to load users');
      }
    })();

    return () => { mounted = false; };
  }, [token, onlyUserId]);

  /* ===== 2) Build conversation list (শুধু যাদের সাথে চ্যাট আছে) ===== */
  useEffect(() => {
    if (!token || users.length === 0) return;
    let mounted = true;

    (async () => {
      try {
        const items = await Promise.all(
          users.map(async (u) => {
            const data = await acGetMessages(u.id, 'ASC', token);
            const msgs: ACMessage[] = data.messages || [];

            // কেবল যাদের সাথে মেসেজ আছে, তাদের রাখি (তবে query তে to= থাকলে তাকে রাখবো)
            const hasMessages = msgs.length > 0;
            if (!hasMessages && u.id !== onlyUserId) {
              return null;
            }

            const conv = buildConversationFromMessages(u.id, u.name, u.avatar, msgs);
            const last = msgs[msgs.length - 1];
            const lastISO = conv.timestamp ? new Date(conv.timestamp) : null;
            const isActive = !!lastISO && Date.now() - lastISO.getTime() <= 5 * 60 * 1000;

            // unread: last msg is from partner AND lastSeen < last.timestamp
            let unread = false;
            if (last && myId != null && last.from !== myId && last.timestamp) {
              const seenISO = lastSeenAt[String(u.id)];
              if (!seenISO || new Date(seenISO) < new Date(last.timestamp)) {
                unread = true;
              }
            }

            return { ...conv, isActive, hasMessages, unread } as ConvWithPresence;
          })
        );

        if (!mounted) return;

        const filtered = (items.filter(Boolean) as ConvWithPresence[])
          // সর্বশেষ মেসেজ আগে
          .sort((a, b) => {
            const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
            const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
            return tb - ta;
          });

        setConversations(filtered);

        // যদি selected না থাকে, লিস্টের প্রথমজনকে সিলেক্ট করি
        if (!selectedUserId && filtered[0]?.userId) {
          setSelectedUserId(filtered[0].userId);
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Failed to load conversations');
      }
    })();

    return () => { mounted = false; };
  }, [token, users, myId, lastSeenAt, onlyUserId]); // myId/lastSeenAt থাকলে unread রিকম্পিউট হবে

  /* ===== 3) Load selected thread + polling ===== */
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

  /* ===== 3.1) এই থ্রেডটা দেখা হলে unread→read (local) ===== */
  useEffect(() => {
    if (!selectedUserId) return;
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (!last?.timestamp) return;

    // দেখলেই seen আপডেট
    setLastSeenAt((prev) => {
      const next = { ...prev, [String(selectedUserId)]: last.timestamp! };
      return next;
    });
    // সাইডবারে unread false করে দেই
    setConversations((prev) =>
      prev.map((c) => (c.userId === selectedUserId ? { ...c, unread: false } : c))
    );
  }, [messages, selectedUserId]);

  /* ===== 4) Send / Update (one handler) ===== */
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId || !token || myId == null) return;

    const text = newMessage.trim();
    if (!text) return;

    // EDIT MODE → update
    if (editingId) {
      try {
        setSending(true);
        const r = await updateMessageAPI(editingId, text, token, selectedUserId);
        setMessages(prev =>
          prev.map(m => m.id === editingId ? { ...m, id: r.id, content: r.content } : m)
        );
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

    // SEND MODE → send new
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

      // Refreshing will also update the sidebar's time/order
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

  /* ===== 4.1) Delete message ===== */
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

  /* ===== 4.2) Edit → put text in compose box ===== */
  function startEdit(m: ACMessage) {
    setEditingId(m.id);
    const plain = m.content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
    setNewMessage(plain);
    setMenuFor(null);
    setTimeout(() => composeRef.current?.focus(), 0);
  }
  function cancelEdit() {
    setEditingId(null);
    setNewMessage('');
  }

  /* ===== 5) Auto-scroll ===== */
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /* ===== Outside click → close menu ===== */
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (!el.closest?.('[data-msg-menu]')) setMenuFor(null);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /* ===== 6) Sidebar filter (search + already computed list) ===== */
  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const base = conversations;
    if (!q) return base;
    return base.filter((c) => c.participant.toLowerCase().includes(q));
  }, [conversations, searchTerm]);

  const selectedConv = conversations.find(c => c.userId === selectedUserId);
  const selectedName = selectedConv?.participant || users.find(u => u.id === selectedUserId)?.name || '';
  const selectedAvatar = selectedConv?.avatar || '';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-gray-600">Communicate with your tutors and students.</p>
          </div>

          {/* HEIGHT + SCROLL */}
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[520px] min-h-0">
            {/* Left: Conversations */}
            <div className="lg:col-span-1 min-h-0">
              <Card className="h-full flex flex-col min-h-0">
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                  {!onlyUserId && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-0 flex-1 overflow-y-auto min-h-0">
                  <div className="space-y-1">
                    {filteredConversations.map((item) => {
                      const isUnread = !!item.unread;
                      return (
                        <div
                          key={item.userId}
                          onClick={() => setSelectedUserId(item.userId)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                            selectedUserId === item.userId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.avatar} />
                              <AvatarFallback>{initials(item.participant)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
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
                        </div>
                      );
                    })}

                    {filteredConversations.length === 0 && (
                      <div className="p-5 text-sm text-gray-500">No conversations found.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Chat */}
            <div className="lg:col-span-2 min-h-0">
              <Card className="h-full flex flex-col min-h-0">
                {selectedUserId ? (
                  <>
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={selectedAvatar} />
                            <AvatarFallback>{initials(selectedName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{selectedName || 'Loading…'}</h3>
                            <p className="text-sm text-gray-500">
                              {selectedConv?.isActive ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent ref={scrollRef} className="flex-1 p-4 overflow-y-auto min-h-0">
                      {loading ? (
                        <div className="text-sm text-gray-500">Loading messages…</div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((m) => {
                            const isMine = myId != null && m.from === myId;
                            const open = menuFor === m.id;

                            return (
                              <div key={m.id} className={`group flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className="relative inline-block" data-msg-menu>
                                  {/* bubble */}
                                  <div className={`${isMine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3 max-w-xs`}>
                                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: m.content }} />
                                    <span className={`text-xs mt-1 block ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                                      {m.timestamp ?? ''}
                                    </span>
                                  </div>

                                  {/* 3-dot */}
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

                                  {/* menu */}
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
                        </div>
                      )}
                    </CardContent>

                    <div className="border-t p-4">
                      {token ? (
                        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                          <div className="flex-1">
                            {editingId && (
                              <div className="text-xs mb-1 text-amber-600">
                                Editing message… <button type="button" onClick={cancelEdit} className="underline">Cancel</button>
                              </div>
                            )}
                            <Textarea
                              ref={composeRef}
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder={editingId ? 'Edit your message…' : 'Type your message...'}
                              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
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
