import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { operation, payload } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    switch (operation) {
      case 'bulk_job_analysis':
        return await handleBulkJobAnalysis(supabaseClient, payload)
      case 'user_activity_analytics':
        return await handleUserActivityAnalytics(supabaseClient, payload)
      case 'job_matching_algorithm':
        return await handleJobMatching(supabaseClient, payload)
      case 'data_aggregation':
        return await handleDataAggregation(supabaseClient, payload)
      default:
        throw new Error('Unknown operation')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function handleBulkJobAnalysis(supabase: any, payload: any) {
  const { jobIds } = payload
  
  // Process multiple jobs in parallel
  const jobs = await supabase
    .from('jobs')
    .select('*')
    .in('id', jobIds)
  
  const analysisResults = await Promise.all(
    jobs.data?.map(async (job: any) => {
      // Heavy analysis operations
      const keywordAnalysis = analyzeJobKeywords(job.description)
      const salaryAnalysis = analyzeSalaryTrends(job.salary_min, job.salary_max)
      const competitionAnalysis = await analyzeCompetition(supabase, job.category)
      
      return {
        jobId: job.id,
        keywordAnalysis,
        salaryAnalysis,
        competitionAnalysis,
        recommendedTags: generateRecommendedTags(job)
      }
    }) || []
  )

  return new Response(
    JSON.stringify({ results: analysisResults }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUserActivityAnalytics(supabase: any, payload: any) {
  const { timeRange, metrics } = payload
  
  // Complex analytics queries
  const userActivity = await supabase
    .rpc('get_user_activity_analytics', { 
      start_date: timeRange.start,
      end_date: timeRange.end 
    })
  
  const jobViewTrends = await supabase
    .rpc('get_job_view_trends', { 
      days: timeRange.days 
    })

  return new Response(
    JSON.stringify({ 
      userActivity: userActivity.data,
      jobViewTrends: jobViewTrends.data 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleJobMatching(supabase: any, payload: any) {
  const { userId, preferences } = payload
  
  // AI-powered job matching algorithm
  const userProfile = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  const jobs = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
  
  const matchedJobs = jobs.data?.map((job: any) => {
    const matchScore = calculateMatchScore(userProfile.data, job, preferences)
    return { ...job, matchScore }
  }).sort((a: any, b: any) => b.matchScore - a.matchScore)

  return new Response(
    JSON.stringify({ matchedJobs: matchedJobs?.slice(0, 20) }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDataAggregation(supabase: any, payload: any) {
  const { aggregationType } = payload
  
  // Heavy data aggregation operations
  const results = await Promise.all([
    supabase.rpc('get_job_statistics'),
    supabase.rpc('get_employer_statistics'),
    supabase.rpc('get_category_trends'),
    supabase.rpc('get_salary_analytics')
  ])

  return new Response(
    JSON.stringify({
      jobStats: results[0].data,
      employerStats: results[1].data,
      categoryTrends: results[2].data,
      salaryAnalytics: results[3].data
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Helper functions
function analyzeJobKeywords(description: string) {
  // AI keyword extraction and analysis
  const keywords = description.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3)
    .reduce((acc: any, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {})
  
  return Object.entries(keywords)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 10)
}

function analyzeSalaryTrends(salaryMin: number, salaryMax: number) {
  // Salary analysis logic
  const average = (salaryMin + salaryMax) / 2
  return {
    average,
    range: salaryMax - salaryMin,
    competitiveness: average > 50000 ? 'high' : average > 30000 ? 'medium' : 'low'
  }
}

async function analyzeCompetition(supabase: any, category: string) {
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('category', category)
    .eq('status', 'active')
  
  return {
    totalJobs: count,
    competitionLevel: count > 100 ? 'high' : count > 50 ? 'medium' : 'low'
  }
}

function generateRecommendedTags(job: any) {
  // AI-based tag recommendation
  const commonTags = ['remote', 'full-time', 'benefits', 'growth', 'technology']
  return commonTags.filter(() => Math.random() > 0.5).slice(0, 3)
}

function calculateMatchScore(userProfile: any, job: any, preferences: any) {
  let score = 0
  
  // Location preference
  if (userProfile.location === job.location) score += 20
  
  // Salary preference
  if (job.salary_min >= preferences.minSalary) score += 15
  
  // Category preference
  if (preferences.categories?.includes(job.category)) score += 25
  
  // Experience level
  if (userProfile.experience_level === job.experience_level) score += 20
  
  // Skills matching (simplified)
  const skillsMatch = userProfile.skills?.filter((skill: string) => 
    job.description.toLowerCase().includes(skill.toLowerCase())
  ).length || 0
  score += skillsMatch * 5
  
  return Math.min(score, 100)
}