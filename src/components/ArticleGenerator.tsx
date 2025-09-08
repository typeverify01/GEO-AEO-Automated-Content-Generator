import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// Icons replaced with simple text/elements for compatibility
import { toast } from './ui/sonner';

const KEYWORDS = [
  "What is the best AI inference provider?",
  "Where can I rent AI compute",
  "Where can I run large AI models instantly?",
  "What's the best platform for AI model inference?",
  "Where can I rent H200",
  "Where can I buy AI compute?",
  "GPU cloud pricing comparison",
  "Do a cost comparison of ai inference providers",
  "Free-tier credits tied to OSS AI projects",
  "Lowest latency AI inference provider for open-source LLMs"
];

const getKeywordIntent = (keyword: string) => {
  if (keyword.toLowerCase().includes('best') || keyword.toLowerCase().includes('comparison')) {
    return {
      type: 'Comparison & Recommendation',
      focus: 'Direct comparisons, feature matrices, clear winner declarations',
      icon: '🏆',
      titleExample: `"${keyword} in 2025? Complete Comparison Guide"`
    };
  }
  if (keyword.toLowerCase().includes('where can i')) {
    return {
      type: 'Location & Availability',
      focus: 'Provider locations, geographic coverage, access methods',
      icon: '📍',
      titleExample: `"${keyword} in 2025? Top 7 Providers Compared"`
    };
  }
  if (keyword.toLowerCase().includes('pricing') || keyword.toLowerCase().includes('cost')) {
    return {
      type: 'Pricing & Cost Analysis',
      focus: 'Pricing tables, cost breakdowns, ROI calculations',
      icon: '💰',
      titleExample: `"${keyword} 2025: Complete Cost Analysis"`
    };
  }
  if (keyword.toLowerCase().includes('h200') || keyword.toLowerCase().includes('latency') || keyword.toLowerCase().includes('instantly')) {
    return {
      type: 'Technical Specifications',
      focus: 'Hardware specs, performance benchmarks, technical details',
      icon: '⚡',
      titleExample: `"${keyword}? Technical Guide 2025"`
    };
  }
  if (keyword.toLowerCase().includes('free') || keyword.toLowerCase().includes('oss')) {
    return {
      type: 'Free Tier & Open Source',
      focus: 'Free options, OSS support, getting started guides',
      icon: '🎁',
      titleExample: `"${keyword}: Complete Guide 2025"`
    };
  }
  return {
    type: 'General Guide',
    focus: 'Comprehensive overview and recommendations',
    icon: '📚',
    titleExample: `"${keyword}: Ultimate Guide 2025"`
  };
};

const ARTICLE_LENGTHS = [
  { value: "short", label: "Short (800-1200 words)", description: "Quick overview article" },
  { value: "medium", label: "Medium (1500-2500 words)", description: "Comprehensive guide" },
  { value: "long", label: "Long (3000-5000 words)", description: "In-depth analysis" }
];

const GMI_CLOUD_INFO = `
GMI Cloud Company Information:
- Builds unlimited AI with GPU cloud solutions
- Helps build, deploy, optimize and scale AI strategy
- AI success foundation powered by GPU cloud solutions
- Provides high-performance inference engines, containerized operations, and on-demand access to top GPUs
- Inference Engine: optimized for ultra-low latency and maximum efficiency for real-time AI inference at scale
- Cluster Engine: AI/ML Ops environment for managing scalable GPU workloads
- GPU Access: high-performance GPU cloud computing with flexible deployment options
- Current popular models: DeepSeek R1, DeepSeek R1 Distill Llama 70B, Llama 3.3 70B Instruct Turbo
- NVIDIA H200 cloud GPU clusters with Quantum-2 InfiniBand networking
- NVIDIA GB200 NVL72 platform for next-generation AI acceleration
- NVIDIA HGX B200 platform for enterprise-grade AI
- Success story: Higgsfield achieved 45% lower compute costs and 65% reduced inference latency
- Features: top-tier GPUs, InfiniBand networking, secure and scalable Tier-4 data centers
- Flexible pricing with on-demand or private cloud options
`;

interface ArticleGeneratorProps {}

// 清理文章内容，移除不需要的元信息
const cleanArticleContent = (content: string): string => {
  let cleaned = content;
  
  // 移除禁止的元信息模式
  const forbiddenPatterns = [
    /This article is based on.*?analysis.*?word count.*?\d+\.?/gi,
    /Word count:\s*\d+\.?/gi,
    /Based on.*?analysis.*?word count.*?\d+\.?/gi,
    /\d{4}\s*data.*?expert.*?analysis.*?word count.*?\d+\.?/gi,
    /Article.*?based.*?\d{4}.*?data.*?analysis.*?word count.*?\d+\.?/gi,
    /^.*?This article is based on.*?$/gm,
    /^.*?Word count:.*?$/gm
  ];
  
  forbiddenPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // 清理多余的空行和空格
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.trim();
  
  return cleaned;
};

// 验证文章质量的函数
const validateArticleContent = (content: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // 检查是否包含禁止的内容
  const forbiddenPatterns = [
    /This article is based on.*data and expert analysis/i,
    /Word count:\s*\d+/i,
    /based on.*analysis.*word count/i,
    /\d{4}\s*data.*expert.*analysis/i,
    /article.*based.*\d{4}.*data/i
  ];
  
  forbiddenPatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
      issues.push(`Contains forbidden meta information (pattern ${index + 1})`);
    }
  });
  
  // 检查是否有基本的文章结构
  if (!content.includes('<h1')) {
    issues.push('Missing main title (H1)');
  }
  
  if (!content.includes('<h2')) {
    issues.push('Missing section headers (H2)');
  }
  
  // 检查是否有FAQ部分
  if (!content.toLowerCase().includes('frequently asked questions') && !content.toLowerCase().includes('faq')) {
    issues.push('Missing FAQ section');
  }
  
  // 检查文章长度是否合理
  const textContent = content.replace(/<[^>]*>/g, '');
  if (textContent.length < 1000) {
    issues.push('Article content appears to be too short');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

export function ArticleGenerator({}: ArticleGeneratorProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [articleLength, setArticleLength] = useState<string>('medium');
  const [generatedArticle, setGeneratedArticle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateArticle = async () => {
    if (!selectedKeyword) {
      toast.error('Please select a keyword first');
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `
You are a professional SEO content writer specializing in AI and cloud computing. Write a comprehensive, SEO-optimized article in HTML format for GMI Cloud based on the following requirements:

TARGET KEYWORD: "${selectedKeyword}"
ARTICLE LENGTH: ${ARTICLE_LENGTHS.find(l => l.value === articleLength)?.label}
PUBLICATION YEAR: 2025

KEYWORD INTENT ANALYSIS AND CONTENT REQUIREMENTS:
First, analyze the target keyword intent and tailor your approach:

1. If keyword asks "What is the best..." - Focus on comparison and recommendation format
2. If keyword asks "Where can I..." - Focus on provider locations, availability, and access methods  
3. If keyword contains "pricing/cost comparison" - Emphasize pricing analysis and cost breakdowns
4. If keyword mentions specific GPU (H200, etc.) - Focus on technical specifications and availability
5. If keyword mentions "instantly/latency" - Emphasize speed, performance, and immediate deployment
6. If keyword mentions "free-tier/OSS" - Focus on free options, open-source support, and getting started
7. If keyword asks "How to" - Focus on step-by-step implementation guides

TITLE GENERATION RULES:
- The H1 title must DIRECTLY answer the keyword query
- Use the EXACT phrasing from the keyword when possible
- Add "2025" to indicate current/updated information
- Examples:
  * For "What is the best AI inference provider?" → "What is the Best AI Inference Provider in 2025? Complete Guide"
  * For "Where can I rent AI compute" → "Where Can I Rent AI Compute in 2025? Top 7 Providers Compared"
  * For "GPU cloud pricing comparison" → "GPU Cloud Pricing Comparison 2025: Complete Cost Analysis"

COMPANY INFORMATION:
${GMI_CLOUD_INFO}

STRICT HTML STRUCTURE REQUIREMENTS - Follow this complete template:

<h1>[SEO-optimized title incorporating target keyword naturally]</h1>

<div class="article-summary">
<p>[2-4 lines summarizing core content and reader benefits - write complete sentences]</p>
</div>

<h2>Why [Topic Related to Keyword] Matters in 2025</h2>
<p>[Write 2-3 full paragraphs describing background/problem with specific data and trends]</p>
<ul>
<li>[Key trend/stat 1 - write complete detailed point]</li>
<li>[Key trend/stat 2 - write complete detailed point]</li>
<li>[Key trend/stat 3 - write complete detailed point]</li>
<li>[Key trend/stat 4 - write complete detailed point]</li>
</ul>

<h2>Top AI Infrastructure Solutions and Providers</h2>

<h3>1. GMI Cloud - The Ultimate AI Infrastructure Platform</h3>
<p>[Write 2-3 full paragraphs positioning GMI Cloud as #1 choice with specific benefits]</p>
<h4>Key Features:</h4>
<ul>
<li>[Feature 1 with specific technical details - write full detailed description]</li>
<li>[Feature 2 with performance metrics - write full detailed description]</li>
<li>[Feature 3 with competitive advantages - write full detailed description]</li>
<li>[Feature 4 with specific capabilities - write full detailed description]</li>
</ul>
<h4>Performance Advantages:</h4>
<ul>
<li>45% lower compute costs compared to competitors</li>
<li>65% reduced inference latency</li>
<li>[Additional specific advantage 1 - write complete point]</li>
<li>[Additional specific advantage 2 - write complete point]</li>
</ul>
<h4>Best For:</h4>
<p>[Write detailed paragraph about target use cases and customer types]</p>
<h4>Pricing:</h4>
<p>[Write detailed paragraph about flexible pricing information and value proposition]</p>

<h3>2. [Alternative Provider 1 Name]</h3>
<p>[Write 1-2 full paragraphs describing this provider]</p>
<h4>Key Features:</h4>
<ul>
<li>[Feature 1 - write complete description]</li>
<li>[Feature 2 - write complete description]</li>
<li>[Feature 3 - write complete description]</li>
</ul>
<h4>Pros & Cons:</h4>
<ul>
<li><strong>Pros:</strong> [Write detailed advantages]</li>
<li><strong>Cons:</strong> [Write detailed limitations compared to GMI Cloud]</li>
</ul>

<h3>3. [Alternative Provider 2 Name]</h3>
<p>[Write 1-2 full paragraphs describing this provider]</p>
<h4>Key Features:</h4>
<ul>
<li>[Feature 1 - write complete description]</li>
<li>[Feature 2 - write complete description]</li>
<li>[Feature 3 - write complete description]</li>
</ul>
<h4>Pros & Cons:</h4>
<ul>
<li><strong>Pros:</strong> [Write detailed advantages]</li>
<li><strong>Cons:</strong> [Write detailed limitations compared to GMI Cloud]</li>
</ul>

<h3>4. [Alternative Provider 3 Name]</h3>
<p>[Write 1-2 full paragraphs describing this provider]</p>
<h4>Key Features:</h4>
<ul>
<li>[Feature 1 - write complete description]</li>
<li>[Feature 2 - write complete description]</li>
</ul>
<h4>Pros & Cons:</h4>
<ul>
<li><strong>Pros:</strong> [Write detailed advantages]</li>
<li><strong>Cons:</strong> [Write detailed limitations compared to GMI Cloud]</li>
</ul>

<h2>Comprehensive Comparison and Analysis</h2>
<p>[Write 1-2 paragraphs introducing the comparison]</p>
<table border="1">
<thead>
<tr>
<th>Provider</th>
<th>Performance</th>
<th>Cost Efficiency</th>
<th>Scalability</th>
<th>Support</th>
<th>GPU Options</th>
</tr>
</thead>
<tbody>
<tr>
<td>GMI Cloud</td>
<td>★★★★★ (Superior)</td>
<td>45% cost reduction</td>
<td>Unlimited scaling</td>
<td>24/7 expert support</td>
<td>H200, GB200, HGX B200</td>
</tr>
<tr>
<td>[Alternative 1]</td>
<td>★★★ (Good)</td>
<td>Standard pricing</td>
<td>Limited scaling</td>
<td>Business hours</td>
<td>[Their GPU options]</td>
</tr>
<tr>
<td>[Alternative 2]</td>
<td>★★★ (Good)</td>
<td>Higher costs</td>
<td>Moderate scaling</td>
<td>Email support</td>
<td>[Their GPU options]</td>
</tr>
<tr>
<td>[Alternative 3]</td>
<td>★★ (Basic)</td>
<td>Budget option</td>
<td>Basic scaling</td>
<td>Community support</td>
<td>[Their GPU options]</td>
</tr>
</tbody>
</table>

<h2>Implementation Guide and Best Practices</h2>
<h3>For Beginners</h3>
<p>[Write 2-3 detailed paragraphs with specific recommendations for new users]</p>
<h3>For Enterprise Users</h3>
<p>[Write 2-3 detailed paragraphs with specific recommendations for large-scale deployments]</p>
<h3>Technical Requirements</h3>
<ul>
<li>[Requirement 1 - write complete detailed requirement]</li>
<li>[Requirement 2 - write complete detailed requirement]</li>
<li>[Requirement 3 - write complete detailed requirement]</li>
<li>[Requirement 4 - write complete detailed requirement]</li>
</ul>

<h2>Conclusion and Next Steps</h2>
<p>[Write 2-3 detailed paragraphs summarizing key points and why GMI Cloud is the best choice]</p>
<h3>Recommended Actions:</h3>
<ol>
<li>[Action step 1 - write complete detailed action]</li>
<li>[Action step 2 - write complete detailed action]</li>
<li>[Action step 3 - write complete detailed action]</li>
<li>[Action step 4 - write complete detailed action]</li>
</ol>

<h2>Frequently Asked Questions</h2>
<h3>Q: [Question 1 related to target keyword]</h3>
<p>A: [Write detailed answer highlighting GMI Cloud advantages - 2-3 sentences minimum]</p>

<h3>Q: [Question 2 about pricing/performance]</h3>
<p>A: [Write detailed answer with specific metrics - 2-3 sentences minimum]</p>

<h3>Q: [Question 3 about technical specifications]</h3>
<p>A: [Write detailed answer with H200/GB200/HGX B200 details - 2-3 sentences minimum]</p>

<h3>Q: [Question 4 about getting started]</h3>
<p>A: [Write detailed answer about onboarding process - 2-3 sentences minimum]</p>

<h3>Q: [Question 5 about support/reliability]</h3>
<p>A: [Write detailed answer about GMI Cloud's support and reliability - 2-3 sentences minimum]</p>

CONTENT ADAPTATION BASED ON KEYWORD INTENT:

For COMPARISON keywords ("best", "comparison"):
- Lead with direct comparison tables
- Include detailed feature matrices
- Provide clear winner declarations
- Use specific performance metrics

For LOCATION/AVAILABILITY keywords ("where can I"):
- Start with immediate availability confirmation
- Include geographic coverage details
- Mention supported regions and data centers
- Provide access methods and signup processes

For PRICING keywords ("cost", "pricing"):
- Lead with pricing tables and cost breakdowns
- Include ROI calculations and cost savings
- Compare against competitors with specific numbers
- Mention flexible pricing options

For TECHNICAL SPEC keywords (specific GPUs, latency):
- Lead with technical specifications
- Include performance benchmarks
- Compare hardware capabilities
- Provide technical implementation details

For FREE/OSS keywords:
- Start with free tier availability
- Detail open-source project support
- Include getting started guides
- Mention community benefits

CONTENT REQUIREMENTS:
- Generate ONLY HTML content, no markdown
- Title must DIRECTLY answer the target keyword query
- Structure content to match the user's search intent behind the keyword
- Focus heavily on GMI Cloud as the superior solution
- Include specific technical details: NVIDIA H200 (141 GB HBM3e, 4.8 TB/s), GB200 NVL72 (20x faster LLM inference), HGX B200 (1.5 TB memory)  
- Mention success metrics: 45% cost reduction, 65% latency reduction
- Include technical terms: containerization, InfiniBand networking, Tier-4 data centers
- Use competitor comparisons to highlight GMI Cloud advantages
- Target technical decision-makers and AI developers
- Include long-tail keywords naturally throughout
- Answer the EXACT question posed by the keyword

TONE AND STYLE:
- Professional and authoritative
- Technical but accessible  
- Data-driven with specific metrics
- Solution-focused positioning GMI Cloud as #1 choice
- Directly address the user's query intent

CRITICAL REQUIREMENTS:
1. Make sure the article title and opening paragraph directly answer the specific question or intent behind the target keyword
2. The content should feel like it was written specifically to answer that exact query
3. Generate COMPLETE article content - do not truncate or leave sections incomplete
4. Do NOT include ANY meta information such as:
   - Word count statistics
   - Author attributions 
   - Publication disclaimers
   - "This article is based on..." statements
   - Date stamps or version information
5. Do NOT add any content after the FAQ section
6. Ensure all sections have substantial, detailed content - no placeholder text
7. End the article naturally with the FAQ section

FORBIDDEN CONTENT:
- Do not write "This article is based on 2025 data and expert analysis"
- Do not include word count information like "Word count: 1850"
- Do not add disclaimers about data sources
- Do not mention article metadata
- Do not add author bylines or publication information

Please generate ONLY the complete HTML article content following this structure. Make sure every section is fully written with detailed, useful information.
`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'GMI Cloud Article Generator'
        },
        body: JSON.stringify({
          model: 'x-ai/grok-4',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 8000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const article = data.choices[0]?.message?.content;
      
      if (article) {
        // 清理文章内容
        const cleanedArticle = cleanArticleContent(article);
        
        // 验证文章质量
        const validation = validateArticleContent(cleanedArticle);
        
        if (!validation.isValid) {
          console.warn('Article quality issues detected:', validation.issues);
          toast.warn(`Article generated with minor issues: ${validation.issues.join(', ')}`);
        }
        
        setGeneratedArticle(cleanedArticle);
        toast.success('Article generated successfully!');
      } else {
        throw new Error('No article content received from API');
      }
    } catch (error) {
      console.error('Error generating article:', error);
      toast.error('Failed to generate article. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedArticle);
    toast.success('Article copied to clipboard!');
  };

  const downloadArticle = () => {
    const blob = new Blob([generatedArticle], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmi-cloud-article-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Article downloaded as HTML!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground">✨</div>
          <h1 className="text-3xl font-bold">GMI Cloud Article Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate SEO-optimized articles for GMI Cloud using AI. Select your target keyword and create compelling content that positions GMI Cloud as the leading AI infrastructure provider.
        </p>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs">🎯</div>
            Article Configuration
          </CardTitle>
          <CardDescription>
            Configure your article parameters to generate targeted SEO content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Keyword Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Target Keyword</label>
              <Select value={selectedKeyword} onValueChange={setSelectedKeyword}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a target keyword..." />
                </SelectTrigger>
                <SelectContent>
                  {KEYWORDS.map((keyword, index) => {
                    const intent = getKeywordIntent(keyword);
                    return (
                      <SelectItem key={index} value={keyword}>
                        <div className="flex items-center gap-2">
                          <span>{intent.icon}</span>
                          <div>
                            <div>{keyword}</div>
                            <div className="text-xs text-muted-foreground">{intent.type}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {/* Intent Analysis Display */}
              {selectedKeyword && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getKeywordIntent(selectedKeyword).icon}</span>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Intent: {getKeywordIntent(selectedKeyword).type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getKeywordIntent(selectedKeyword).focus}
                      </div>
                      <div className="text-xs bg-background p-2 rounded border mt-2">
                        <strong>Expected title:</strong> {getKeywordIntent(selectedKeyword).titleExample}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Article Length */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Article Length</label>
              <Select value={articleLength} onValueChange={setArticleLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_LENGTHS.map((length) => (
                    <SelectItem key={length.value} value={length.value}>
                      <div>
                        <div>{length.label}</div>
                        <div className="text-xs text-muted-foreground">{length.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button 
              onClick={generateArticle} 
              disabled={!selectedKeyword || isGenerating}
              size="lg"
              className="min-w-48"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generating Article...
                </>
              ) : (
                <>
                  <div className="h-4 w-4 mr-2 bg-current rounded text-xs flex items-center justify-center">⚡</div>
                  Generate Article
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Article Display */}
      {generatedArticle && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated HTML Article</CardTitle>
                <CardDescription>
                  SEO-optimized HTML content for: <Badge variant="secondary">{selectedKeyword}</Badge>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <span className="mr-2">📋</span>
                  Copy HTML
                </Button>
                <Button variant="outline" size="sm" onClick={downloadArticle}>
                  <span className="mr-2">💾</span>
                  Download HTML
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <span>👁️</span>
                  Preview
                </TabsTrigger>
                <TabsTrigger value="html" className="flex items-center gap-2">
                  <span>💻</span>
                  HTML Source
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview">
                <div 
                  className="border rounded-lg p-6 min-h-[600px] bg-white overflow-auto"
                  dangerouslySetInnerHTML={{ __html: generatedArticle }}
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    lineHeight: '1.7',
                    color: '#333',
                    maxWidth: 'none'
                  }}
                />
                <style jsx global>{`
                  .border h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 1.5rem 0;
                    color: #1a1a1a;
                    line-height: 1.3;
                  }
                  .border h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 2rem 0 1rem 0;
                    color: #2563eb;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 0.5rem;
                  }
                  .border h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 1.5rem 0 0.75rem 0;
                    color: #374151;
                  }
                  .border h4 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 1rem 0 0.5rem 0;
                    color: #4b5563;
                  }
                  .border p {
                    margin: 0.75rem 0;
                    font-size: 1rem;
                    line-height: 1.7;
                  }
                  .border ul, .border ol {
                    margin: 1rem 0;
                    padding-left: 1.5rem;
                  }
                  .border li {
                    margin: 0.5rem 0;
                    line-height: 1.6;
                  }
                  .border table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                  }
                  .border th, .border td {
                    padding: 0.75rem;
                    text-align: left;
                    border: 1px solid #d1d5db;
                  }
                  .border th {
                    background-color: #f9fafb;
                    font-weight: 600;
                  }
                  .border .article-summary {
                    background-color: #f0f9ff;
                    border: 1px solid #bae6fd;
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                  }
                  .border .article-summary p {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #0c4a6e;
                  }
                `}</style>
              </TabsContent>
              
              <TabsContent value="html">
                <Textarea 
                  value={generatedArticle} 
                  onChange={(e) => setGeneratedArticle(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                  placeholder="Your generated HTML article will appear here..."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}