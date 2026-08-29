/**
 * Vidyaverse AI - Model Context Protocol (MCP) Server
 * Allows external LLMs (e.g., Cursor, Claude Desktop, local Ollama) to query
 * our localized educational JSON database using Stdio transport.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

// Initialize MCP Server
const server = new Server(
  {
    name: "vidyaverse-ai-curriculum-server",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define path to the localized educational JSON datasets
const DATA_DIR = path.join(__dirname, "../data");

// Helper to safely load curriculum JSON files
function loadExamJson(examId: string): any {
  const filePath = path.join(DATA_DIR, `${examId.toLowerCase()}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Curriculum database for ${examId} not found.`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// Register Tools List
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_exam_curriculum",
        description: "Retrieve subjects, chapters, summaries, and formula sheets for a specific exam.",
        inputSchema: {
          type: "object",
          properties: {
            examId: {
              type: "string",
              description: "The ID of the target exam (e.g., class10, class12, jee, neet, cuet, cafoundation).",
              enum: ["class10", "class12", "jee", "neet", "cuet", "cafoundation"],
            },
          },
          required: ["examId"],
        },
      },
      {
        name: "query_chapter_details",
        description: "Retrieve specific formulas, concepts, summaries, and MCQs for a target chapter in a subject.",
        inputSchema: {
          type: "object",
          properties: {
            examId: { type: "string" },
            subjectId: { type: "string", description: "The subject identifier (e.g., physics, biology, accounting)." },
            chapterId: { type: "string", description: "The chapter key (e.g., kinematics, cell-biology, electrostatics)." },
          },
          required: ["examId", "subjectId", "chapterId"],
        },
      },
    ],
  };
});

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_exam_curriculum") {
      const examId = args?.examId as string;
      const data = loadExamJson(examId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              examName: data.examName,
              subjects: data.subjects.map((s: any) => ({
                subjectId: s.subjectId,
                subjectName: s.subjectName,
                chaptersCount: s.chapters.length,
                chaptersList: s.chapters.map((c: any) => c.chapterName),
              })),
            }, null, 2),
          },
        ],
      };
    }

    if (name === "query_chapter_details") {
      const examId = args?.examId as string;
      const subjectId = args?.subjectId as string;
      const chapterId = args?.chapterId as string;

      const data = loadExamJson(examId);
      const subject = data.subjects.find((s: any) => s.subjectId === subjectId.toLowerCase());
      if (!subject) {
        return {
          isError: true,
          content: [{ type: "text", text: `Subject '${subjectId}' not found in ${examId} database.` }],
        };
      }

      const chapter = subject.chapters.find((c: any) => c.chapterId === chapterId.toLowerCase());
      if (!chapter) {
        return {
          isError: true,
          content: [{ type: "text", text: `Chapter '${chapterId}' not found in ${subjectId} subject.` }],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              chapterName: chapter.chapterName,
              summary: chapter.summary,
              formulas: chapter.formulas,
              keyConcepts: chapter.keyConcepts,
              quizzesCount: chapter.quizzes.length,
            }, null, 2),
          },
        ],
      };
    }

    throw new Error(`Tool ${name} not found.`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: error.message,
        },
      ],
    };
  }
});

// Run Server on Stdio Transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vidyaverse AI MCP Server running on Stdio transport...");
}

run().catch((err) => {
  console.error("Fatal error running MCP Server:", err);
  process.exit(1);
});
