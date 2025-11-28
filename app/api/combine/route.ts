import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Element } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { elementA_ID, elementB_ID } = await req.json();

    if (!elementA_ID || !elementB_ID) {
      return NextResponse.json({ error: '재료가 부족합니다.' }, { status: 400 });
    }

    // Sort IDs to ensure consistent recipe lookup
    const input_a = Math.min(elementA_ID, elementB_ID);
    const input_b = Math.max(elementA_ID, elementB_ID);

    // Step 1: Check if recipe exists
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('result_id')
      .eq('input_a', input_a)
      .eq('input_b', input_b)
      .single();

    if (recipe && !recipeError) {
      const { data: existingElement, error: elementError } = await supabase
        .from('elements')
        .select('*')
        .eq('id', recipe.result_id)
        .single();

      if (existingElement && !elementError) {
        return NextResponse.json({ result: existingElement, isNewDiscovery: false });
      }
    }

    // Step 2: Fetch input elements details for AI prompt
    const { data: elements, error: elementsError } = await supabase
      .from('elements')
      .select('text')
      .in('id', [input_a, input_b]);

    if (elementsError || !elements || elements.length !== 2) {
        // Handle case where same element is combined with itself (elements.length would be 1)
        if (input_a === input_b && elements && elements.length === 1) {
             // Correctly handled
        } else if (input_a !== input_b && (!elements || elements.length !== 2)) {
             return NextResponse.json({ error: '재료를 찾을 수 없습니다.' }, { status: 404 });
        }
    }
    
    // If input_a === input_b, we only get one element from DB.
    if (!elements) return NextResponse.json({ error: '재료를 찾을 수 없습니다.' }, { status: 404 });
    
    const elementAText = elements.find(e => true)?.text; // Just take the first one if same
    const elementBText = input_a === input_b ? elementAText : elements.find((_, i) => i === 1)?.text || elements[0].text; 
    
    // Better way to get names
    const names = elements.map(e => e.text);
    const nameA = names[0];
    const nameB = input_a === input_b ? names[0] : names[1];


    // Step 3: AI Generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const prompt = `You are an alchemy game engine. Combine "${nameA}" and "${nameB}" into a new concept. Return ONLY JSON: { "text": "Korean Name", "emoji": "Icon" }. Rules: Output must be in Korean (Hangul). Nouns only.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let aiOutput;
    try {
        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        aiOutput = JSON.parse(jsonStr);
    } catch (e) {
        console.error("AI Parse Error", text);
        return NextResponse.json({ error: '새로운 발견에 실패했습니다.' }, { status: 500 });
    }

    // Step 4: Save to DB
    // Check if element already exists by text to avoid duplicates
    const { data: existingElementByText } = await supabase
        .from('elements')
        .select('*')
        .eq('text', aiOutput.text)
        .single();

    let resultElement: Element;
    let isNewDiscovery = false;

    if (existingElementByText) {
        resultElement = existingElementByText;
    } else {
        const { data: newElement, error: insertError } = await supabase
            .from('elements')
            .insert([
                { text: aiOutput.text, emoji: aiOutput.emoji, is_first_discovery: true }
            ])
            .select()
            .single();
        
        if (insertError || !newElement) {
             return NextResponse.json({ error: '저장 실패' }, { status: 500 });
        }
        resultElement = newElement;
        isNewDiscovery = true;
    }

    // Save recipe
    await supabase
        .from('recipes')
        .insert([
            { input_a, input_b, result_id: resultElement.id }
        ]);

    return NextResponse.json({ result: resultElement, isNewDiscovery });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
