/**
 * POST /api/ai-search
 * Accepts natural language input and extracts structured QuizForm data using OpenAI.
 * Falls back gracefully if OpenAI is unavailable.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractQuizFromNaturalLanguage } from "@/lib/llm";
import type { QuizForm } from "@/types/quiz";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userInput = body.input as string;

        if (!userInput || typeof userInput !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'input' field" },
                { status: 400 }
            );
        }

        if (userInput.length > 500) {
            return NextResponse.json(
                { error: "Input too long. Please keep it under 500 characters." },
                { status: 400 }
            );
        }

        // Check if OpenAI is enabled
        const useOpenAI =
            process.env.ENABLE_OPENAI === "true" && Boolean(process.env.OPENAI_API_KEY);

        if (!useOpenAI) {
            return NextResponse.json(
                {
                    error: "AI search is not enabled. Please use the quiz mode instead.",
                    fallback: true
                },
                { status: 503 }
            );
        }

        // Extract structured data from natural language
        const quizForm = await extractQuizFromNaturalLanguage(userInput);

        return NextResponse.json({
            success: true,
            quiz_form: quizForm,
            extracted_insights: {
                occasion: quizForm.occasion,
                relationship: quizForm.relationship,
                age_range: quizForm.age_range,
                budget: `$${quizForm.budget_min}-$${quizForm.budget_max}`,
                interests: quizForm.interests,
            },
        });
    } catch (e) {
        console.error("/api/ai-search", e);
        const message = e instanceof Error ? e.message : "AI search failed";

        return NextResponse.json(
            {
                error: message,
                fallback: true,
                hint: "Please try the quiz mode for a more reliable experience."
            },
            { status: 500 }
        );
    }
}
