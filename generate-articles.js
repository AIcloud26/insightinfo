const fs = require('fs');
const https = require('https');

// ============================================
// 配置区域 - 根据需要修改
// ============================================
const CONFIG = {
  articlesPerDay: 3,           // 每天生成文章数量
  maxArticles: 50,             // 最大保留文章数量
  useAI: false,                // true=用AI生成, false=用模板生成（免费）
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: 'gpt-3.5-turbo' // AI模型: gpt-3.5-turbo 或 gpt-4
};

// ============================================
// 分类和主题配置
// ============================================
const CATEGORIES = [
  {
    id: 'technology',
    name: 'Technology',
    topics: [
      'AI and Machine Learning breakthroughs',
      'Quantum computing developments',
      'Cybersecurity trends and threats',
      'Web3 and blockchain technology',
      'Mobile and app development',
      'Cloud computing innovations',
      'IoT and smart devices',
      'Robotics and automation',
      '5G and 6G networks',
      'Edge computing',
      'Sustainable technology',
      'Tech startups and innovation'
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    topics: [
      'Cryptocurrency and DeFi trends',
      'Stock market analysis',
      'Personal finance strategies',
      'Real estate investment',
      'Retirement planning',
      'Tax optimization tips',
      'Banking technology',
      'Global economic outlook',
      'ESG investing',
      'Fintech innovations',
      'Budget and savings',
      'Wealth management'
    ]
  },
  {
    id: 'ai-tools',
    name: 'AI Tools',
    topics: [
      'ChatGPT and language models',
      'AI image generation tools',
      'AI coding assistants',
      'AI productivity apps',
      'Machine learning platforms',
      'AI automation tools',
      'Voice and speech AI',
      'AI for business',
      'AI writing assistants',
      'AI video creation',
      'AI data analysis',
      'AI chatbots'
    ]
  },
  {
    id: 'health-lifestyle',
    name: 'Health & Lifestyle',
    topics: [
      'Nutrition and diet trends',
      'Fitness and exercise routines',
      'Mental health and mindfulness',
      'Sleep optimization',
      'Productivity hacks',
      'Work-life balance',
      'Healthy recipes',
      'Wellness technology',
      'Stress management',
      'Healthy aging',
      'Meditation practices',
      'Personal development'
    ]
  }
];

// Unsplash 图片 ID（真实可用的图片）
const IMAGE_IDS = {
  'technology': [
    'photo-1518770660439-4636190af475',
    'photo-1526374965328-7f61d4dc18c5',
    'photo-1531297484001-80022131f5a1',
    'photo-1550751827-4bd374c3f58b',
    'photo-1485827404703-89b55fcc595e',
    'photo-1451187580459-43490279c0fa',
    'photo-1518770660439-4636190af475'
  ],
  'finance': [
    'photo-1611974789855-9c2a0a7236a3',
    'photo-1554224155-6726b3ff858f',
    'photo-1579621970563-ebec7560ff3e',
    'photo-1553729459-efe14ef6055d',
    'photo-1579621970795-6f224c840a2e',
    'photo-1639762681485-074b7f938ba0'
  ],
  'ai-tools': [
    'photo-1677442136019-21780ecad995',
    'photo-1676299081847-824916de030a',
    'photo-1488229297570-58520851e68c',
    'photo-1555949963-aa79dcee981c',
    'photo-1547891654-e66ed7ebb968'
  ],
  'health-lifestyle': [
    'photo-1490645935967-10de6ba17061',
    'photo-1571019613454-1cb2f99b2d8b',
    'photo-1506126613408-eca07ce68773',
    'photo-1512438248247-f0f2a5a8b7f0',
    'photo-1504674900247-0877df9cc836',
    'photo-1484480974693-6ca0a78fb36b'
  ]
};

// 作者名列表
const AUTHORS = [
  'Sarah Chen', 'Michael Torres', 'Emily Watson', 'James Liu',
  'Lisa Park', 'David Wang', 'Anna Smith', 'Chris Johnson',
  'Rachel Kim', 'Tom Bradley', 'Maria Santos', 'Alex Brown',
  'Jennifer Lee', 'Robert Davis', 'Sophie Zhang', 'Daniel Wilson'
];

// ============================================
// 工具函数
// ============================================

// 随机选择
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 随机整数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成阅读时间
function generateReadTime() {
  return `${randomInt(3, 12)} min read`;
}

// 获取图片 URL
function getImageUrl(category) {
  const ids = IMAGE_IDS[category] || IMAGE_IDS['technology'];
  const imageId = randomChoice(ids);
  return `https://images.unsplash.com/${imageId}?w=600&h=400&fit=crop`;
}

// ============================================
// 模板生成（免费模式）
// ============================================

const TITLE_TEMPLATES = {
  'technology': [
    'Breaking: {topic} Is Reshaping the Tech Industry',
    'The Future of {topic}: What to Expect in 2025',
    'How {topic} Is Transforming Our Digital World',
    '{topic}: A Complete Guide for Tech Enthusiasts',
    'Why {topic} Matters More Than Ever in 2025',
    'Expert Insights: The Rise of {topic}',
    '{topic} Explained: Everything You Need to Know',
    'Top 5 Trends in {topic} for 2025'
  ],
  'finance': [
    'Market Watch: {topic} Trends to Watch',
    'Smart Money: Understanding {topic} in 2025',
    'The Future of {topic}: Expert Predictions',
    'How {topic} Is Changing the Financial Landscape',
    '{topic}: What Investors Need to Know',
    'Wealth Building: The Role of {topic}',
    '{topic} Strategies for the Modern Investor',
    'Navigating {topic}: A Beginner\'s Guide'
  ],
  'ai-tools': [
    'Tool Review: Best {topic} Solutions in 2025',
    'How {topic} Can Boost Your Productivity',
    '{topic} Explained: A Complete Beginner\'s Guide',
    'The Rise of {topic}: What It Means for You',
    'Top {topic} Tools Worth Your Attention',
    '{topic}: The Game-Changer You Need to Know',
    'Mastering {topic}: Tips and Best Practices',
    '{topic} for Business: A Practical Guide'
  ],
  'health-lifestyle': [
    'Science-Backed: How {topic} Improves Wellbeing',
    'The Ultimate Guide to {topic} for Beginners',
    '{topic}: The Trend Taking 2025 by Storm',
    'Why {topic} Should Be Part of Your Routine',
    'Expert Tips on {topic} for Better Living',
    '{topic}: Transform Your Life in 30 Days',
    'The Complete {topic} Handbook',
    '{topic} Myths Debunked: What Really Works'
  ]
};

const EXCERPT_TEMPLATES = [
  'Discover how {topic} is revolutionizing the industry and what it means for you.',
  'Expert analysis on the latest {topic} trends and their impact on everyday life.',
  'A comprehensive look at {topic} and why it matters in today\'s world.',
  'Everything you need to know about {topic} to stay ahead of the curve.',
  'Breaking down {topic}: insights, trends, and practical applications.',
  'The definitive guide to understanding {topic} in the current landscape.',
  'How {topic} is shaping the future and creating new opportunities.',
  'Get the inside scoop on {topic} from industry experts and thought leaders.'
];

function generateFromTemplate(category) {
  const categoryInfo = CATEGORIES.find(c => c.id === category);
  const topic = randomChoice(categoryInfo.topics);
  
  const titleTemplates = TITLE_TEMPLATES[category] || TITLE_TEMPLATES['technology'];
  const title = randomChoice(titleTemplates).replace('{topic}', topic);
  
  const excerpt = randomChoice(EXCERPT_TEMPLATES).replace('{topic}', topic.toLowerCase());
  
  return { title, excerpt };
}

// ============================================
// AI 生成（需要 OpenAI API）
// ============================================

async function generateWithAI(category) {
  if (!CONFIG.openaiApiKey) {
    return generateFromTemplate(category);
  }

  const categoryInfo = CATEGORIES.find(c => c.id === category);
  const topic = randomChoice(categoryInfo.topics);

  const prompt = `Generate a blog article title and short excerpt for a ${categoryInfo.name} website.

Topic: ${topic}

Requirements:
- Title: catchy, professional, under 80 characters
- Excerpt: engaging summary, under 180 characters
- Sound like 2025 news/insights

Return ONLY valid JSON (no markdown):
{"title": "...", "excerpt": "..."}`;

  return new Promise((resolve) => {
    const data = JSON.stringify({
      model: CONFIG.openaiModel,
      messages: [
        { role: 'system', content: 'You are a professional tech/finance news writer. Always return valid JSON only, no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.openaiApiKey}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          let content = response.choices[0].message.content.trim();
          
          // 移除可能的 markdown 代码块
          content = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
          content = content.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
          
          const parsed = JSON.parse(content);
          resolve({
            title: parsed.title.substring(0, 100),
            excerpt: parsed.excerpt.substring(0, 200)
          });
        } catch (error) {
          console.log('⚠️ AI parse failed, using template:', error.message);
          resolve(generateFromTemplate(category));
        }
      });
    });

    req.on('error', (error) => {
      console.log('⚠️ AI request failed:', error.message);
      resolve(generateFromTemplate(category));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      console.log('⚠️ AI request timeout');
      resolve(generateFromTemplate(category));
    });

    req.write(data);
    req.end();
  });
}

// ============================================
// 生成文章
// ============================================

async function generateArticle(existingIds) {
  const category = randomChoice(CATEGORIES);
  
  // 生成唯一 ID
  let id;
  do {
    id = randomInt(100, 99999);
  } while (existingIds.includes(id));

  // 生成标题和摘要
  let title, excerpt;
  if (CONFIG.useAI && CONFIG.openaiApiKey) {
    const generated = await generateWithAI(category.id);
    title = generated.title;
    excerpt = generated.excerpt;
  } else {
    const generated = generateFromTemplate(category.id);
    title = generated.title;
    excerpt = generated.excerpt;
  }

  return {
    id: id,
    category: category.id,
    title: title,
    excerpt: excerpt,
    image: getImageUrl(category.id),
    author: randomChoice(AUTHORS),
    readTime: generateReadTime()
  };
}

// ============================================
// 主程序
// ============================================

async function main() {
  console.log('');
  console.log('🚀 Insightinfo Article Generator');
  console.log('================================');
  console.log(`📝 Mode: ${CONFIG.useAI ? 'AI-powered' : 'Template-based'}`);
  console.log(`📊 Generating ${CONFIG.articlesPerDay} new articles`);
  console.log('');

  // 读取现有文章
  let existingArticles = [];
  let existingIds = [];

  try {
    const data = fs.readFileSync('articles.json', 'utf8');
    const json = JSON.parse(data);
    existingArticles = json.articles || [];
    existingIds = existingArticles.map(a => a.id);
    console.log(`📚 Found ${existingArticles.length} existing articles`);
  } catch (error) {
    console.log('📝 No existing articles, starting fresh');
  }

  // 生成新文章
  console.log('');
  console.log('✨ Generating new articles...');
  console.log('');
  
  const newArticles = [];
  for (let i = 0; i < CONFIG.articlesPerDay; i++) {
    const article = await generateArticle(existingIds);
    newArticles.push(article);
    existingIds.push(article.id);
    console.log(`   ${i + 1}. [${article.category}] ${article.title}`);
  }

  // 合并（新文章在前）
  const allArticles = [...newArticles, ...existingArticles];
  
  // 限制最大数量
  const finalArticles = allArticles.slice(0, CONFIG.maxArticles);

  // 保存
  const output = {
    articles: finalArticles,
    metadata: {
      lastUpdated: new Date().toISOString(),
      totalArticles: finalArticles.length,
      newToday: newArticles.length,
      generator: CONFIG.useAI ? 'AI (OpenAI)' : 'Template'
    }
  };

  fs.writeFileSync('articles.json', JSON.stringify(output, null, 2));

  console.log('');
  console.log('✅ Done!');
  console.log(`   New: ${newArticles.length} articles`);
  console.log(`   Total: ${finalArticles.length} articles`);
  console.log('');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
