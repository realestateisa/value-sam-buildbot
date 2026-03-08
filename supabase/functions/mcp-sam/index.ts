import { Hono } from "hono";
import { McpServer, StreamableHttpTransport } from "mcp-lite";

const app = new Hono();

const mcpServer = new McpServer({
  name: "vbh-sam",
  version: "1.0.0",
});

mcpServer.tool("ask_sam", {
  description:
    "Ask SAM, the Value Build Homes digital assistant, a question about home building, financing, floor plans, territories, and appointments in North Carolina and South Carolina.",
  inputSchema: {
    type: "object" as const,
    properties: {
      question: {
        type: "string",
        description: "The question to ask SAM",
      },
      sessionId: {
        type: "string",
        description:
          "Optional session ID from a previous response to continue the conversation",
      },
    },
    required: ["question"],
  },
  handler: async ({ question, sessionId }: { question: string; sessionId?: string }) => {
    try {
      const CUSTOMGPT_API_KEY = Deno.env.get("CUSTOMGPT_API_KEY");
      const CUSTOMGPT_PROJECT_ID = Deno.env.get("CUSTOMGPT_PROJECT_ID");

      if (!CUSTOMGPT_API_KEY || !CUSTOMGPT_PROJECT_ID) {
        return {
          content: [{ type: "text" as const, text: "Error: API keys not configured." }],
        };
      }

      let conversationSessionId = sessionId;

      if (!conversationSessionId) {
        const createRes = await fetch(
          `https://app.customgpt.ai/api/v1/projects/${CUSTOMGPT_PROJECT_ID}/conversations`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${CUSTOMGPT_API_KEY}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ name: `MCP-${Date.now()}` }),
          }
        );

        if (!createRes.ok) {
          const err = await createRes.text();
          return {
            content: [{ type: "text" as const, text: `Error creating conversation: ${err}` }],
          };
        }

        const createData = await createRes.json();
        conversationSessionId = createData.data.session_id;
      }

      const msgRes = await fetch(
        `https://app.customgpt.ai/api/v1/projects/${CUSTOMGPT_PROJECT_ID}/conversations/${conversationSessionId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CUSTOMGPT_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            prompt: question,
            response_source: "default",
            stream: 0,
          }),
        }
      );

      if (!msgRes.ok) {
        const err = await msgRes.text();
        return {
          content: [{ type: "text" as const, text: `Error from API: ${err}` }],
        };
      }

      const msgData = await msgRes.json();
      const answer =
        msgData.data?.openai_response ||
        msgData.response ||
        "Sorry, I could not process your request.";

      const citationIds: string[] = msgData.data?.citations || [];
      let citationsText = "";

      if (citationIds.length > 0) {
        const citationResults = await Promise.all(
          citationIds.map(async (id: string) => {
            try {
              const res = await fetch(
                `https://app.customgpt.ai/api/v1/projects/${CUSTOMGPT_PROJECT_ID}/citations/${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${CUSTOMGPT_API_KEY}`,
                    Accept: "application/json",
                  },
                }
              );
              if (res.ok) {
                const data = await res.json();
                return data.data;
              }
              return null;
            } catch {
              return null;
            }
          })
        );

        const validCitations = citationResults.filter((c) => c !== null);
        if (validCitations.length > 0) {
          citationsText =
            "\n\nSources:\n" +
            validCitations
              .map((c: any, i: number) => `${i + 1}. ${c.title || c.url || "Source"}`)
              .join("\n");
        }
      }

      const responseText = `${answer}${citationsText}\n\n[sessionId: ${conversationSessionId}]`;

      return {
        content: [{ type: "text" as const, text: responseText }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      };
    }
  },
});

const transport = new StreamableHttpTransport();

app.all("/*", async (c) => {
  return await transport.handleRequest(c.req.raw, mcpServer);
});

Deno.serve(app.fetch);
