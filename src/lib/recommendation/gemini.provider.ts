import type { RecommendationProvider } from './provider.interface'
import type { RecommendationInput, ScoredContent } from '@/types'

/**
 * Real Google Gemini recommendation provider.
 * Reranks candidates and generates personalized explanations.
 */
export class GeminiRecommendationProvider implements RecommendationProvider {
  readonly name = 'gemini'
  
  // Cache to store explanations from the recommend call to avoid redundant API calls
  private explanationCache = new Map<string, string>()

  async recommend(
    input: RecommendationInput,
    candidates: ScoredContent[],
    topN = 5
  ): Promise<ScoredContent[]> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn('[GeminiRecommendationProvider] GEMINI_API_KEY not set. Falling back to scoring engine.')
      return [...candidates]
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
    }

    try {
      // 1. Prepare candidate list for Gemini
      const candidateList = candidates.map((c, i) => {
        const content = c.content as any
        const type = content.type
        const runtime = type === 'movie' 
          ? content.runtimeMins 
          : type === 'tv_show' 
            ? content.episodeRuntime 
            : content.durationMins // youtube
        
        return {
          index: i,
          id: content.id,
          title: content.title,
          type: type,
          overview: content.overview || '',
          genres: content.genres?.map((g: any) => g.name).join(', ') || '',
          runtimeMins: runtime || 'unknown',
          language: content.language || 'unknown',
          score: c.score,
          channelTitle: content.channelTitle || undefined
        }
      })

      // 2. Build the prompt
      const prompt = `You are the recommendation engine for WatchFast AI, an app that finds the perfect movie, TV show, or YouTube video in under 10 seconds.
Your task is to select the top ${topN} recommendations from a list of 20 pre-scored candidates, based on the user's preferences, and explain why they fit.

User Profile & Preferences:
- Available Time: ${input.timeAvail} minutes (strongly favor content fitting this window; do not exceed it significantly).
- Mood: ${input.mood}
- Platform Filter: ${input.platform ?? 'any'} (favor this platform if specified).
- Language: ${input.language ?? 'any'} (favor this language).
- Meal Mode: ${input.mealMode ?? 'none'} (if specified, e.g., "breakfast", pick light, shorter, or mood-appropriate content).

Candidate List (Pre-scored by our rules):
${JSON.stringify(candidateList, null, 2)}

Instructions:
1. Review the candidate list. Choose the top ${topN} items that best match the User's preferences. Feel free to re-rank them if you think certain items match the user's mood, meal mode, or time constraint much better than their pre-scored order.
2. For each selected item, write a highly personalized, engaging 1-to-2 sentence explanation of why it fits the user's mood, time available (${input.timeAvail}m), and context (e.g. meal mode). Do not sound robotic. Be warm, enthusiastic, and direct. Refer to details in the movie overview or genre.
3. Return ONLY a JSON object with this exact structure:
{
  "recommendations": [
    {
      "id": "candidate_id",
      "explanation": "Personalized explanation here."
    }
  ]
}
Do not write any markdown code fences (like \`\`\`json) or other text around the JSON block. Just return raw JSON.
`

      // 3. Make fetch request
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        throw new Error('Empty response from Gemini')
      }

      // 4. Parse the output
      const result = JSON.parse(text)
      const recs = result.recommendations as Array<{ id: string; explanation: string }>
      
      if (!Array.isArray(recs)) {
        throw new Error('Invalid JSON format: recommendations array not found')
      }

      // 5. Match back to original candidates
      const rankedCandidates: ScoredContent[] = []
      
      // Store explanations in the cache
      for (const rec of recs) {
        const matched = candidates.find(c => {
          const content = c.content as any
          return content.id === rec.id || content.videoId === rec.id
        })
        if (matched) {
          const id = matched.content.id
          this.explanationCache.set(id, rec.explanation)
          rankedCandidates.push({
            ...matched,
            explanation: rec.explanation
          })
        }
      }

      // If Gemini returned fewer items than requested or items didn't match, fill in from original candidates
      if (rankedCandidates.length < topN) {
        for (const candidate of candidates) {
          if (rankedCandidates.length >= topN) break
          const id = candidate.content.id
          if (!rankedCandidates.some(rc => rc.content.id === id)) {
            rankedCandidates.push(candidate)
          }
        }
      }

      return rankedCandidates.slice(0, topN)

    } catch (error) {
      console.error('[GeminiRecommendationProvider] Error during recommendation:', error)
      // Fallback: sort by original score
      return [...candidates]
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
    }
  }

  async rerank(
    input: RecommendationInput,
    items: ScoredContent[]
  ): Promise<ScoredContent[]> {
    return this.recommend(input, items, items.length)
  }

  async explain(
    input: RecommendationInput,
    item: ScoredContent
  ): Promise<string> {
    const id = item.content.id
    // Check cache first (99% hit rate due to recommend pre-populating)
    if (this.explanationCache.has(id)) {
      return this.explanationCache.get(id)!
    }

    // Fallback if not cached
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return this.mockExplain(input, item)
    }

    try {
      const content = item.content as any
      const prompt = `Generate a warm, engaging, personalized 1-2 sentence explanation for why the user should watch this movie/show/video.
User mood: ${input.mood}
Time available: ${input.timeAvail} minutes
Meal mode: ${input.mealMode ?? 'none'}
Content:
Title: ${content.title}
Type: ${content.type}
Overview: ${content.overview || ''}
Genres: ${content.genres?.map((g: any) => g.name).join(', ') || ''}

Return ONLY the raw explanation text, no JSON, no formatting.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      if (!response.ok) throw new Error('API error')
      const data = await response.json()
      const explanation = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (explanation) {
        this.explanationCache.set(id, explanation)
        return explanation
      }
    } catch (e) {
      console.error('[GeminiRecommendationProvider] Error in explain:', e)
    }

    return this.mockExplain(input, item)
  }

  private mockExplain(input: RecommendationInput, item: ScoredContent): string {
    const { mood, timeAvail } = input
    const { content } = item
    return `${content.title} is selected to fit your ${mood} mood for a ${timeAvail}-minute duration.`
  }
}
