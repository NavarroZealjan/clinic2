import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const userMessage = message.toLowerCase().trim();
    console.log("Chatbot received message:", userMessage);

    // Fetch all FAQs from database
    const result = await query(
      "SELECT id, question, answer, keywords, category, priority FROM faq_knowledge ORDER BY priority DESC"
    );

    const faqs = result.rows;

    // Score each FAQ based on keyword matches
    const scoredFaqs = faqs.map((faq) => {
      let score = 0;
      const keywords = faq.keywords || [];

      keywords.forEach((keyword) => {
        if (userMessage.includes(keyword.toLowerCase())) {
          score += 10;
        }
      });

      // Bonus for question match
      if (userMessage.includes(faq.question.toLowerCase().substring(0, 20))) {
        score += 15;
      }

      return { ...faq, score };
    });

    // Sort by score and get best match
    scoredFaqs.sort((a, b) => b.score - a.score);
    const bestMatch = scoredFaqs[0];

    let botResponse;
    let matchedFaqId = null;

    if (bestMatch && bestMatch.score > 0) {
      botResponse = bestMatch.answer;
      matchedFaqId = bestMatch.id;
      console.log(
        "[v0] Matched FAQ:",
        bestMatch.question,
        "Score:",
        bestMatch.score
      );
    } else {
      botResponse =
        "I'm not sure about that. Please call us at (123) 456-7890 or email contact@eclinic.com for assistance. Our staff will be happy to help you!";
      console.log("[v0] No match found, using fallback response");
    }

    // Save chat history to database
    await query(
      "INSERT INTO chat_history (session_id, user_message, bot_response, matched_faq_id) VALUES ($1, $2, $3, $4)",
      [sessionId, message, botResponse, matchedFaqId]
    );

    return NextResponse.json({
      response: botResponse,
      category: bestMatch?.category || "General",
    });
  } catch (error) {
    console.error("[v0] Chatbot error:", error);
    return NextResponse.json(
      { error: "Failed to process message", details: error.message },
      { status: 500 }
    );
  }
}
