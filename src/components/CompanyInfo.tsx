import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
// Icons replaced with emojis for compatibility

export function CompanyInfo() {
  const features = [
    {
      icon: <span className="text-lg">⚡</span>,
      title: "Inference Engine",
      description: "Ultra-low latency and maximum efficiency for real-time AI inference at scale",
      highlights: ["Instant model deployment", "Auto-scaling workloads", "Seamless GPU integration"]
    },
    {
      icon: <span className="text-lg">🖥️</span>,
      title: "Cluster Engine", 
      description: "AI/ML Ops environment for managing scalable GPU workloads",
      highlights: ["Container management", "Real-time dashboard", "Access management"]
    },
    {
      icon: <span className="text-lg">🔧</span>,
      title: "GPU Access",
      description: "High-performance GPU cloud computing with flexible deployment",
      highlights: ["Top-tier GPUs", "InfiniBand networking", "Private & public cloud"]
    }
  ];

  const gpuModels = [
    {
      name: "NVIDIA H200",
      specs: "141 GB HBM3e memory, 4.8 TB/s bandwidth",
      advantage: "2x memory capacity vs H100"
    },
    {
      name: "NVIDIA GB200 NVL72", 
      specs: "20x faster LLM inference for GPT-MoE-1.8T",
      advantage: "Next-generation AI acceleration"
    },
    {
      name: "NVIDIA HGX B200",
      specs: "1.5 TB memory, FP8/FP4 precision support",
      advantage: "Enterprise-grade AI performance"
    }
  ];

  const successMetrics = [
    { metric: "45%", description: "Lower compute costs", icon: <span>📈</span> },
    { metric: "65%", description: "Reduced inference latency", icon: <span>📊</span> },
    { metric: "Tier-4", description: "Data center security", icon: <span>🛡️</span> },
    { metric: "Global", description: "Deployment reach", icon: <span>🌍</span> }
  ];

  return (
    <div className="space-y-6">
      {/* Core Features */}
      <Card>
        <CardHeader>
          <CardTitle>GMI Cloud Core Features</CardTitle>
          <CardDescription>
            Key selling points to emphasize in articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  {feature.icon}
                  <h3 className="font-medium">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <div className="space-y-1">
                  {feature.highlights.map((highlight, i) => (
                    <Badge key={i} variant="secondary" className="text-xs mr-1">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* GPU Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔧</span>
            Available GPU Models
          </CardTitle>
          <CardDescription>
            Cutting-edge hardware specifications to highlight
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gpuModels.map((gpu, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">{gpu.name}</h4>
                <p className="text-sm text-muted-foreground">{gpu.specs}</p>
                <Badge variant="outline" className="text-xs">{gpu.advantage}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Proven Results
          </CardTitle>
          <CardDescription>
            Key performance metrics to include in articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {successMetrics.map((item, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  {item.icon}
                  {item.metric}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🌐</span>
            Popular AI Models
          </CardTitle>
          <CardDescription>
            Currently supported models to mention in articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>DeepSeek R1</Badge>
            <Badge>DeepSeek R1 Distill Llama 70B</Badge>
            <Badge>Llama 3.3 70B Instruct Turbo</Badge>
            <Badge variant="secondary">+ Many more</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}