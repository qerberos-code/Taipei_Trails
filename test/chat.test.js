import test from 'node:test';
import assert from 'node:assert/strict';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage } from '@langchain/core/messages';
import { chatWithTrails } from '../server/chat.js';
import { chatRequestSchema } from '../server/contracts.js';

class ScriptedModel extends BaseChatModel {
  constructor(responses) { super({}); this.responses = responses; this.seen = []; }
  _llmType() { return 'scripted-test-model'; }
  bindTools(tools) { this.toolNames = tools.map(t => t.name); return this; }
  async _generate(messages) {
    this.seen.push(messages);
    const message = this.responses.shift();
    if (!message) throw new Error('Unexpected extra model call');
    return { generations: [{ message, text: typeof message.content === 'string' ? message.content : '' }] };
  }
}

const toolCall = (name, args) => new AIMessage({ content: '', tool_calls: [{ id: `${name}-call`, name, args, type: 'tool_call' }] });

test('real LangChain agent executes route tool and returns only matching cards', async () => {
  const model = new ScriptedModel([
    toolCall('search_trails', { area: '北投', experience: 'beginner', maxDistanceKm: 3, maxMinutes: 120 }),
    new AIMessage('可以考慮軍艦岩，資料尚待核對。'),
  ]);
  const input = chatRequestSchema.parse({ messages: [{ role: 'user', content: '北投三公里內，新手適合的步道' }] });
  const result = await chatWithTrails(input, { model });
  assert.deepEqual(result.recommendations.map(t => t.id), ['junjianyan']);
  const toolResult = model.seen[1].find(m => m.type === 'tool' || m._getType() === 'tool');
  assert.equal(JSON.parse(toolResult.content).routes[0].id, 'junjianyan');
  assert.equal(model.toolNames.length, 4);
});

test('follow-up history and selected trail reach the model and preparation tool', async () => {
  const model = new ScriptedModel([
    toolCall('plan_preparation', { trailId: null, hours: null, people: 2, heat: 'unknown' }),
    new AIMessage('兩人請依每人估算量準備水與備用點心。'),
  ]);
  const input = chatRequestSchema.parse({
    context: { selectedTrailId: 'elephant', experience: 'beginner' },
    messages: [
      { role: 'user', content: '我要走象山' }, { role: 'assistant', content: '已選象山。' },
      { role: 'user', content: '兩個人要帶多少水？' },
    ],
  });
  const result = await chatWithTrails(input, { model });
  assert.ok(model.seen[0].some(m => JSON.stringify(m.content).includes('elephant')),
    JSON.stringify(model.seen[0].map(m => ({ type: m._getType(), content: m.content }))));
  assert.ok(model.seen[0].some(m => m.content === '我要走象山'));
  const output = JSON.parse(model.seen[1].find(m => m._getType() === 'tool').content);
  assert.equal(output.trailName, '象山步道');
  assert.equal(output.people, 2);
  assert.equal(output.hours, 57 / 60);
  assert.equal(result.sources.length, 2);
  assert.deepEqual(result.recommendations, []);
});

test('missing duration triggers a tool clarification instead of made-up quantities', async () => {
  const model = new ScriptedModel([
    toolCall('plan_preparation', { trailId: null, hours: null, people: 1, heat: 'unknown' }),
    new AIMessage('你預計走多久，或想走哪條步道？'),
  ]);
  const result = await chatWithTrails(chatRequestSchema.parse({ messages: [{ role: 'user', content: '要帶多少水？' }] }), { model });
  const output = JSON.parse(model.seen[1].find(m => m._getType() === 'tool').content);
  assert.ok(output.error.includes('詢問健行時間'));
  assert.equal(result.sources.length, 0);
});

test('sidebar profile reaches the agent and supplies group size to the preparation tool', async () => {
  const model = new ScriptedModel([
    toolCall('plan_preparation', { trailId: null, hours: 2, people: null, heat: 'normal' }),
    new AIMessage('三人請各自準備水與裝備。'),
  ]);
  const context = {
    people: 3, age: 35, heightCm: 172.5, weightKg: 68.5,
    experience: 'intermediate', intensity: 'low', personalNotes: '習慣背 20L 背包，帶 1.5L 水和登山杖。',
  };
  await chatWithTrails(chatRequestSchema.parse({ context, messages: [{ role: 'user', content: '要帶多少水？' }] }), { model });
  const content = model.seen[0].find(message => message._getType() === 'system').content;
  const system = typeof content === 'string' ? content : content.map(block => block.text ?? '').join('\n');
  for (const [key, value] of Object.entries(context)) {
    assert.ok(system.includes(JSON.stringify(key) + ':' + JSON.stringify(value)), `Profile field missing: ${key}`);
  }
  const output = JSON.parse(model.seen[1].find(message => message._getType() === 'tool').content);
  assert.equal(output.people, 3);
  assert.deepEqual(output.waterLitersForGroup, [4.5, 4.5]);
});

test('explicit conversation group size overrides sidebar size', async () => {
  const model = new ScriptedModel([
    toolCall('plan_preparation', { trailId: null, hours: 2, people: 2, heat: 'normal' }),
    new AIMessage('這次以兩人規劃。'),
  ]);
  await chatWithTrails(chatRequestSchema.parse({
    context: { people: 5 }, messages: [{ role: 'user', content: '這次兩個人走兩小時。' }],
  }), { model });
  const output = JSON.parse(model.seen[1].find(message => message._getType() === 'tool').content);
  assert.equal(output.people, 2);
  assert.deepEqual(output.waterLitersForGroup, [3, 3]);
});

test('older requests receive defaults and optional body details remain unknown', () => {
  const emptyContext = chatRequestSchema.parse({ messages: [{ role: 'user', content: '推薦步道' }] }).context;
  const partialContext = chatRequestSchema.parse({ context: { experience: 'expert' }, messages: [{ role: 'user', content: '推薦步道' }] }).context;
  assert.equal(emptyContext.people, 1);
  assert.equal(partialContext.people, 1);
  assert.equal(partialContext.experience, 'expert');
  for (const key of ['age', 'heightCm', 'weightKg']) assert.equal(emptyContext[key], null);
  assert.equal(emptyContext.intensity, 'moderate');
  assert.equal(emptyContext.personalNotes, '');
});

test('English locale controls the next reply even with Traditional Chinese chat history', async () => {
  const model = new ScriptedModel([new AIMessage('Which district would you like to explore?')]);
  const result = await chatWithTrails(chatRequestSchema.parse({
    locale: 'en',
    messages: [{ role: 'user', content: '我要走象山' }, { role: 'assistant', content: '已選象山。' }, { role: 'user', content: 'Suggest another trail.' }],
  }), { model });
  const system = model.seen[0].find(message => message._getType() === 'system');
  assert.match(JSON.stringify(system.content), /Answer in English by default/);
  assert.ok(model.seen[0].some(message => message.content === '已選象山。'));
  assert.equal(result.reply, 'Which district would you like to explore?');
});
