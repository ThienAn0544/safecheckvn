require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : true,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '..')));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'SafeCheck API đang hoạt động' }));
app.use('/api', routes);
app.use(errorHandler);
app.listen(PORT, () => console.log(`SafeCheck: http://localhost:${PORT}`));
