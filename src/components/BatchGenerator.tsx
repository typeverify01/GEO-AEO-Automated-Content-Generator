import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
// Icons replaced with emojis for compatibility
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

const ARTICLE_LENGTHS = [
  { value: "short", label: "Short (800-1200 words)" },
  { value: "medium", label: "Medium (1500-2500 words)" },
  { value: "long", label: "Long (3000-5000 words)" }
];

const WORDPRESS_CONFIG = {
  siteUrl: 'https://typeverify.com/',
  username: 'email',
  password: 'Wordpress Application Password',
  categoryId: 10,
  featuredImageUrl: 'https://typeverify.com/'
};

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

interface ArticleStatus {
  keyword: string;
  status: 'pending' | 'generating' | 'generated' | 'publishing' | 'published' | 'error';
  content?: string;
  wordpressUrl?: string;
  error?: string;
}

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

export function BatchGenerator() {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [articleLength, setArticleLength] = useState<string>('medium');
  const [publishStatus, setPublishStatus] = useState<'draft' | 'publish'>('draft');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [articles, setArticles] = useState<ArticleStatus[]>([]);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [wordpressConnected, setWordpressConnected] = useState<boolean | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const selectAllKeywords = () => {
    setSelectedKeywords(KEYWORDS);
  };

  const clearAllKeywords = () => {
    setSelectedKeywords([]);
  };

  const testWordPressConnection = async () => {
    setIsTestingConnection(true);
    try {
      const authString = btoa(`${WORDPRESS_CONFIG.username}:${WORDPRESS_CONFIG.password}`);
      
      const response = await fetch(`${WORDPRESS_CONFIG.siteUrl}/wp-json/wp/v2/posts?per_page=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`,
        },
      });

      if (response.ok) {
        setWordpressConnected(true);
        toast.success('WordPress connection successful!');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('WordPress connection test failed:', error);
      setWordpressConnected(false);
      toast.error(`WordPress connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // 组件挂载时测试连接
  useEffect(() => {
    testWordPressConnection();
  }, []);

  const generateSingleArticle = async (keyword: string): Promise<string> => {
    const prompt = `
You are a professional SEO content writer specializing in AI and cloud computing. Write a comprehensive, SEO-optimized article in HTML format for GMI Cloud based on the following requirements:

TARGET KEYWORD: "${keyword}"
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

STRICT HTML STRUCTURE REQUIREMENTS - Follow this complete template with detailed content:

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

[Continue with 3-4 alternative providers with complete descriptions]

<h2>Comprehensive Comparison and Analysis</h2>
[Include detailed comparison table with multiple providers]

<h2>Implementation Guide and Best Practices</h2>
[Include detailed sections for beginners and enterprise users]

<h2>Conclusion and Next Steps</h2>
[Include detailed conclusion and recommended actions]

<h2>Frequently Asked Questions</h2>
[Include 5 detailed Q&A pairs with complete answers]

CONTENT REQUIREMENTS:
- Generate ONLY HTML content, no markdown
- Write COMPLETE detailed content for every section - no placeholders or abbreviated content
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
- Write substantial content for each section - aim for detailed, comprehensive coverage

TONE AND STYLE:
- Professional and authoritative
- Technical but accessible  
- Data-driven with specific metrics
- Solution-focused positioning GMI Cloud as #1 choice
- Directly address the user's query intent

CRITICAL REQUIREMENTS:
1. Generate COMPLETE article content - do not truncate or leave sections incomplete
2. Do NOT include ANY meta information such as:
   - Word count statistics (e.g., "Word count: 1850")
   - Author attributions 
   - Publication disclaimers
   - "This article is based on..." statements
   - Date stamps or version information
3. Do NOT add any content after the FAQ section
4. Ensure all sections have substantial, detailed content - no placeholder text
5. End the article naturally with the FAQ section

FORBIDDEN CONTENT:
- Do not write "This article is based on 2025 data and expert analysis"
- Do not include word count information
- Do not add disclaimers about data sources
- Do not mention article metadata
- Do not add author bylines or publication information

Please generate ONLY the complete HTML article content. Make sure every section is fully written with detailed, useful information.
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-or-v1',
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GMI Cloud Batch Article Generator'
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const article = data.choices[0]?.message?.content;
    
    if (!article) {
      throw new Error('No article content received from API');
    }

    // 清理文章内容
    const cleanedArticle = cleanArticleContent(article);

    // 验证文章质量
    const validation = validateArticleContent(cleanedArticle);
    
    if (!validation.isValid) {
      console.warn(`Article quality issues for "${keyword}":`, validation.issues);
      // 对于批量生成，我们记录问题但继续处理
    }

    return cleanedArticle;
  };

  // 上传图片到 WordPress 媒体库并获取媒体 ID
  const uploadFeaturedImage = async (): Promise<number> => {
    const authString = btoa(`${WORDPRESS_CONFIG.username}:${WORDPRESS_CONFIG.password}`);

    try {
      // 首先检查是否已经存在这个图片
      const mediaResponse = await fetch(`${WORDPRESS_CONFIG.siteUrl}/wp-json/wp/v2/media?search=${encodeURIComponent('image-23')}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`,
        },
      });

      if (mediaResponse.ok) {
        const existingMedia = await mediaResponse.json();
        // 如果找到现有图片，返回其 ID
        if (existingMedia.length > 0) {
          const matchingImage = existingMedia.find((media: any) => 
            media.source_url === WORDPRESS_CONFIG.featuredImageUrl ||
            media.source_url.includes('image-23.png')
          );
          if (matchingImage) {
            return matchingImage.id;
          }
        }
      }

      // 如果没有找到现有图片，通过URL上传
      const imageResponse = await fetch(WORDPRESS_CONFIG.featuredImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }

      const imageBlob = await imageResponse.blob();
      const formData = new FormData();
      formData.append('file', imageBlob, 'gmi-cloud-featured-image.png');
      formData.append('title', 'GMI Cloud Featured Image');
      formData.append('alt_text', 'GMI Cloud AI Infrastructure Solutions');
      formData.append('caption', 'GMI Cloud - AI Infrastructure Platform');

      const uploadResponse = await fetch(`${WORDPRESS_CONFIG.siteUrl}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorData.message || 'Unknown error'}`);
      }

      const uploadResult = await uploadResponse.json();
      return uploadResult.id;
    } catch (error) {
      console.warn('Failed to upload featured image, proceeding without it:', error);
      return 0; // 如果上传失败，返回 0（无特色图片）
    }
  };

  const publishToWordPress = async (keyword: string, htmlContent: string): Promise<string> => {
    // 提取标题（HTML中的第一个h1标签）
    const titleMatch = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : keyword;

    // 为WordPress格式化内容，移除H1标签并保持其他HTML结构
    const formattedContent = htmlContent.replace(/<h1[^>]*>.*?<\/h1>/i, '');

    // 生成SEO友好的slug
    const slug = keyword.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // 生成摘要（从内容中提取前160个字符）
    const excerptMatch = formattedContent.match(/<p[^>]*>(.*?)<\/p>/i);
    const excerpt = excerptMatch ? 
      excerptMatch[1].replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 
      `Complete guide about ${keyword}. Learn about GMI Cloud's AI infrastructure solutions.`;

    // 上传并获取特色图片ID
    const featuredMediaId = await uploadFeaturedImage();

    const postData = {
      title: title,
      content: formattedContent,
      excerpt: excerpt,
      status: publishStatus,
      categories: [WORDPRESS_CONFIG.categoryId],
      slug: slug,
      meta: {
        _yoast_wpseo_title: title,
        _yoast_wpseo_metadesc: `${excerpt}`,
        _yoast_wpseo_focuskw: keyword,
        _yoast_wpseo_canonical: '',
        _yoast_wpseo_opengraph_title: title,
        _yoast_wpseo_opengraph_description: excerpt,
        _yoast_wpseo_twitter_title: title,
        _yoast_wpseo_twitter_description: excerpt
      },
      // 设置特色图片
      featured_media: featuredMediaId,
      // 添加标签
      tags: []
    };

    const authString = btoa(`${WORDPRESS_CONFIG.username}:${WORDPRESS_CONFIG.password}`);
    
    const response = await fetch(`${WORDPRESS_CONFIG.siteUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `WordPress API error: ${response.status}`;
      
      if (errorData.message) {
        errorMessage += ` - ${errorData.message}`;
      }
      if (errorData.data?.status) {
        errorMessage += ` (${errorData.data.status})`;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.link || `${WORDPRESS_CONFIG.siteUrl}/?p=${result.id}`;
  };

  const updateArticleStatus = (keyword: string, updates: Partial<ArticleStatus>) => {
    setArticles(prev => prev.map(article => 
      article.keyword === keyword ? { ...article, ...updates } : article
    ));
  };

  const startBatchGeneration = async () => {
    if (selectedKeywords.length === 0) {
      toast.error('Please select at least one keyword');
      return;
    }

    setIsProcessing(true);
    setCurrentProgress(0);
    
    // 初始化文章状态
    const initialArticles: ArticleStatus[] = selectedKeywords.map(keyword => ({
      keyword,
      status: 'pending'
    }));
    setArticles(initialArticles);

    let completedCount = 0;

    for (const keyword of selectedKeywords) {
      try {
        // 生成文章
        updateArticleStatus(keyword, { status: 'generating' });
        const content = await generateSingleArticle(keyword);
        updateArticleStatus(keyword, { status: 'generated', content });

        // 发布到WordPress
        updateArticleStatus(keyword, { status: 'publishing' });
        const wordpressUrl = await publishToWordPress(keyword, content);
        updateArticleStatus(keyword, { 
          status: 'published', 
          wordpressUrl 
        });

        toast.success(`Article published: ${keyword}`);
      } catch (error) {
        console.error(`Error processing ${keyword}:`, error);
        updateArticleStatus(keyword, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        toast.error(`Failed to process: ${keyword}`);
      }

      completedCount++;
      setCurrentProgress((completedCount / selectedKeywords.length) * 100);
    }

    setIsProcessing(false);
    toast.success(`Batch processing completed! ${completedCount} articles processed.`);
  };

  const retryArticle = async (keyword: string) => {
    const article = articles.find(a => a.keyword === keyword);
    if (!article || article.status !== 'error') return;

    try {
      if (!article.content) {
        // 重新生成文章
        updateArticleStatus(keyword, { status: 'generating', error: undefined });
        const content = await generateSingleArticle(keyword);
        updateArticleStatus(keyword, { status: 'generated', content });
      }

      // 重新发布
      updateArticleStatus(keyword, { status: 'publishing' });
      const wordpressUrl = await publishToWordPress(keyword, article.content!);
      updateArticleStatus(keyword, { 
        status: 'published', 
        wordpressUrl 
      });

      toast.success(`Successfully retried: ${keyword}`);
    } catch (error) {
      console.error(`Retry failed for ${keyword}:`, error);
      updateArticleStatus(keyword, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error(`Retry failed: ${keyword}`);
    }
  };

  const getStatusIcon = (status: ArticleStatus['status']) => {
    switch (status) {
      case 'pending': return <span className="text-muted-foreground">⏰</span>;
      case 'generating': return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'generated': return <span className="text-yellow-500">📝</span>;
      case 'publishing': return <span className="text-orange-500 animate-pulse">📤</span>;
      case 'published': return <span className="text-green-500">✅</span>;
      case 'error': return <span className="text-red-500">❌</span>;
      default: return null;
    }
  };

  const getStatusText = (status: ArticleStatus['status']) => {
    switch (status) {
      case 'pending': return 'Waiting';
      case 'generating': return 'Generating article...';
      case 'generated': return 'Article generated';
      case 'publishing': return 'Publishing to WordPress...';
      case 'published': return 'Published successfully';
      case 'error': return 'Error occurred';
      default: return status;
    }
  };

  const publishedCount = articles.filter(a => a.status === 'published').length;
  const errorCount = articles.filter(a => a.status === 'error').length;
  const generatingCount = articles.filter(a => a.status === 'generating').length;
  const publishingCount = articles.filter(a => a.status === 'publishing').length;
  const pendingCount = articles.filter(a => a.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Batch Article Generator & WordPress Publisher</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate multiple SEO-optimized articles and automatically publish them to your WordPress site with featured images.
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Configuration</CardTitle>
          <CardDescription>
            Select keywords and configure article settings for batch generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Keyword Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Select Keywords ({selectedKeywords.length}/{KEYWORDS.length})</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllKeywords}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllKeywords}>
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {KEYWORDS.map((keyword) => (
                <div key={keyword} className="flex items-center space-x-2">
                  <Checkbox
                    id={keyword}
                    checked={selectedKeywords.includes(keyword)}
                    onCheckedChange={() => toggleKeyword(keyword)}
                  />
                  <label
                    htmlFor={keyword}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {keyword}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Article Length</label>
              <Select value={articleLength} onValueChange={setArticleLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_LENGTHS.map((length) => (
                    <SelectItem key={length.value} value={length.value}>
                      {length.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">WordPress Status</label>
              <Select value={publishStatus} onValueChange={(value: 'draft' | 'publish') => setPublishStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="publish">Publish Immediately</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* WordPress Connection Status */}
          <Alert className={wordpressConnected === null ? '' : wordpressConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {wordpressConnected === null ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : wordpressConnected ? (
                <span className="text-green-600">📶</span>
              ) : (
                <span className="text-red-600">📵</span>
              )}
              <AlertDescription className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    WordPress Site: <strong>{WORDPRESS_CONFIG.siteUrl}</strong> | Category ID: <strong>{WORDPRESS_CONFIG.categoryId}</strong>
                    <br />
                    Featured Image: <strong>Auto-upload from {WORDPRESS_CONFIG.featuredImageUrl}</strong>
                    <br />
                    Connection Status: <strong className={wordpressConnected === null ? '' : wordpressConnected ? 'text-green-600' : 'text-red-600'}>
                      {wordpressConnected === null ? 'Testing...' : wordpressConnected ? 'Connected' : 'Failed'}
                    </strong>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testWordPressConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? (
                      <div className="h-3 w-3 mr-1 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="mr-1">🔄</span>
                    )}
                    Test Connection
                  </Button>
                </div>
              </AlertDescription>
            </div>
          </Alert>

          {/* Start Button */}
          <div className="flex justify-center">
            <Button 
              onClick={startBatchGeneration} 
              disabled={selectedKeywords.length === 0 || isProcessing || wordpressConnected === false}
              size="lg"
              className="min-w-48"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-2">▶️</span>
                  Start Batch Generation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Statistics */}
      {(isProcessing || articles.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{Math.round(currentProgress)}%</span>
                  </div>
                  <Progress value={currentProgress} className="w-full" />
                </div>
              )}
              
              {articles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{generatingCount}</div>
                    <div className="text-xs text-muted-foreground">Generating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{publishingCount}</div>
                    <div className="text-xs text-muted-foreground">Publishing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
                    <div className="text-xs text-muted-foreground">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                    <div className="text-xs text-muted-foreground">Errors</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {articles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generation Results</CardTitle>
                <CardDescription>
                  {publishedCount} published, {errorCount} errors, {articles.length} total
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{publishedCount} Published</Badge>
                {errorCount > 0 && <Badge variant="destructive">{errorCount} Errors</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {articles.map((article) => (
                <div key={article.keyword} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(article.status)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{article.keyword}</div>
                      <div className="text-sm text-muted-foreground">
                        {getStatusText(article.status)}
                      </div>
                      {article.error && (
                        <div className="text-xs text-red-500 mt-1">{article.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {article.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryArticle(article.keyword)}
                      >
                        <span className="mr-1">🔄</span>
                        Retry
                      </Button>
                    )}
                    {article.wordpressUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(article.wordpressUrl, '_blank')}
                      >
                        <span className="mr-1">🔗</span>
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}