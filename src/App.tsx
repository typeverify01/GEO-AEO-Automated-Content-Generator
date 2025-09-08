import React, { useState } from 'react';
import { ArticleGenerator } from './components/ArticleGenerator';
import { BatchGenerator } from './components/BatchGenerator';
import { CompanyInfo } from './components/CompanyInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Toaster, ToastProvider } from './components/ui/sonner';

export default function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <Toaster />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <div className="h-6 w-6 bg-current rounded" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">GMI Cloud Content Studio</h1>
                <p className="text-muted-foreground">SEO Article Generation Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="gap-1">
                2025 Ready
              </Badge>
              <Badge className="gap-1">
                SEO Optimized
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              Single Article
            </TabsTrigger>
            <TabsTrigger value="batch-generator" className="flex items-center gap-2">
              Batch Generator
            </TabsTrigger>
            <TabsTrigger value="company-info" className="flex items-center gap-2">
              Company Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Single Article Generation
                </CardTitle>
                <CardDescription>
                  Generate individual SEO-optimized articles with detailed preview and editing capabilities.
                  Perfect for testing and fine-tuning content before batch processing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span>10 Targeted Keywords</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>3 Article Lengths</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>AI-Generated Content</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <ArticleGenerator />
          </TabsContent>

          <TabsContent value="batch-generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Batch Generation & WordPress Publishing
                </CardTitle>
                <CardDescription>
                  Generate multiple articles simultaneously and automatically publish them to your WordPress site.
                  Includes progress tracking, error handling, and retry mechanisms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Bulk Processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Auto WordPress Publish</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Progress Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Error Recovery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <BatchGenerator />
          </TabsContent>

          <TabsContent value="company-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  GMI Cloud Company Profile
                </CardTitle>
                <CardDescription>
                  Key information, features, and selling points to emphasize in generated articles.
                  This data is automatically included in the AI prompts for consistent messaging.
                </CardDescription>
              </CardHeader>
            </Card>
            <CompanyInfo />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 GMI Cloud Content Studio. Powered by AI.</p>
            <p>Generate SEO-optimized articles with AI precision.</p>
          </div>
        </div>
      </footer>
      </div>
    </ToastProvider>
  );
}