import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

interface GenerateResponseOptions {
  businessName: string;
  reviewerName: string;
  rating: number;
  reviewText: string | null;
}

export async function generateReviewResponse({
  businessName,
  reviewerName,
  rating,
  reviewText,
}: GenerateResponseOptions): Promise<string> {
  const ratingContext =
    rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";

  const prompt = `You are writing a professional Google review response for ${businessName}, a salon or med spa.

Review details:
- Reviewer: ${reviewerName}
- Rating: ${rating}/5 stars (${ratingContext})
- Review text: ${reviewText ?? "(no text, just a star rating)"}

Write a warm, professional response that:
1. Thanks the reviewer by first name
2. Acknowledges specific points they mentioned (if any)
3. For negative reviews: apologizes sincerely and offers to make it right privately
4. For positive reviews: expresses genuine appreciation and invites them back
5. Sounds human and personal, not like a template
6. Is 2-4 sentences max
7. Ends with the business name signature

Respond with ONLY the review response text, nothing else.`;

  const message = await getClient().messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  return content.text.trim();
}
