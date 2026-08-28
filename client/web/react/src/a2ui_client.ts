import type { Part, SendMessageSuccessResponse, Task } from '@a2a-js/sdk';
import { A2AClient } from '@a2a-js/sdk/client';

const A2UI_MIME_TYPE = 'application/json+a2ui';

export class RobustA2UIClient {
  private serverUrl: string;
  private client: A2AClient | null = null;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  private async getClient(): Promise<A2AClient> {
    if (!this.client) {
      const cardUrl = `${this.serverUrl}/.well-known/agent-card.json`;
      this.client = await A2AClient.fromCardUrl(cardUrl, {
        fetchImpl: async (url: RequestInfo | URL, init?: RequestInit) => {
          const headers = new Headers(init?.headers);
          headers.set(
            'X-A2A-Extensions',
            'https://a2ui.org/a2a-extension/a2ui/v0.9',
          );
          headers.set('A2A-Version', '0.3');
          return fetch(url, {...init, headers});
        },
      });
    }
    return this.client;
  }

  async send(
    message: any | string,
  ): Promise<Array<{type: 'text'; text: string} | {type: 'a2ui'; message: any}>> {
    const client = await this.getClient();
    let parts: Part[] = [];

    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message);
        if (typeof parsed === 'object' && parsed !== null) {
          parts = [
            {
              kind: 'data',
              data: parsed as unknown as Record<string, unknown>,
              metadata: {mimeType: A2UI_MIME_TYPE},
            } as Part,
          ];
        } else {
          parts = [{kind: 'text', text: message}];
        }
      } catch {
        parts = [{kind: 'text', text: message}];
      }
    } else {
      parts = [
        {
          kind: 'data',
          data: message as unknown as Record<string, unknown>,
          metadata: {mimeType: A2UI_MIME_TYPE},
        } as Part,
      ];
    }

    const response = await client.sendMessage({
      message: {
        messageId: crypto.randomUUID(),
        role: 'user',
        parts: parts,
        kind: 'message',
      },
    });

    if ('error' in response) {
      throw new Error((response as any).error.message || 'A2A Server Error');
    }

    const result = (response as SendMessageSuccessResponse).result as Task;
    let responseParts: Part[] = [];

    if (result.kind === 'task') {
      if (result.status.message?.parts && result.status.message.parts.length > 0) {
        responseParts = result.status.message.parts;
      } else if (result.history && result.history.length > 0) {
        // Find the last agent message in history
        for (let i = result.history.length - 1; i >= 0; i--) {
          const msg = result.history[i];
          if (msg.role === 'agent' && msg.parts && msg.parts.length > 0) {
            responseParts = msg.parts;
            break;
          }
        }
      }
    }

    const orderedParts: Array<{type: 'text'; text: string} | {type: 'a2ui'; message: any}> = [];

    for (const part of responseParts) {
      if (part.kind === 'data') {
        orderedParts.push({type: 'a2ui', message: part.data});
      } else if (part.kind === 'text') {
        const text = part.text || '';
        if (text.includes('<a2ui-json>')) {
          const regex = /<a2ui-json>([\s\S]*?)<\/a2ui-json>/g;
          let lastIndex = 0;
          let match;
          while ((match = regex.exec(text)) !== null) {
            const textBefore = text.slice(lastIndex, match.index).trim();
            if (textBefore) {
              orderedParts.push({type: 'text', text: textBefore});
            }
            try {
              const jsonContent = JSON.parse(match[1].trim());
              const rawMsgs = Array.isArray(jsonContent)
                ? jsonContent
                : [jsonContent];

              // Generate unique turn suffix to prevent "Surface already exists" collisions across turns
              const turnSuffix = Math.random().toString(36).substring(2, 7);
              const surfaceIdMap = new Map<string, string>();

              for (const msg of rawMsgs) {
                for (const key of [
                  'createSurface',
                  'updateComponents',
                  'updateDataModel',
                  'deleteSurface',
                  'beginRendering',
                  'surfaceUpdate',
                  'dataModelUpdate',
                ]) {
                  if (msg && msg[key] && msg[key].surfaceId) {
                    const origId = msg[key].surfaceId;
                    if (!surfaceIdMap.has(origId)) {
                      surfaceIdMap.set(origId, `${origId}-${turnSuffix}`);
                    }
                    msg[key].surfaceId = surfaceIdMap.get(origId);
                  }
                }
                orderedParts.push({type: 'a2ui', message: msg});
              }
            } catch (err) {
              console.error('Failed to parse <a2ui-json>:', err);
              orderedParts.push({type: 'text', text: match[0]});
            }
            lastIndex = regex.lastIndex;
          }
          const textAfter = text.slice(lastIndex).trim();
          if (textAfter) {
            orderedParts.push({type: 'text', text: textAfter});
          }
        } else {
          orderedParts.push({type: 'text', text});
        }
      }
    }

    return orderedParts;
  }
}
