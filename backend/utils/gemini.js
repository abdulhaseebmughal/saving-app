const axios = require('axios');

/**
 * Enhanced metadata extraction using Gemini AI with LinkSaver pattern
 * Returns structured JSON with comprehensive metadata
 */
async function generateLinkMetadata(url, scrapedData = {}) {
  try {
    const systemPrompt = `You are Gemini inside an app named "LinkSaver". Purpose: when given a URL, extract clean, reliable metadata and a compact intelligent summary for display and search. Always return a single valid JSON object and nothing else (no extra text, no code fences). Use the exact schema below. Prioritize Open Graph / Twitter Card data (og:title, og:description, og:image) and fall back to HTML <title>, <meta name="description">, largest meaningful image, or site favicon. If content seems non-HTML (PDF, image), adapt fields accordingly. Detect language. Trim fields to safe lengths: title ≤ 200 chars, description ≤ 1000 chars, summary ≤ 600 chars. Generate 3-6 tags (lowercase, hyphenated if multiword). Set "confidence" as a number 0.0–1.0 reflecting how sure you are about extraction.

Return JSON with keys:
{
  "url": string,                   // original URL
  "domain": string,                // e.g. "example.com"
  "title": string | null,
  "description": string | null,
  "summary": string | null,        // short AI summary (1-3 sentences)
  "image": string | null,          // best image URL (og:image or other)
  "favicon": string | null,        // favicon URL if found
  "published_date": string | null, // ISO 8601 if found
  "author": string | null,
  "language": string | null,       // ISO code if possible
  "tags": [string],                // 3-6 tags
  "readability_score": number|null,// optional 0-100
  "content_type": string,          // "article", "product", "image", "pdf", etc.
  "confidence": number,            // 0.0 - 1.0
  "notes": string|null             // any short parsing notes (<=200 chars)
}
If any field is unknown, set it to null. Do not include additional keys. Preserve valid absolute URLs for image and favicon.`;

    const userPrompt = `URL: ${url}

Scraped Data:
${JSON.stringify(scrapedData, null, 2)}

Extract and return the metadata JSON:`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: "user",
          parts: [{ text: userPrompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 0.9,
          maxOutputTokens: 2048,
          responseMimeType: "application/json"
        }
      }
    );

    let text = response.data.candidates[0].content.parts[0].text.trim();

    // Clean up potential markdown code fences
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

    const metadata = JSON.parse(text);

    return metadata;
  } catch (err) {
    console.error('Gemini API Error:', err.response?.data || err.message);

    // Intelligent fallback with meaningful summary
    const fallbackSummary = scrapedData.description ||
                           scrapedData.title ||
                           `Content from ${extractDomain(url)}`;

    const fallbackTags = [];
    if (scrapedData.title) {
      const words = scrapedData.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      fallbackTags.push(...words.slice(0, 3));
    }
    fallbackTags.push('saved-link');

    return {
      url: url,
      domain: extractDomain(url),
      title: scrapedData.title || url,
      description: scrapedData.description || null,
      summary: fallbackSummary,
      image: scrapedData.image || null,
      favicon: scrapedData.favicon || null,
      published_date: scrapedData.publishedDate || null,
      author: scrapedData.author || null,
      language: 'en',
      tags: fallbackTags,
      readability_score: null,
      content_type: 'webpage',
      confidence: 0.5,
      notes: null
    };
  }
}

/**
 * Generate summary and tags for non-link content (notes, code, components)
 */
async function generateSummary(content, type = 'note') {
  try {
    const systemPrompt = `You are an AI content analyzer. Analyze the given ${type} and provide a meaningful summary and relevant tags. Always respond with valid JSON only.`;

    const userPrompt = `Analyze this ${type} and provide:
1. A brief, meaningful summary (1-3 sentences, max 600 chars)
2. 3-6 highly relevant tags (lowercase, hyphenated if multiword)

Content:
${content.substring(0, 5000)}

Respond with this exact JSON format:
{
  "summary": "your concise summary here",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: "user",
          parts: [{ text: userPrompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.9,
          maxOutputTokens: 1024,
          responseMimeType: "application/json"
        }
      }
    );

    let text = response.data.candidates[0].content.parts[0].text.trim();

    // Clean up potential markdown code fences
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

    const result = JSON.parse(text);

    return {
      summary: result.summary || content.substring(0, 150) + '...',
      tags: Array.isArray(result.tags) ? result.tags : [type, 'saved']
    };
  } catch (err) {
    console.error('Gemini API Error:', err.response?.data || err.message);

    // Intelligent fallback based on content
    const firstLine = content.split('\n')[0].substring(0, 150);
    const summary = firstLine || content.substring(0, 150) + '...';

    // Extract potential tags from content
    const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const uniqueWords = [...new Set(words)].slice(0, 5);
    const tags = uniqueWords.length > 0 ? uniqueWords : [type, 'saved'];

    return {
      summary,
      tags
    };
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (err) {
    return null;
  }
}

/**
 * Detect platform from URL
 * Returns: youtube, instagram, github, twitter, linkedin, facebook, medium, reddit, tiktok, website, other
 */
function detectPlatform(url) {
  try {
    const urlLower = url.toLowerCase();
    const domain = extractDomain(url);

    if (!domain) return 'other';

    // Platform detection rules
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return 'youtube';
    }
    if (domain.includes('instagram.com')) {
      return 'instagram';
    }
    if (domain.includes('github.com')) {
      return 'github';
    }
    if (domain.includes('twitter.com') || domain.includes('x.com')) {
      return 'twitter';
    }
    if (domain.includes('linkedin.com')) {
      return 'linkedin';
    }
    if (domain.includes('facebook.com') || domain.includes('fb.com')) {
      return 'facebook';
    }
    if (domain.includes('medium.com')) {
      return 'medium';
    }
    if (domain.includes('reddit.com')) {
      return 'reddit';
    }
    if (domain.includes('tiktok.com')) {
      return 'tiktok';
    }

    return 'website';
  } catch (err) {
    return 'other';
  }
}

/**
 * AI-powered category detection for content (especially videos)
 * Uses Gemini to analyze title, description, and tags
 * Returns: education, technology, entertainment, ai, programming, design, business, music, gaming, news, lifestyle, other
 */
async function detectCategory(metadata, platform) {
  try {
    // If we have enough info, use AI to detect category
    const contentInfo = {
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      platform: platform
    };

    const systemPrompt = `You are a content categorization AI. Analyze the given content metadata and categorize it into ONE of these categories:
- education: Educational content, tutorials, courses, lectures
- technology: General tech news, gadgets, tech reviews
- ai: Artificial Intelligence, Machine Learning, AI tools
- programming: Coding, software development, programming languages
- design: UI/UX, graphic design, web design, creative work
- business: Business strategy, entrepreneurship, marketing
- music: Music videos, songs, music production
- gaming: Video games, gaming content, esports
- news: News, current events, journalism
- entertainment: General entertainment, comedy, vlogs
- lifestyle: Health, fitness, cooking, travel, fashion
- other: Anything that doesn't fit above

Return ONLY a single word from the categories above. No explanation, no JSON, just the category word.`;

    const userPrompt = `Categorize this content:
Title: ${contentInfo.title || 'N/A'}
Description: ${(contentInfo.description || '').substring(0, 500)}
Platform: ${contentInfo.platform}
Tags: ${(contentInfo.tags || []).join(', ')}

Category:`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: "user",
          parts: [{ text: userPrompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10
        }
      }
    );

    const category = response.data.candidates[0].content.parts[0].text.trim().toLowerCase();

    // Validate category
    const validCategories = [
      'education', 'technology', 'entertainment', 'ai', 'programming',
      'design', 'business', 'music', 'gaming', 'news', 'lifestyle', 'other'
    ];

    if (validCategories.includes(category)) {
      return category;
    }

    // Fallback to keyword-based detection
    return keywordBasedCategory(metadata);

  } catch (err) {
    console.error('Category detection error:', err.message);
    // Fallback to keyword-based detection
    return keywordBasedCategory(metadata);
  }
}

/**
 * Fallback: Keyword-based category detection
 */
function keywordBasedCategory(metadata) {
  const text = `${metadata.title || ''} ${metadata.description || ''} ${(metadata.tags || []).join(' ')}`.toLowerCase();

  if (text.match(/\b(tutorial|course|learn|education|teach|lesson|lecture)\b/)) {
    return 'education';
  }
  if (text.match(/\b(ai|artificial intelligence|machine learning|neural|gpt|llm)\b/)) {
    return 'ai';
  }
  if (text.match(/\b(code|coding|programming|developer|javascript|python|react|software)\b/)) {
    return 'programming';
  }
  if (text.match(/\b(design|ui|ux|figma|adobe|creative|graphic)\b/)) {
    return 'design';
  }
  if (text.match(/\b(music|song|album|artist|band|concert)\b/)) {
    return 'music';
  }
  if (text.match(/\b(game|gaming|esport|gameplay|streamer)\b/)) {
    return 'gaming';
  }
  if (text.match(/\b(business|startup|entrepreneur|marketing|sales)\b/)) {
    return 'business';
  }
  if (text.match(/\b(news|breaking|report|journalism)\b/)) {
    return 'news';
  }
  if (text.match(/\b(tech|technology|gadget|innovation)\b/)) {
    return 'technology';
  }
  if (text.match(/\b(health|fitness|cooking|travel|fashion|lifestyle)\b/)) {
    return 'lifestyle';
  }
  if (text.match(/\b(comedy|entertainment|fun|vlog|funny)\b/)) {
    return 'entertainment';
  }

  return 'other';
}

module.exports = {
  generateLinkMetadata,
  generateSummary,
  extractDomain,
  detectPlatform,
  detectCategory
};
