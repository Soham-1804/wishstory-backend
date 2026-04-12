const express = require('express')
const router = express.Router()
const { upload } = require('../middleware/upload')

// POST /api/uploads — upload a single image and return Cloudinary URL
router.post('/', upload.single('file'), (req, res) => {
  try {
    const url = req.file && req.file.path
    if (!url) return res.status(400).json({ error: 'No file uploaded' })
    res.json({ url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

module.exports = router
