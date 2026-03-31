// src/services/coachPromptAI.js
import Groq from "groq-sdk";

// Inicializamos Groq. El "dangerouslyAllowBrowser" es necesario porque estamos en Vite (lado del cliente)
const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const generarConsejoIA = async (habitoNombre, diasLimpio, emocion, ahorros) => {
  try {
    const ahorroTexto = ahorros > 0 
      ? `Además, gracias a su esfuerzo ha ahorrado $${ahorros}.` 
      : "";

    const prompt = `
      Actúa como un psicólogo experto en terapia cognitivo-conductual y adicciones.
      Tu paciente (Isaac) está intentando dejar un mal hábito llamado "${habitoNombre}".
      Lleva exactamente ${diasLimpio} días limpio sin recaer. ${ahorroTexto}
      
      En este preciso momento, acaba de presionar un botón de S.O.S. porque está a punto de recaer.
      La emoción que lo está empujando a recaer es: "${emocion}".

      Tu tarea:
      Escribe un mensaje corto, directo, empático pero muy firme para detener su recaída AHORA MISMO.
      - Usa un tono motivador y protector.
      - Háblale directamente a él (en segunda persona).
      - Recuérdale lo valioso que es su progreso de ${diasLimpio} días.
      - Dale una acción física o mental rápida que pueda hacer en los próximos 5 minutos para distraer la mente de la emoción de ${emocion}.
      - MÁXIMO 4 o 5 líneas de texto. No uses formato markdown (* o #), solo texto plano.
      - Responde ÚNICAMENTE EN ESPAÑOL.
    `;

    // Llamamos a Llama 3 a través de Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant", // Este modelo es hiper-rápido y no tiene bloqueos
      temperature: 0.7,
      max_tokens: 150,
    });

    return chatCompletion.choices[0]?.message?.content || "Respira profundo, tú tienes el control.";

  } catch (error) {
    console.error("Error al contactar a Groq:", error);
    return `La conexión falló, pero escúchame: Un antojo dura solo 15 minutos. ¿Vas a tirar tu progreso a la basura por culpa de sentir ${emocion}? Respira profundo, bebe agua y aléjate de ahí. Tú tienes el control.`;
  }
};