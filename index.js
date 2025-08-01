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

// Fonction pour extraire les sections du texte retourné
function extraireSections(texte) {
  const sections = {
    lettre1: "",
    lettre2: "",
    lettre3: "",
    lettre4: "",
    lettre5: "",
    modeles: [],
  };

  const parties = texte.split(/(?:\*\*|###)?\s*\d\.\s*(Résumé|Ce que dit la loi|Peine encourue|Solutions possibles|Étapes concrètes)[\s:]*/gi);
  const labels = ["lettre1", "lettre2", "lettre3", "lettre4", "lettre5"];

  for (let i = 0; i < labels.length; i++) {
    if (parties[i * 2 + 2]) {
      sections[labels[i]] = `${i + 1}. ${parties[i * 2 + 1].trim()}\n${parties[i * 2 + 2].trim()}`;
    }
  }

  const modeleRegex = /(?:\*\*|###)?\s*Modèle de lettre\s*[-–]\s*(.*?)\s*[:：]?\s*\n([\s\S]+?)(?=(?:\*\*|###)?\s*Modèle de lettre|$)/gi;
  let match;
  while ((match = modeleRegex.exec(texte)) !== null) {
    sections.modeles.push({
      titre: `Modèle de lettre – ${match[1].trim()} :`,
      contenu: match[2].trim(),
    });
  }

  // Supprimer les doublons exacts
  sections.modeles = sections.modeles.filter(
    (m, index, self) =>
      index === self.findIndex((t) => t.titre === m.titre && t.contenu === m.contenu)
  );

  return sections;
}

// Route principale
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
            "Ensuite, propose 1 ou 2 modèles de lettres complets si c'est pertinent. Ne dis pas '[Insérer le]', écris **directement** le contenu complet des lettres.\n\n" +
            "Utilise ces titres :\nModèle de lettre – Mise en demeure :\nModèle de lettre – Contestation :\nModèle de lettre – Assignation en justice :\n\n" +
            "⚠️ Ne mets aucune lettre dans les parties 1 à 5. Toutes les lettres doivent être à la fin avec leur contenu complet.",
        },
        { role: "user", content: message },
      ],
    });

    const fullText = completion.choices[0].message.content;
    const jsonRéponse = extraireSections(fullText);

    res.json(jsonRéponse);
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    res.status(500).json({ erreur: "Erreur lors de la génération" });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend LexiBot démarré sur http://localhost:${port}`);
});
