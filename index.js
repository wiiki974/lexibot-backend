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

// Fonction pour extraire les parties + modèles
function extraireSections(texte) {
  const sections = {
    lettre1: "",
    lettre2: "",
    lettre3: "",
    lettre4: "",
    lettre5: "",
    modeles: [],
  };

  const regexSections = /(?:\*\*|###)?\s*(\d)\.\s*(Résumé|Ce que dit la loi|Peine encourue|Solutions possibles|Étapes concrètes)\s*[:：]?\s*\n([\s\S]+?)(?=(?:\d\.\s|\*\*|###|Modèle de lettre|$))/gi;
  let matchSection;

  while ((matchSection = regexSections.exec(texte)) !== null) {
    const index = parseInt(matchSection[1]);
    const titre = matchSection[2];
    const contenu = matchSection[3].trim();

    if (index >= 1 && index <= 5) {
      sections[`lettre${index}`] = `${index}. ${titre}\n${contenu}`;
    }
  }

  const modeleRegex = /Modèle de lettre\s*[-–]\s*(.*?)\s*[:：]?\s*\n([\s\S]+?)(?=(?:Modèle de lettre\s*[-–]|$))/gi;
  let matchModele;

  while ((matchModele = modeleRegex.exec(texte)) !== null) {
    const titreBrut = matchModele[1].replace(/[:：]*\**/g, "").trim();
    const contenu = matchModele[2].trim();

    sections.modeles.push({
      titre: `Modèle de lettre – ${titreBrut} :`,
      contenu,
    });
  }

  // Supprimer les doublons exacts
  sections.modeles = sections.modeles.filter(
    (m, index, self) =>
      index === self.findIndex((t) => t.titre === m.titre && t.contenu === m.contenu)
  );

  return sections;
}

// Endpoint principal
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
          content: `
Tu es LexiBot, assistant juridique français. Structure ta réponse en 5 parties :

1. Résumé
2. Ce que dit la loi (France)
3. Peine encourue (si applicable)
4. Solutions possibles
5. Étapes concrètes

Ensuite, seulement si c’est utile, propose 1 ou 2 modèles de lettres maximum à la fin.

Utilise exactement ce format :
"Modèle de lettre – Mise en demeure :"
"Modèle de lettre – Contestation :"

Ne mets aucune lettre dans les parties 1 à 5.
          `.trim(),
        },
        { role: "user", content: message },
      ],
    });

    const texte = completion.choices[0].message.content;
    const jsonRéponse = extraireSections(texte);

    res.json(jsonRéponse);
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    res.status(500).json({ erreur: "Erreur lors de la génération" });
  }
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`✅ LexiBot backend en ligne sur http://localhost:${port}`);
});
