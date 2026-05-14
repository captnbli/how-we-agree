import Anthropic from '@anthropic-ai/sdk';
import type { Crystalliser, PostSummary } from './types';

const client = new Anthropic();

export const claudeCrystalliser: Crystalliser = {
  async crystallise(question, posts) {
    const thread = posts.map((p) => `${p.participant}: ${p.body}`).join('\n\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You are witnessing a group deliberation. People are responding to a shared question.
Your role is to read the thread and name, tentatively, what seems to be emerging — where there is convergence, where there is tension, what remains open.
Speak as a careful observer, not an authority. Be honest about uncertainty. Do not impose a conclusion the group has not reached.
Write one short paragraph. Plain language. No bullet points.`,
      messages: [
        {
          role: 'user',
          content: `The question put to the group:\n"${question}"\n\nThe thread so far:\n\n${thread}`,
        },
      ],
    });

    return message.content[0].type === 'text' ? message.content[0].text : '';
  },
};
