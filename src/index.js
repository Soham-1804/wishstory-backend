require('dotenv').config()
const express  = require('express')
const http     = require('http')
const { Server: SocketServer } = require('socket.io')
const mongoose = require('mongoose')
const cors     = require('cors')
const helmet   = require('helmet')
const morgan   = require('morgan')
const rateLimit = require('express-rate-limit')


// Routes
const authRoutes       = require('./routes/auth')
const storyRoutes      = require('./routes/stories')
const paymentRoutes    = require('./routes/payment')
const adminRoutes      = require('./routes/admin')
const giftOrderRoutes  = require('./routes/giftOrders.route')
const quizRoutes = require('./routes/quiz')
const uploadRoutes = require('./routes/uploads')
const app    = express()
const server = http.createServer(app)
const path = require('path')

// ── SOCKET.IO ──
const io = new SocketServer(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
})
io.on('connection', (socket) => {
  socket.on('join-story',     (storyId)             => socket.join(`story:${storyId}`))
  socket.on('watch-together', ({ storyId, action, time }) =>
    socket.to(`story:${storyId}`).emit('sync', { action, time })
  )
})
app.set('io', io)

// ── CORS ──
const ALLOWED_ORIGINS = [
  'https://wishstory.in',
  'https://www.wishstory.in',
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))

app.set('trust proxy', 1)

// ── MIDDLEWARE ──
app.use(helmet({ contentSecurityPolicy: false }))

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({ windowMs: 15*60*1000, max: 100, message: { error: 'Too many requests.' } })
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { error: 'Too many auth attempts.' } })
app.use('/api/',      limiter)
app.use('/api/auth/', authLimiter)

// ── ROUTES ──
app.use('/api/auth',        authRoutes)
app.use('/api/stories',     storyRoutes)
app.use('/api/payment',     paymentRoutes)
app.use('/api/admin',       adminRoutes)
app.use('/api/gift-orders', giftOrderRoutes) 
app.use('/api/quiz', quizRoutes)  // ← NEW
app.use('/api/uploads', uploadRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.get('/', (req, res) => {
  res.send('🚀 WishStory API is running');
});

// Serve frontend static files in production (fallback to index.html for SPA routes)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
}
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' })
})

// ── DB + START ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    server.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 WishStory running on port ${process.env.PORT || 5000}`)
    )
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1) })
