// ==========================================
// AI CHATBOT CONTROLLER
// Provides intelligent design suggestions
// ==========================================

const DESIGN_PATTERNS = {
  'high_traffic': {
    keywords: ['scale', 'many users', 'high traffic', 'millions', 'popular'],
    suggestions: [
      { type: 'LOAD_BALANCER', reason: 'Distribute traffic across multiple servers' },
      { type: 'CACHE', reason: 'Reduce database load with caching' },
      { type: 'CDN', reason: 'Serve static content faster globally' },
    ],
    template: 'SCALABLE_WEB_APP'
  },
  'data_heavy': {
    keywords: ['analytics', 'big data', 'processing', 'reports', 'database'],
    suggestions: [
      { type: 'NOSQL', reason: 'NoSQL handles large datasets better' },
      { type: 'QUEUE', reason: 'Process data asynchronously' },
      { type: 'CACHE', reason: 'Cache frequently accessed data' }
    ],
    template: 'DATA_PIPELINE'
  },
  'real_time': {
    keywords: ['real-time', 'live', 'websocket', 'chat', 'streaming'],
    suggestions: [
      { type: 'QUEUE', reason: 'Handle real-time message queues' },
      { type: 'LOAD_BALANCER', reason: 'Manage concurrent connections' },
      { type: 'CACHE', reason: 'Store session data' }
    ],
    template: 'REALTIME_APP'
  },
  'microservices': {
    keywords: ['microservice', 'distributed', 'api gateway', 'services'],
    suggestions: [
      { type: 'API_GATEWAY', reason: 'Central entry point for microservices' },
      { type: 'QUEUE', reason: 'Async communication between services' },
      { type: 'SERVICE_MESH', reason: 'Service discovery and load balancing' }
    ],
    template: 'MICROSERVICES_ARCH'
  },
  'simple_app': {
    keywords: ['simple', 'basic', 'small', 'prototype', 'mvp'],
    suggestions: [
      { type: 'SERVER', reason: 'Single server for application logic' },
      { type: 'DB', reason: 'Database for data persistence' }
    ],
    template: 'BASIC_WEB_APP'
  }
};

export const getChatbotSuggestion = async (req, res) => {
  try {
    const { userMessage, designId } = req.body;

    if (!userMessage) {
      return res.status(400).json({ message: "User message is required" });
    }

    const lowerMsg = userMessage.toLowerCase();
    
    // 1. Analyze user intent
    let matchedPattern = null;
    let matchScore = 0;

    for (let [patternName, pattern] of Object.entries(DESIGN_PATTERNS)) {
      const matches = pattern.keywords.filter(kw => lowerMsg.includes(kw)).length;
      if (matches > matchScore) {
        matchScore = matches;
        matchedPattern = { name: patternName, ...pattern };
      }
    }

    // 2. Generate response
    if (!matchedPattern || matchScore === 0) {
      return res.status(200).json({
        reply: "I can help you design a system! Tell me about your requirements. For example: 'I need a high-traffic e-commerce site' or 'Build a real-time chat application'.",
        suggestions: [],
        recommendedTemplate: null
      });
    }

    // 3. Build intelligent response
    const reply = `Based on your requirements, I recommend a **${matchedPattern.name.replace('_', ' ')}** architecture. Here's what you need:`;
    
    const componentSuggestions = matchedPattern.suggestions.map(s => ({
      component: s.type,
      reason: s.reason,
      priority: matchedPattern.suggestions.indexOf(s) + 1
    }));

    // 4. If design exists, analyze it
    let designAnalysis = null;
    if (designId) {
      const design = await Design.findById(designId).populate('components');
      if (design) {
        const existingTypes = design.components.map(c => c.type);
        const missing = matchedPattern.suggestions.filter(s => !existingTypes.includes(s.type));
        
        designAnalysis = {
          currentComponents: existingTypes,
          missingComponents: missing.map(m => m.type),
          status: missing.length === 0 ? 'complete' : 'incomplete'
        };
      }
    }

    res.status(200).json({
      reply,
      suggestions: componentSuggestions,
      recommendedTemplate: matchedPattern.template,
      designAnalysis,
      confidence: matchScore > 2 ? 'high' : 'medium'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Chatbot error", error: error.message });
  }
};

// ==========================================
// GET OPTIMIZATION TIPS
// ==========================================

export const getOptimizationTips = async (req, res) => {
  try {
    const { designId } = req.params;
    const design = await Design.findById(designId).populate('components');

    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    const tips = [];

    // Analyze design for common issues
    const componentTypes = design.components.map(c => c.type);
    const componentCount = design.components.length;

    // Tip 1: Missing Load Balancer
    const hasMultipleServers = design.components.filter(c => c.type === 'SERVER').length > 1;
    const hasLoadBalancer = componentTypes.includes('LOAD_BALANCER');
    if (hasMultipleServers && !hasLoadBalancer) {
      tips.push({
        type: 'WARNING',
        title: 'Add Load Balancer',
        description: 'You have multiple servers but no load balancer. Traffic distribution will be inefficient.',
        action: { addComponent: 'LOAD_BALANCER' }
      });
    }

    // Tip 2: No Caching
    const hasDatabase = componentTypes.includes('DB') || componentTypes.includes('NOSQL');
    const hasCache = componentTypes.includes('CACHE');
    if (hasDatabase && !hasCache && componentCount > 3) {
      tips.push({
        type: 'SUGGESTION',
        title: 'Consider Adding Cache',
        description: 'Adding Redis cache can reduce database load by 70-90%.',
        action: { addComponent: 'CACHE' }
      });
    }

    // Tip 3: No CDN for high traffic
    const hasCDN = componentTypes.includes('CDN');
    if (!hasCDN && componentCount > 4) {
      tips.push({
        type: 'SUGGESTION',
        title: 'Add CDN for Static Assets',
        description: 'CDN can improve response times and reduce server load.',
        action: { addComponent: 'CDN' }
      });
    }

    // Tip 4: Cost optimization
    const totalCost = design.components.reduce((sum, c) => sum + (c.costPerHour || 0), 0);
    if (totalCost > 500) {
      tips.push({
        type: 'INFO',
        title: 'High Monthly Cost',
        description: `Your estimated cost is $${totalCost}/month. Consider using cheaper component models.`,
        action: null
      });
    }

    // Tip 5: Single point of failure
    const criticalComponents = design.components.filter(c => 
      ['DB', 'LOAD_BALANCER'].includes(c.type)
    );
    const hasDuplicates = criticalComponents.some(c1 => 
      criticalComponents.filter(c2 => c2.type === c1.type).length > 1
    );
    if (!hasDuplicates && criticalComponents.length > 0) {
      tips.push({
        type: 'WARNING',
        title: 'Single Point of Failure',
        description: 'Consider adding redundancy for critical components.',
        action: { addComponent: criticalComponents[0].type + '_REPLICA' }
      });
    }

    res.status(200).json({
      designId,
      tips,
      overallHealth: tips.filter(t => t.type === 'WARNING').length === 0 ? 'good' : 'needs_improvement'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Optimization analysis failed", error: error.message });
  }
};
