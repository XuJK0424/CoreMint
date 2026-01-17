import { AnalysisResult, KnowledgeItem, LibraryStorage } from "../types";

const STORAGE_KEY = 'coremint_library';

/**
 * Loads the library from LocalStorage
 */
export const loadLibrary = (): LibraryStorage => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load library", e);
    return [];
  }
};

/**
 * Generates a unique tag name based on keywords.
 * Rule: First time "Key", second time "Key(1)", etc.
 */
const generateUniqueTag = (baseTag: string, existingItems: LibraryStorage): string => {
  const allTags = new Set(existingItems.flatMap(i => i.tags));
  if (!allTags.has(baseTag)) return baseTag;

  let counter = 1;
  while (allTags.has(`${baseTag}(${counter})`)) {
    counter++;
  }
  return `${baseTag}(${counter})`;
};

/**
 * Adds a new analysis result to the library automatically.
 */
export const addToLibrary = (result: AnalysisResult, memo: string): KnowledgeItem => {
  const library = loadLibrary();
  const now = new Date();
  
  // Tag Logic
  const primaryTag = generateUniqueTag(result.keywords, library);
  const tags = [primaryTag].slice(0, 3); // Limit to 3, currently just using keywords as primary

  const newItem: KnowledgeItem = {
    ...result,
    id: crypto.randomUUID(),
    timestamp: now.getTime(),
    formattedDate: now.toLocaleString('zh-CN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    }).replace(/\//g, '-'), // Format: YYYY-MM-DD HH:mm:ss
    tags,
    personalMemo: memo
  };

  const newLibrary = [newItem, ...library]; // Add to top
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newLibrary));
  return newItem;
};

/**
 * Deletes a tag and ALL items associated with it.
 */
export const deleteTagAndItems = (tagName: string): LibraryStorage => {
  const library = loadLibrary();
  // Filter out any item that has this specific tag
  const newLibrary = library.filter(item => !item.tags.includes(tagName));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newLibrary));
  return newLibrary;
};

/**
 * Updates the Personal Memo of a specific item.
 */
export const updateItemMemo = (id: string, newMemo: string): LibraryStorage => {
  const library = loadLibrary();
  const index = library.findIndex(i => i.id === id);
  if (index !== -1) {
    library[index].personalMemo = newMemo;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }
  return library;
};

/**
 * Weighted Search
 * Weights: CoreInsight (3) > Tag (2) > Keywords (1)
 */
export const searchLibrary = (query: string, items: LibraryStorage): KnowledgeItem[] => {
  if (!query.trim()) return items;
  
  const lowerQuery = query.toLowerCase();
  
  return items
    .map(item => {
      let score = 0;
      if (item.coreInsight.toLowerCase().includes(lowerQuery)) score += 3;
      if (item.tags.some(t => t.toLowerCase().includes(lowerQuery))) score += 2;
      if (item.keywords.toLowerCase().includes(lowerQuery)) score += 1;
      return { item, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score) // Sort by relevance
    .map(result => result.item);
};

/**
 * Export to Markdown
 */
export const exportToMarkdown = (items: KnowledgeItem[], filename: string) => {
  let content = `# CoreMint Knowledge Export\nGenerated: ${new Date().toLocaleString()}\n\n`;

  items.forEach((item, index) => {
    content += `## ${index + 1}. [${item.tags.join(', ')}] ${item.keywords}\n`;
    content += `> **Time:** ${item.formattedDate}\n\n`;
    content += `### ⚓ Core Insight\n${item.coreInsight}\n\n`;
    
    content += `### 🧠 Underlying Logic\n`;
    item.underlyingLogic.forEach(l => content += `- ${l}\n`);
    content += `\n`;

    content += `### ⚡ Actionable Steps\n`;
    item.actionableSteps.forEach((s, i) => content += `${i+1}. ${s}\n`);
    content += `\n`;

    if (item.caseStudies.length > 0) {
      content += `### 📖 Case Studies\n`;
      item.caseStudies.forEach(c => content += `> *"${c}"*\n`);
      content += `\n`;
    }

    if (item.personalMemo) {
      content += `### 📝 Personal Memo\n${item.personalMemo}\n`;
    }
    content += `\n---\n\n`;
  });

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
