const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const activityRoutes = require('./routes/activityRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const checklistRoutes = require('./routes/checklistRoutes');
const participantRoutes = require('./routes/participantRoutes');

const hotelRoutes = require('./routes/hotelRoutes');
const authenticateToken = require('./middleware/auth');


const app = express();
app.use(cors({
  origin: 'https://orga-vacances.vercel.app',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => res.send('✅ Backend opérationnel !'));

// Routes publiques (inscription/login)
app.use('/api/users', userRoutes);

// Middleware d'authentification pour toutes les autres routes API
app.use(authenticateToken);

// Routes protégées
app.use('/api/trips', tripRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/hotels', hotelRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend lancé sur http://localhost:${PORT}`);
});
