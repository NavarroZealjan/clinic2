import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const userMessage = message.toLowerCase().trim();
    console.log("[v0] Chatbot received message:", userMessage);

    // First, fetch active announcements
    const announcementResult = await query(
      `SELECT id, title, message as answer, category FROM clinic_announcements 
       WHERE is_active = true 
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       ORDER BY created_at DESC LIMIT 5`,
    );

    const announcements = announcementResult.rows.map((a) => ({
      ...a,
      isAnnouncement: true,
      score: 100, // Announcements always take priority
    }));

    let botResponse;
    let matchedItemId = null;

    // If there are active announcements, check if user is asking about general info
    if (
      announcements.length > 0 &&
      (userMessage.includes("what") ||
        userMessage.includes("how") ||
        userMessage.includes("when") ||
        userMessage.includes("today"))
    ) {
      // Show first active announcement
      botResponse = announcements[0].answer;
      matchedItemId = announcements[0].id;
      console.log("[v0] Showing announcement:", announcements[0].title);
    } else {
      // Function to calculate string similarity
      const calculateSimilarity = (str1, str2) => {
        if (str1.length === 0 || str2.length === 0) return 0;
        const userWords = str1.split(/\s+/);
        const targetWords = str2.split(/\s+/);
        let matchedWords = 0;
        userWords.forEach((word) => {
          if (
            word.length > 2 &&
            targetWords.some(
              (target) => target.includes(word) || word.includes(target),
            )
          ) {
            matchedWords++;
          }
        });
        return matchedWords / Math.max(userWords.length, targetWords.length);
      };

      // Fetch all FAQs from database (keeping old FAQ system if it exists)
      let faqs = [];
      try {
        const result = await query(
          "SELECT id, question, answer, keywords, category, priority FROM faq_knowledge ORDER BY priority DESC",
        );
        faqs = result.rows;
      } catch (e) {
        console.log("[v0] FAQ table not found, using announcements only");
      }

      // Score each FAQ based on multiple factors
      const scoredFaqs = faqs.map((faq) => {
        let score = 0;
        const keywords = faq.keywords || [];
        const questionLower = faq.question.toLowerCase();

        // 1. Keyword matching (highest priority)
        keywords.forEach((keyword) => {
          if (userMessage.includes(keyword.toLowerCase())) {
            score += 20;
          }
        });

        // 2. Question similarity matching
        const questionSimilarity = calculateSimilarity(
          userMessage,
          questionLower,
        );
        score += questionSimilarity * 30;

        // 3. Partial word matching
        const userWords = userMessage.split(/\s+/);
        const questionWords = questionLower.split(/\s+/);
        userWords.forEach((word) => {
          if (word.length > 3) {
            questionWords.forEach((qWord) => {
              if (qWord.includes(word) || word.includes(qWord)) {
                score += 5;
              }
            });
          }
        });

        // 4. Priority boost
        score += (faq.priority || 0) * 2;

        return { ...faq, score };
      });

      // Sort by score and get best match
      scoredFaqs.sort((a, b) => b.score - a.score);
      const bestMatch = scoredFaqs[0];

      // Require minimum score of 10 for a confident match
      if (bestMatch && bestMatch.score >= 10) {
        botResponse = bestMatch.answer;
        matchedItemId = bestMatch.id;
        console.log(
          "[v0] Matched FAQ:",
          bestMatch.question,
          "Score:",
          bestMatch.score,
        );
      } else {
        botResponse =
          "I'm not sure about that. Please call us at (123) 456-7890 or email contact@eclinic.com for assistance. Our staff will be happy to help you!";
        console.log(
          "[v0] No match found (score: " +
            (bestMatch?.score || 0) +
            "), using fallback response",
        );
      }
    }

    // Save chat history to database
    try {
      await query(
        "INSERT INTO chat_history (session_id, user_message, bot_response, matched_faq_id) VALUES ($1, $2, $3, $4)",
        [sessionId, message, botResponse, matchedItemId],
      );
    } catch (e) {
      console.log("[v0] Chat history table not found, skipping save");
    }

    return NextResponse.json({
      response: botResponse,
      category: "General",
    });
  } catch (error) {
    console.error("[v0] Chatbot error:", error);
    return NextResponse.json(
      { error: "Failed to process message", details: error.message },
      { status: 500 },
    );
  }
}
