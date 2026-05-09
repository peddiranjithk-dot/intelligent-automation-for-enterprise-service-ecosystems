/* ═══════════════════════════════════════════════════════════
   IAES — API Module
   Anthropic Claude API integration for AI chat
   ═══════════════════════════════════════════════════════════ */

'use strict';

/**
 * Call the Anthropic Claude API with a user message and system context.
 * Returns the AI's response text.
 */
async function callAI(userMessage) {
  // Build the messages array including recent history for context
  const historyMessages = chatHistory
    .slice(-6) // keep last 6 messages for context window efficiency
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

  // Always append the current user message
  const messages = [
    ...historyMessages,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_CONTEXT,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.content?.find(c => c.type === 'text');
  if (!textContent) throw new Error('No text content in response');
  return textContent.text;
}
