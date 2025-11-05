/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Virtual Library Platform API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { virtualLibrary } from './virtual-library-platform';

const app = express();
const PORT = process.env.VIRTUAL_LIBRARY_PORT || 4210;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Virtual Library Platform',
    timestamp: new Date(),
    statistics: virtualLibrary.getStatistics(),
  });
});

// Search books
app.post('/api/books/search', async (req, res) => {
  try {
    const results = await virtualLibrary.searchBooks(req.body);
    res.json({ results, count: results.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get book details
app.get('/api/books/:bookId', (req, res) => {
  const book = virtualLibrary.getBook(req.params.bookId);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

// Borrow book
app.post('/api/books/:bookId/borrow', async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await virtualLibrary.borrowBook(userId, req.params.bookId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Start reading session
app.post('/api/reading/sessions', (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const session = virtualLibrary.startReadingSession(userId, bookId);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add bookmark
app.post('/api/reading/sessions/:sessionId/bookmarks', (req, res) => {
  try {
    const { page, note } = req.body;
    virtualLibrary.addBookmark(req.params.sessionId, page, note);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add highlight
app.post('/api/reading/sessions/:sessionId/highlights', (req, res) => {
  try {
    const { text, page, color } = req.body;
    virtualLibrary.addHighlight(req.params.sessionId, text, page, color);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add note
app.post('/api/reading/sessions/:sessionId/notes', (req, res) => {
  try {
    const { text, page } = req.body;
    const noteId = virtualLibrary.addNote(req.params.sessionId, text, page);
    res.json({ success: true, noteId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Generate citation
app.post('/api/books/:bookId/citations', (req, res) => {
  try {
    const { format } = req.body;
    const citation = virtualLibrary.generateCitation(req.params.bookId, format);
    res.json(citation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// AI Research Assistant
app.post('/api/ai/research', async (req, res) => {
  try {
    const { query, context } = req.body;
    const result = await virtualLibrary.aiResearchAssistant(query, context);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user reading history
app.get('/api/users/:userId/reading-history', (req, res) => {
  const history = virtualLibrary.getUserReadingHistory(req.params.userId);
  res.json({ history, count: history.length });
});

// Get user borrowed books
app.get('/api/users/:userId/borrowed', (req, res) => {
  const books = virtualLibrary.getUserBorrowedBooks(req.params.userId);
  res.json({ books, count: books.length });
});

// Statistics
app.get('/api/statistics', (req, res) => {
  const stats = virtualLibrary.getStatistics();
  res.json(stats);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n📚 Virtual Library Platform running on port ${PORT}\n`);
  console.log(`   🔍 Search: POST /api/books/search`);
  console.log(`   📖 Read: GET /api/books/:bookId`);
  console.log(`   🤖 AI Research: POST /api/ai/research`);
  console.log(`   📝 Citations: POST /api/books/:bookId/citations`);
  console.log(`   ❤️ Health: http://localhost:${PORT}/health`);
  console.log(`\n   🌟 Exceeds physical libraries: 24/7 access, AI-powered, global reach\n`);
});
