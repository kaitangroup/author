export const WP_API_BASE =
  (process.env.NEXT_PUBLIC_WP_URL ?? '').replace(/\/+$/, '') + '/wp-json';

/** ===== Types ===== */
export type ACMessage = {
  id: number;
  from: number;
  to: number;
  content: string;
  timestamp: string | null;
};

export type ACGetMessagesResponse = {
  participants: number[];
  count: number;
  messages: ACMessage[];
};

export type SendMessageResponse = {
  status: string;
  message_id: number;
  from: number;
  to: number;
};

/** ===== Helpers ===== */
function makeHeaders(token?: string): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) (h as any).Authorization = `Bearer ${token}`;
  return h;
}

async function ensureOk(res: Response, label: string) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${label} (${res.status}): ${text || res.statusText}`);
  }
}

/** ===== Core API ===== */
export async function acGetMessages(
  otherUserId: number,
  order: 'ASC' | 'DESC' = 'ASC',
  token?: string
): Promise<ACGetMessagesResponse> {
  const url = `${WP_API_BASE}/authorconnect/v1/messages/${otherUserId}?order=${order}`;
  
  const res = await fetch(url, { method: 'GET', headers: makeHeaders(token) });
  await ensureOk(res, 'GET messages failed');
  return res.json();
}

export async function acSendMessage(
  toUserId: number,
  content: string,
  token?: string
): Promise<SendMessageResponse> {
  const url = `${WP_API_BASE}/authorconnect/v1/messages/send`;
  const res = await fetch(url, {
    method: 'POST',
    headers: makeHeaders(token),
    body: JSON.stringify({ to: toUserId, content }),
  });
  await ensureOk(res, 'Send message failed');
  return res.json();
}

/** ===== Edit / Delete (★ তোমার প্লাগিনের রুট) =====
 *   PATCH  /authorconnect/v1/messages/:id   { content }
 *   DELETE /authorconnect/v1/messages/:id
 */

export async function acUpdateMessage(
  id: number,
  otherUserId: number,
  content: string,
  token?: string
): Promise<{ status: string; id: number; content: string }> {
  const url = `${WP_API_BASE}/authorconnect/v1/messages/${id}?other_user=${otherUserId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ content }),
  });
  await ensureOk(res, 'Update message failed');
  return res.json();
}

export async function acDeleteMessage(
  id: number,
  otherUserId: number,
  token?: string
): Promise<{ status: string; id: number }> {
  const url = `${WP_API_BASE}/authorconnect/v1/messages/${id}?other_user=${otherUserId}`;
  
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  await ensureOk(res, 'Delete message failed');
  return res.json();
}


/** ===== Sidebar helper ===== */
export type ConversationItem = {
  thread_id: number; 
  userId: number;
  participant: string;
  avatar?: string;
  role?: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;

};

export function buildConversationFromMessages(
  thread_id: number,        // ✅ FIRST ARG
  otherUserId: number,
  displayName: string,
  role: string,
  avatar: string | undefined,
  messages: ACMessage[]
): ConversationItem {
  const last = messages[messages.length - 1];

  return {
    thread_id,  
    userId: otherUserId,
    role,
    participant: displayName,
    avatar,
    lastMessage: last ? stripHtml(last.content).slice(0, 120) : '',
    timestamp: last?.timestamp ?? '',
  };
}


function stripHtml(html: string) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
