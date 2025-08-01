// 📁 lexibot-backend/server.js import express from 'express'; import fetch from 'node-fetch'; import dotenv from 'dotenv'; import cors from 'cors';

dotenv.config();

const app = express(); app.use(cors()); app.use(express.json());

app.post('/generate', async (req, res) => { const { prompt } = req.body;

try { const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: Bearer ${process.env.OPENAI_API_KEY}, }, body: JSON.stringify({ model: 'gpt-4', messages: [{ role: 'user', content: prompt }], }), });

const data = await response.json();
res.json(data);

} catch (error) { console.error('Erreur serveur :', error); res.status(500).json({ error: 'Erreur serveur' }); } });

const PORT = process.env.PORT || 3000; app.listen(PORT, () => { console.log(✅ Serveur en ligne sur http://localhost:${PORT}); });

