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

function extraireSections(texte) {
  const sections = {
    lettre1: "",
    lettre2: "",
    lettre3: "",
    lettre4: "",
    lettre5: "",
    modeles: [],
  };

  const parties = texte.split(
    /(?:\*\*|\#\#\#)?\s*\d\.\s*(Résumé|Ce que dit la loi|Peine encourue|Solutions possibles|Étapes concrètes)[\s:]*/gi
  );

  const labels = ["lettre1", "lettre2", "lettre3", "lettre4", "lettre5"];
  for (let i = 0; i < labels.length; i++) {
    if (parties[i * 2 + 2]) {
      sections[labels[i]] = `${i + 1}. ${parties[i * 2 + 1].trim()}\n${parties[i * 2 + 2].trim()}`;
    }
  }

  const modeleRegex =
    /(?:\*\*|###)?\s*Modèle de lettre\s*[-–]\s*(.*?)\s*[:：]?\s*\n([\s\S]+?)(?=(?:\*\*|###)?\s*Modèle de lettre|$)/gi;
  let match;
  while ((match = modeleRegex.exec(texte)) !== null) {
    sections.modeles.push({
      titre: `Modèle de lettre – ${match[1].trim()} :`,
      contenu: match[2].trim(),
    });
  }

  // Supprimer les doublons exacts
  sections.modeles = sections.modeles.filter(
    (m, i, self) =>
      i === self.findIndex((x) => x.titre === m.titre && x.contenu === m.contenu)
  );

  return sections;
}

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
    const jsonRéponse = extraireSections(fullText);
    res.json(jsonRéponse);
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    res.status(500).json({ erreur: "Erreur lors de la génération" });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend LexiBot démarré sur http://localhost:${port}`);
});  const modeleRegex =
    /(?:\*\*|###)?\s*Modèle de lettre\s*[-–]\s*(.*?)\s*[:：]?\s*\n([\s\S]+?)(?=(?:\*\*|###)?\s*Modèle de lettre|$)/gi;
  let match;
  while ((match = modeleRegex.exec(texte)) !== null) {
    sections.modeles.push({
      titre: `Modèle de lettre – ${match[1].trim()} :`,
      contenu: match[2].trim(),
    });
  }

  // Supprimer doublons exacts
  sections.modeles = sections.modeles.filter(
    (m, i, self) =>
      i === self.findIndex((x) => x.titre === m.titre && x.contenu === m.contenu)
  );

  return sections;
}

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
    const jsonRéponse = extraireSections(fullText);
    res.json(jsonRéponse);
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    res.status(500).json({ erreur: "Erreur lors de la génération" });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend LexiBot démarré sur http://localhost:${port}`);
});  while ((match = modeleRegex.exec(texte)) !== null) {
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
    const jsonRéponse = extraireSections(fullText);

    res.json(jsonRéponse);
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    res.status(500).json({ erreur: "Erreur lors de la génération" });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend LexiBot démarré sur http://localhost:${port}`);
});  let match;
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
    const jsonRéponse = extraireSections(fullText);

    res.json(jsonRéponse);
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    res.status(500).json({ erreur: "Erreur lors de la génération" });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend LexiBot démarré sur http://localhost:${port}`);
});  let match;
  while ((match = modeleRegex.exec(texte)) !== null) {
    sections.modeles.push({
      titre: `Modèle de lettre – ${match[1].trim()} :`,
      contenu: match[2].trim(),
    });
  }

  // ✅ Supprimer les doublons exacts
  sections.modeles = sections.modeles.filter(
    (m, index, self) =>
      index === self.findIndex((t) => t.titre === m.titre && t.contenu === m.contenu)
  );

  return sections;
}

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
    const jsonRéponse = extraireSections(fullText);

    res.json(jsonRéponse);
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    res.status(500).json({ erreur: "Erreur lors de la génération" });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend LexiBot démarré sur http://localhost:${port}`);
});  while ((match = modeleRegex.exec(texte)) !== null) {
    sections.modeles.push({
      titre: `Modèle de lettre – ${match[1].trim()} :`,
      contenu: match[2].trim()
    });
  }

  return sections;
}

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
            "Ne mets aucune lettre dans les parties 1 à 5."
        },
        { role: "user", content: message }
      ]
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
