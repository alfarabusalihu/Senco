import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessageDto } from './dto/chat.dto';
import * as crypto from 'crypto';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private isConfigured = false;
  private selectedModelName = 'gemini-1.5-flash';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);

        // Fetch accessible models dynamically
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.models) {
            const availableModels = data.models
              .filter((m: any) =>
                m.supportedGenerationMethods?.includes('generateContent'),
              )
              .map((m: any) => m.name.replace('models/', ''));

            // Prioritize best models
            const modelPriority = [
              'gemini-1.5-pro',
              'gemini-1.5-flash',
              'gemini-1.0-pro',
            ];
            let chosen = false;
            for (const preferred of modelPriority) {
              const match = availableModels.find((m: string) =>
                m.includes(preferred),
              );
              if (match) {
                this.selectedModelName = match;
                chosen = true;
                break;
              }
            }
            if (!chosen && availableModels.length > 0) {
              this.selectedModelName = availableModels[0];
            }

            this.logger.log(
              `Gemini AI Service initialized successfully. Selected model: ${this.selectedModelName}`,
            );
          } else {
            this.logger.warn(
              `Failed to parse models from Gemini API. Defaulting to ${this.selectedModelName}`,
            );
          }
        } else {
          this.logger.warn(
            `Failed to fetch models (Status: ${response.status}). Defaulting to ${this.selectedModelName}`,
          );
        }

        this.isConfigured = true;
      } catch (err) {
        this.logger.error(
          'Failed to initialize Gemini AI SDK or fetch models.',
          err,
        );
      }
    } else {
      this.logger.warn(
        'GEMINI_API_KEY is not configured. AI features will be disabled.',
      );
    }
  }

  /**
   * Check if AI assistant is active/configured.
   */
  isEnabled(): boolean {
    return this.isConfigured && this.genAI !== null;
  }

  /**
   * Generate a hash for caching based on normalized query
   */
  private generateQueryHash(message: string, contextSize: number): string {
    // Normalize the query: lowercase, trim, remove extra spaces
    const normalized = message.toLowerCase().trim().replace(/\s+/g, ' ');
    // Include context size to invalidate cache when data changes
    const hashInput = `${normalized}:${contextSize}`;
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Check if a query is cacheable (e.g., summaries, reports)
   */
  private isCacheableQuery(message: string): boolean {
    const cacheableKeywords = [
      'summary',
      'summarize',
      'report',
      'weekly',
      'team',
      'overview',
      'what did',
      'how many',
      'list',
      'show me',
      'tell me about',
    ];

    const lowerMessage = message.toLowerCase();
    return cacheableKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Query the AI Assistant with caching support.
   */
  async chat(message: string, history: ChatMessageDto[] = []): Promise<string> {
    if (!this.isEnabled() || !this.genAI) {
      throw new ServiceUnavailableException(
        'AI Assistant features are currently disabled. Please contact your administrator to configure GEMINI_API_KEY.',
      );
    }

    // 1. Gather all required context from database
    const reports = await this.prisma.weeklyReport.findMany({
      where: {
        status: {
          in: ['SUBMITTED', 'LATE'],
        },
      },
      include: {
        project: {
          select: { name: true },
        },
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
    });

    const contextSize = reports.length; // Use as cache invalidation key

    // 2. Check cache if query is cacheable and no history (first message)
    if (this.isCacheableQuery(message) && history.length === 0) {
      const queryHash = this.generateQueryHash(message, contextSize);

      try {
        const cached = await this.prisma.aiChatCache.findUnique({
          where: { queryHash },
        });

        // Check if cache exists and hasn't expired
        if (cached && new Date() < cached.expiresAt) {
          this.logger.log(
            `Cache HIT for query: "${message.substring(0, 50)}..."`,
          );

          // Update cache statistics
          await this.prisma.aiChatCache.update({
            where: { queryHash },
            data: {
              hitCount: cached.hitCount + 1,
              lastAccessedAt: new Date(),
            },
          });

          return cached.response;
        } else if (cached && new Date() >= cached.expiresAt) {
          // Delete expired cache
          await this.prisma.aiChatCache.delete({ where: { queryHash } });
          this.logger.log(
            `Cache EXPIRED for query: "${message.substring(0, 50)}..."`,
          );
        }
      } catch (error) {
        this.logger.warn('Cache lookup failed, proceeding with AI call', error);
      }
    }

    // 3. Build context (same as before)
    const activeProjects = await this.prisma.project.findMany({
      where: { status: 'ACTIVE' },
      select: { name: true, description: true },
    });

    const activeUsers = await this.prisma.user.findMany({
      select: { firstName: true, lastName: true, role: true, email: true },
    });

    const contextBuilder: string[] = [];
    contextBuilder.push('# SYSTEM CONTEXT DATABASE (senco Weekly Planner)\n');

    contextBuilder.push('## Active Team Members:');
    activeUsers.forEach((u) => {
      contextBuilder.push(
        `- ${u.firstName} ${u.lastName} (${u.role}) [Email: ${u.email}]`,
      );
    });

    contextBuilder.push('\n## Active Projects:');
    activeProjects.forEach((p) => {
      contextBuilder.push(
        `- **${p.name}**: ${p.description || 'No description'}`,
      );
    });

    contextBuilder.push('\n## Submitted Weekly Reports:');
    if (reports.length === 0) {
      contextBuilder.push('No weekly reports have been submitted yet.');
    } else {
      reports.forEach((r) => {
        const uName = r.user
          ? `${r.user.firstName} ${r.user.lastName}`
          : 'Unknown';
        const pName = r.project ? r.project.name : 'Unknown Project';
        contextBuilder.push(`---
Report ID: ${r.id}
User: ${uName} (${r.user?.email})
Project: ${pName}
Week: Week ${r.weekNumber}, Year ${r.year} (Range: ${r.startDate.toDateString()} to ${r.endDate.toDateString()})
Hours Worked: ${r.hoursWorked}
Status: ${r.status}
Tasks Completed:
${r.tasksCompleted}
Tasks Planned:
${r.tasksPlanned}
Blockers:
${r.blockers || 'None'}
Notes:
${r.notes || 'None'}
`);
      });
    }

    const contextContent = contextBuilder.join('\n');

    const systemPrompt = `You are a helpful, friendly, professional, and concise AI assistant for the senco Weekly Report Generator & Team Dashboard.
Your job is to answer managers' questions regarding weekly report submissions, project updates, workload, accomplishments, and blockers.

CRITICAL SECURITY AND PRIVACY DIRECTIVES:
1. You MUST ONLY answer questions using the provided system context.
2. If the user asks about something outside the context of reports, projects, tasks, or team members, politely decline to answer.
3. NEVER expose passwords, password hashes, secrets, JWT tokens, API keys, or raw database structures.
4. NEVER make up information. If the context does not contain the answer, say you do not have that data.

RESPONSE FORMATTING REQUIREMENTS:
1. Always structure your responses in a clear, organized manner using proper formatting.
2. Use bullet points (•) for lists of items.
3. Use numbered lists (1., 2., 3.) for steps or ordered information.
4. Use line breaks to separate different sections of information.
5. Use section headers (in bold) when appropriate to organize information (e.g., **Summary:**, **Blockers:**, **Team Members:**).
6. Keep responses conversational but well-structured, not as raw unformatted text strings.
7. Use proper capitalization and punctuation.
8. When listing multiple items, put each on its own line for readability.

EXAMPLE GOOD RESPONSE FORMAT:
"Here's what Team A accomplished this week:

**Tasks Completed:**
• Implemented user authentication system
• Fixed bug in payment processing
• Deployed new dashboard features

**Hours Worked:** 42 hours total

**Blockers:**
• Waiting for API documentation from external vendor

Would you like more details on any of these items?"

Below is the database context of the system:
${contextContent}`;

    try {
      // 4. Call AI
      const model = this.genAI.getGenerativeModel({
        model: this.selectedModelName,
        systemInstruction: systemPrompt,
      });

      const chat = model.startChat({
        history: history.map((h) => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
      });

      const response = await chat.sendMessage(message);
      const aiResponse = response.response.text();

      // 5. Cache the response if cacheable and no history
      if (this.isCacheableQuery(message) && history.length === 0) {
        const queryHash = this.generateQueryHash(message, contextSize);

        try {
          // Estimate tokens saved (rough estimate: 4 chars = 1 token)
          const estimatedTokens = Math.ceil(
            (contextContent.length + message.length) / 4,
          );

          // Cache for 1 hour for dynamic queries, 24 hours for summaries
          const isLongTermCache =
            message.toLowerCase().includes('summary') ||
            message.toLowerCase().includes('report');
          const expirationHours = isLongTermCache ? 24 : 1;
          const expiresAt = new Date(
            Date.now() + expirationHours * 60 * 60 * 1000,
          );

          await this.prisma.aiChatCache.create({
            data: {
              queryHash,
              query: message,
              response: aiResponse,
              context: {
                reportCount: reports.length,
                projectCount: activeProjects.length,
                userCount: activeUsers.length,
              },
              tokensSaved: estimatedTokens,
              expiresAt,
            },
          });

          this.logger.log(
            `Cached AI response for query: "${message.substring(0, 50)}..." (expires in ${expirationHours}h)`,
          );
        } catch (error) {
          this.logger.warn('Failed to cache AI response', error);
          // Don't fail the request if caching fails
        }
      }

      return aiResponse;
    } catch (err) {
      this.logger.error('Gemini chat execution failed.', err);
      throw new ServiceUnavailableException(
        'AI response generation failed. Please try again later.',
      );
    }
  }
}
