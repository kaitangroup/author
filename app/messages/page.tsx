// 'use client';

// import { useState } from 'react';
// import { Header } from '@/components/layout/Header';
// import { Footer } from '@/components/layout/Footer';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { Search, Send, MoreVertical } from 'lucide-react';
// import { mockMessages } from '@/lib/mockData';
// import { toast } from 'sonner';

// export default function MessagesPage() {
//   const [selectedConversation, setSelectedConversation] = useState(mockMessages[0]);
//   const [newMessage, setNewMessage] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');

//   const filteredMessages = mockMessages.filter(message =>
//     message.participant.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSendMessage = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newMessage.trim()) return;

//     toast.success('Message sent!');
//     setNewMessage('');
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
      
//       <div className="py-8 px-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold mb-2">Messages</h1>
//             <p className="text-gray-600">Communicate with your tutors and students.</p>
//           </div>

//           <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
//             {/* Conversations List */}
//             <div className="lg:col-span-1">
//               <Card className="h-full">
//                 <CardHeader>
//                   <CardTitle>Conversations</CardTitle>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                     <Input
//                       placeholder="Search conversations..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10"
//                     />
//                   </div>
//                 </CardHeader>
//                 <CardContent className="p-0">
//                   <div className="space-y-1">
//                     {filteredMessages.map((message) => (
//                       <div
//                         key={message.id}
//                         onClick={() => setSelectedConversation(message)}
//                         className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
//                           selectedConversation?.id === message.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
//                         }`}
//                       >
//                         <div className="flex items-start gap-3">
//                           <Avatar className="h-10 w-10">
//                             <AvatarImage src={message.avatar} />
//                             <AvatarFallback>{message.participant[0]}</AvatarFallback>
//                           </Avatar>
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center justify-between">
//                               <h4 className="font-medium text-sm">{message.participant}</h4>
//                               <span className="text-xs text-gray-500">{message.timestamp}</span>
//                             </div>
//                             <p className="text-sm text-gray-600 truncate mt-1">{message.lastMessage}</p>
//                             {message.unread && (
//                               <Badge className="mt-2" variant="default" >New</Badge>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Chat Area */}
//             <div className="lg:col-span-2">
//               <Card className="h-full flex flex-col">
//                 {selectedConversation ? (
//                   <>
//                     {/* Chat Header */}
//                     <CardHeader className="border-b">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <Avatar>
//                             <AvatarImage src={selectedConversation.avatar} />
//                             <AvatarFallback>{selectedConversation.participant[0]}</AvatarFallback>
//                           </Avatar>
//                           <div>
//                             <h3 className="font-medium">{selectedConversation.participant}</h3>
//                             <p className="text-sm text-gray-500">Online</p>
//                           </div>
//                         </div>
//                         <Button variant="ghost" size="sm">
//                           <MoreVertical className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </CardHeader>

//                     {/* Messages */}
//                     <CardContent className="flex-1 p-4 overflow-y-auto">
//                       <div className="space-y-4">
//                         {/* Sample messages */}
//                         <div className="flex justify-start">
//                           <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
//                             <p className="text-sm">{selectedConversation.lastMessage}</p>
//                             <span className="text-xs text-gray-500 mt-1 block">{selectedConversation.timestamp}</span>
//                           </div>
//                         </div>
                        
//                         <div className="flex justify-end">
//                           <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
//                             <p className="text-sm">Thanks for the help! I understand the concept much better now.</p>
//                             <span className="text-xs text-blue-100 mt-1 block">2 hours ago</span>
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>

//                     {/* Message Input */}
//                     <div className="border-t p-4">
//                       <form onSubmit={handleSendMessage} className="flex gap-2">
//                         <Textarea
//                           value={newMessage}
//                           onChange={(e) => setNewMessage(e.target.value)}
//                           placeholder="Type your message..."
//                           className="flex-1 min-h-[40px] max-h-[120px] resize-none"
//                           rows={1}
//                         />
//                         <Button type="submit" size="sm" className="self-end">
//                           <Send className="h-4 w-4" />
//                         </Button>
//                       </form>
//                     </div>
//                   </>
//                 ) : (
//                   <CardContent className="flex-1 flex items-center justify-center">
//                     <div className="text-center">
//                       <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
//                       <p className="text-gray-500">Choose a conversation from the list to start messaging.</p>
//                     </div>
//                   </CardContent>
//                 )}
//               </Card>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <Footer />
//     </div>
//   );
// }




'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Send, MoreVertical } from 'lucide-react';
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
type ConvWithPresence = ConversationItem & { isActive: boolean };

function initials(name?: string) {
  if (!name) return '?';
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || name[0]?.toUpperCase() || '?';
}

/* ================= Page ================= */
export default function MessagesPage() {
  const { data: session, status } = useSession(); // ✅ NextAuth session


  // আমার ইউজার ( /me থেকে )
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
  const token = localStorage.getItem("wpToken");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /* ===== 0) Load current user (/me) ===== */
  useEffect(() => {
   
    let mounted = true;
    console.log(token);

    (async () => {
      try {
        const r = await fetch(`${WP_API_BASE}/authorconnect/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`/me ${r.status}: ${t}`);
        }
        const me = await r.json();
        if (!mounted) return;
        setMyId(me.id ?? null);
        setMyName(me.name ?? '');
        setMyAvatar(me.avatar ?? '');
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Failed to load current user');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [session, status]);

  /* ===== 1) Load users for sidebar ===== */
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${WP_API_BASE}/authorconnect/v1/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const list: WPUserLite[] = (data?.users || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          avatar: u.avatar,
        }));
        if (!mounted) return;
        setUsers(list);
        // ডিফল্ট সিলেকশন: প্রথমজন
        setSelectedUserId(prev => prev ?? list[0]?.id ?? null);
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Failed to load users');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  /* ===== 2) Build conversation list (last message + presence) ===== */
  useEffect(() => {
    if (!token || users.length === 0) return;
    let mounted = true;

    (async () => {
      try {
        const items = await Promise.all(
          users.map(async (u) => {
            const data = await acGetMessages(u.id, 'ASC', token);
            const conv = buildConversationFromMessages(u.id, u.name, u.avatar, data.messages);
            const lastISO = conv.timestamp ? new Date(conv.timestamp) : null;
            const isActive = !!lastISO && Date.now() - lastISO.getTime() <= 5 * 60 * 1000; // 5m
            return { ...conv, isActive } as ConvWithPresence;
          })
        );

        if (!mounted) return;

        // Active আগে, তারপর শেষ সময় DESC, তারপর নাম ASC
        items.sort((a, b) => {
          if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
          const byTime = (b.timestamp || '').localeCompare(a.timestamp || '');
          if (byTime !== 0) return byTime;
          return a.participant.localeCompare(b.participant);
        });

        setConversations(items);
        console.log(items);
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Failed to load conversations');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, users]);

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
        setMessages(data.messages);
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

  /* ===== 4) Send message ===== */
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || selectedUserId == null || !token || myId == null) return;
    setSending(true);

    const tempId = Date.now();
    const optimistic: ACMessage = {
      id: tempId,
      from: myId,                 // ✅ আমিই পাঠাচ্ছি
      to: selectedUserId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await acSendMessage(selectedUserId, newMessage, token);
      setNewMessage('');
      toast.success('Message sent!');
    } catch (e: any) {
      // rollback optimistic
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      console.error(e);
      toast.error(e?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  /* ===== 5) Auto-scroll ===== */
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /* ===== 6) Sidebar filter ===== */
  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.participant.toLowerCase().includes(q));
  }, [conversations, searchTerm]);

  const selectedConv = conversations.find(c => c.userId === selectedUserId);
  const selectedName = selectedConv?.participant || users.find(u => u.id === selectedUserId)?.name || '';
  const selectedAvatar = selectedConv?.avatar || '';

  return (
    <div className="min-h-screen bg-background">

      {/* ==== DEBUG BOX (dev only) ==== */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mx-auto max-w-7xl my-3 rounded-lg border p-3 text-xs bg-gray-50">
          <div className="font-semibold">Debug</div>
          <div>WP_API_BASE: <code>{WP_API_BASE}</code></div>
          <div>token: <code>{token ? token.slice(0, 16) + '…' : 'null'}</code></div>
          <div>myId: <code>{String(myId)}</code></div>
          <div className="mt-2 flex gap-2">
            <button
              className="px-2 py-1 border rounded"
              onClick={async () => {
                try {
                  const r = await fetch(`${WP_API_BASE}/authorconnect/v1/me`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                  });
                  const t = await r.text();
                  alert(`ME ${r.status}\n` + t);
                } catch (e) { alert(String(e)); }
              }}
            >Test /me</button>

            <button
              className="px-2 py-1 border rounded"
              onClick={async () => {
                try {
                  const r = await fetch(`${WP_API_BASE}/authorconnect/v1/users`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                  });
                  const t = await r.text();
                  alert(`USERS ${r.status}\n` + t);
                } catch (e) { alert(String(e)); }
              }}
            >Test /users</button>
          </div>
        </div>
      )}

      <Header />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-gray-600">Communicate with your tutors and students.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
            {/* Left: Conversations */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
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

                <CardContent className="p-0">
                  <div className="space-y-1 overflow-y-auto max-h-[480px]">
                    {filteredConversations.map((item) => (
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
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                {item.participant}
                                {item.isActive && <Badge variant="default">Active</Badge>}
                              </h4>
                              <span className="text-xs text-gray-500">{item.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">{item.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredConversations.length === 0 && (
                      <div className="p-5 text-sm text-gray-500">No conversations found.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Chat */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
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

                    <CardContent ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
                      {loading ? (
                        <div className="text-sm text-gray-500">Loading messages…</div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((m) => {
                            // ✅ আমার মেসেজ হলে ডান পাশে
                            const isMine = myId != null && m.from === myId;
                            return (
                              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`${isMine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3 max-w-xs`}>
                                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: m.content }} />
                                  <span className={`text-xs mt-1 block ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {m.timestamp ?? ''}
                                  </span>
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
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                            rows={1}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            className="self-end"
                            disabled={!newMessage.trim() || sending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
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
