// author-connect-messaging-api

// lib/authorconnect.ts
// export const WP_API_BASE = `${process.env.WP_URL}/wp-json`;

// export type ACMessage = {
//   id: number;
//   from: number;
//   to: number;
//   content: string;
//   timestamp: string | null;
// };

// export type ACGetMessagesResponse = {
//   participants: number[];
//   count: number;
//   messages: ACMessage[];
// };

// function makeHeaders(token?: string): HeadersInit {
//   const h: HeadersInit = { 'Content-Type': 'application/json' };
//   if (token) h.Authorization = `Bearer ${token}`;
//   return h;
// }

// export async function acGetMessages(
//   otherUserId: number,
//   order: 'ASC' | 'DESC' = 'ASC',
//   token?: string
// ): Promise<ACGetMessagesResponse> {
//   const res = await fetch(`${WP_API_BASE}/authorconnect/v1/messages/${otherUserId}?order=${order}`, {
//     method: 'GET',
//     headers: makeHeaders(token),
//   });
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`GET messages failed (${res.status}): ${text}`);
//   }
//   return res.json();
// }

// export async function acSendMessage(
//   toUserId: number,
//   content: string,
//   token?: string
// ): Promise<{ status: string; message_id: number; from: number; to: number }> {
//   const res = await fetch(`${WP_API_BASE}/authorconnect/v1/messages/send`, {
//     method: 'POST',
//     headers: makeHeaders(token),
//     body: JSON.stringify({ to: toUserId, content }),
//   });
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Send message failed (${res.status}): ${text}`);
//   }
//   return res.json();
// }

// export type ConversationItem = {
//   userId: number;
//   participant: string;
//   avatar?: string;
//   lastMessage: string;
//   timestamp: string;
//   unread?: boolean;
// };

// export function buildConversationFromMessages(
//   otherUserId: number,
//   displayName: string,
//   avatar: string | undefined,
//   messages: ACMessage[]
// ): ConversationItem {
//   const last = messages[messages.length - 1];
//   return {
//     userId: otherUserId,
//     participant: displayName,
//     avatar,
//     lastMessage: last ? stripHtml(last.content).slice(0, 120) : '',
//     timestamp: last?.timestamp ?? '',
//   };
// }

// function stripHtml(html: string) {
//   if (!html) return '';
//   return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
// }



export const WP_API_BASE = (process.env.NEXT_PUBLIC_WP_URL ?? '').replace(/\/+$/, '') + '/wp-json';


/** ===== Types ===== */
export type ACMessage = {
  id: number;
  from: number;
  to: number;
  content: string;          // HTML allowed (server already sanitized)
  timestamp: string | null; // ISO8601 or null
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
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
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

/** ===== Sidebar helper (optional) ===== */
export type ConversationItem = {
  userId: number;
  participant: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
};

export function buildConversationFromMessages(
  otherUserId: number,
  displayName: string,
  avatar: string | undefined,
  messages: ACMessage[]
): ConversationItem {
  const last = messages[messages.length - 1];
  return {
    userId: otherUserId,
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

