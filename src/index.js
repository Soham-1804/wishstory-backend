require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server: SocketServer } = require('socket.io')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

// Routes
const authRoutes    = require('./routes/auth')
const storyRoutes   = require('./routes/stories')
const paymentRoutes = require('./routes/payment')
const adminRoutes   = require('./routes/admin')
const contactRoutes = require('./routes/contact')

const app = express()
const server = http.createServer(app)

// ── ALLOWED ORIGINS ──
const ALLOWED_ORIGINS = [
  'https://wishstory.in',
  'https://www.wishstory.in',
  process.env.CLIENT_URL,       // set this to your Railway frontend URL
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean)

// ── SOCKET.IO ──
const io = new SocketServer(server, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true }
})

io.on('connection', (socket) => {
  socket.on('join-story', (storyId) => socket.join(`story:${storyId}`))
  socket.on('watch-together', ({ storyId, action, time }) => {
    socket.to(`story:${storyId}`).emit('sync', { action, time })
  })
})

app.set('io', io)

// ── MIDDLEWARE ──
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error('CORS blocked: ' + origin))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Trust Railway's proxy so rate-limiter sees real client IPs
app.set('trust proxy', 1)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts.' }
})
app.use('/api/', limiter)
app.use('/api/auth/', authLimiter)

// ── ROUTES ──
app.use('/api/auth',    authRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin',   adminRoutes)
app.use('/api/contact', contactRoutes)

// Health check — Railway pings this to confirm the service is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  const status = err.statusCode || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
})

// ── START ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    server.listen(process.env.PORT || 5000, '0.0.0.0', () => {
      console.log('WishStory running on port ' + (process.env.PORT || 5000))
    })
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
