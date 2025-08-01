const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.CLE_API_OPENAI,
});

app.post("/generer", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ erreur: "Message manquant" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Tu es LexiBot, assistant juridique français. Structure ta réponse en 5 parties :\n\n" +
            "1. Résumé\n2. Ce que dit la loi (France)\n3. Peine encourue (si applicable)\n4. Solutions possibles\n5. Étapes concrètes\n\n" +
            "Ensuite, seulement si c’est utile, propose 1 ou 2 modèles de lettres maximum, en les plaçant à la fin, après les étapes concrètes.\n" +
            "Utilise des titres comme :\nModèle de lettre – Mise en demeure :\nModèle de lettre – Contestation :\n\n" +
            "Ne mets aucune lettre dans les parties 1 à 5.",
        },
        { role: "user", content: message },
      ],
    });

    const fullText = completion.choices[0].message.content;

    // Exemple basique de découpage en 5 parties + modèle (tu peux affiner si besoin)
    const jsonRéponse = {
      lettre1: "1. Résumé\n" + fullText,
      lettre2: "2. Ce que dit la loi (France)\n[À extraire dynamiquement si structuré]",
      lettre3: "3. Peine encourue (si applicable)\n[À extraire dynamiquement si structuré]",
      lettre4: "4. Solutions possibles\n[À extraire dynamiquement si structuré]",
      lettre5: "5. Étapes concrètes\n[À extraire dynamiquement si structuré]",
      modeles: [
        {
          titre: "Modèle de lettre – Mise en demeure :",
          contenu: "[Lettre ici, si présente dans la réponse]",
        },
      ],
    };

    res.json(jsonRéponse);
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    res.status(500).json({ erreur: "Erreur lors de la génération" });
  }
});

app.listen(port, () => {
  console.log(`Serveur backend démarré sur http://localhost:${port}`);
});
