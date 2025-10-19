import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Language } from '../utils/translations';

// Fix: Initialize the GoogleGenAI client correctly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash as it's good for multimodal tasks and fast.
const textModel = 'gemini-2.5-flash';
const ttsModel = 'gemini-2.5-flash-preview-tts';

export const generateRecipe = async (ingredients: string[], style: string, language: Language): Promise<string> => {
  if (ingredients.length === 0) {
    const errorMessages = {
        ru: "Пожалуйста, добавьте хотя бы один ингредиент.",
        en: "Please add at least one ingredient.",
        lt: "Prašome pridėti bent vieną ingredientą."
    };
    throw new Error(errorMessages[language]);
  }
  
  let prompt;
  
  if (language === 'ru') {
      switch (style) {
        case 'humorous':
          prompt = `Напиши рецепт блюда из следующих ингредиентов: ${ingredients.join(', ')}.
          Сделай рецепт смешным, дерзким, можно с матом, как будто его пишет крутой и брутальный повар, который ненавидит готовить, но делает это божественно.
          На русском языке. Назови блюдо как-нибудь креативно и смешно. Название должно быть на первой строке в виде заголовка Markdown (# Название). Отформатируй остальной ответ в виде Markdown.`;
          break;
        case 'kid-friendly':
          prompt = `Придумай простой и веселый рецепт для детей из следующих ингредиентов: ${ingredients.join(', ')}.
          Объясни все шаги очень просто, как будто рассказываешь сказку.
          На русском языке. Придумай забавное название для блюда. Название должно быть на первой строке в виде заголовка Markdown (# Название). Отформатируй остальной ответ в виде Markdown.`;
          break;
        case 'in-a-hurry':
          prompt = `Напиши рецепт блюда из следующих ингредиентов: ${ingredients.join(', ')}. Рецепт должен быть максимально быстрым и простым, для человека, который очень торопится. Используй простые шаги. На русском языке. Дай блюду простое, понятное название. Название должно быть на первой строке в виде заголовка Markdown (# Название). Отформатируй остальной ответ в виде Markdown.`;
          break;
        case 'crazy-chef':
          prompt = `Напиши рецепт блюда из следующих ингредиентов: ${ingredients.join(', ')}.
          Рецепт должен быть написан от лица абсолютно безумного, дерганого шеф-повара с шизофренией, который куда-то очень торопится. Он должен постоянно отвлекаться, говорить сам с собой, перескакивать с мысли на мысль, но в итоге дать понятный (хоть и странный) рецепт. Используй юмор, странные метафоры и внезапные реплики.
          На русском языке. Название блюда должно быть таким же безумным. Название должно быть на первой строке в виде заголовка Markdown (# Название). Отформатируй остальной ответ в виде Markdown.`;
          break;
        case 'chef-special':
          prompt = `Напиши уникальный, изысканный рецепт в стиле 'От шефа' из следующих ингредиентов: ${ingredients.join(', ')}. Это должно быть экспериментальное и утонченное блюдо, возможно, с необычным сочетанием вкусов или сложными техниками, объясненными простым языком. На русском языке. Дай ему элегантное и интригующее название. Название должно быть на первой строке в виде заголовка Markdown (# Название). Отформатируй остальной ответ в виде Markdown.`;
          break;
        case 'from-the-web':
          prompt = `Выступи в роли поисковика рецептов. Найди 2-3 популярных и высоко оцененных рецепта из интернета, в которых используются следующие ингредиенты: ${ingredients.join(', ')}. Для каждого рецепта укажи название, список ингредиентов и пошаговую инструкцию. Постарайся включить ссылку на источник для каждого рецепта. Отформатируй весь ответ в Markdown, используя заголовок первого уровня (#) для общего названия (например, "# Популярные рецепты из сети") и заголовки второго уровня (##) для каждого отдельного рецепта.`;
          break;
        case 'classic':
        default:
          prompt = `Напиши подробный, классический рецепт блюда из следующих ингредиентов: ${ingredients.join(', ')}.
          Укажи точные пропорции, время приготовления и пошаговые инструкции.
          На русском языке. Дай блюду классическое название. Название должно быть на первой строке в виде заголовка Markdown (# Название). Отформатируй остальной ответ в виде Markdown.`;
          break;
      }
  } else if (language === 'en') {
       switch (style) {
        case 'humorous':
            prompt = `Write a recipe for a dish using the following ingredients: ${ingredients.join(', ')}.
            Make the recipe funny, bold, and maybe with some light-hearted cursing, as if written by a cool, tough chef who hates cooking but is divinely good at it.
            In English. Give the dish a creative and funny name. The name should be on the first line as a Markdown heading (# Title). Format the rest of the response as Markdown.`;
            break;
        case 'kid-friendly':
            prompt = `Create a simple and fun recipe for kids using the following ingredients: ${ingredients.join(', ')}.
            Explain all the steps very simply, as if you're telling a fairy tale.
            In English. Come up with a funny name for the dish. The name should be on the first line as a Markdown heading (# Title). Format the rest of the response as Markdown.`;
            break;
        case 'in-a-hurry':
            prompt = `Write a recipe for a dish using the following ingredients: ${ingredients.join(', ')}. The recipe should be as quick and simple as possible, for someone in a big hurry. Use simple steps. In English. Give the dish a simple, clear name. The name should be on the first line as a Markdown heading (# Title). Format the rest of the response as Markdown.`;
            break;
        case 'crazy-chef':
            prompt = `Write a recipe for a dish using the following ingredients: ${ingredients.join(', ')}.
            The recipe should be written from the perspective of an absolutely crazy, twitchy chef with schizophrenia who is in a huge rush. He should constantly get distracted, talk to himself, and jump from one thought to another, but ultimately provide a clear (though strange) recipe. Use humor, weird metaphors, and sudden remarks.
            In English. The dish's name should be just as crazy. The name should be on the first line as a Markdown heading (# Title). Format the rest of the response as Markdown.`;
            break;
        case 'chef-special':
            prompt = `Write a unique, gourmet-style 'Chef's Special' recipe using the following ingredients: ${ingredients.join(', ')}. This should be an experimental and sophisticated dish, perhaps with an unusual combination of flavors or advanced techniques explained simply. In English. Give it an elegant and intriguing name. The name should be on the first line as a Markdown heading (# Title). Format the rest of the response as Markdown.`;
            break;
        case 'from-the-web':
            prompt = `Act as a recipe finder. Find 2-3 popular and highly-rated recipes from the internet that use the following ingredients: ${ingredients.join(', ')}. For each recipe, provide a title, a list of ingredients, and step-by-step instructions. Try to include a link to the original source for each recipe. Format the entire response in Markdown, using a level 1 heading (#) for the overall title (e.g., "# Popular Recipes from the Web") and level 2 headings (##) for each individual recipe.`;
            break;
        case 'classic':
        default:
            prompt = `Write a detailed, classic recipe for a dish using the following ingredients: ${ingredients.join(', ')}.
            Include precise proportions, cooking times, and step-by-step instructions.
            In English. Give the dish a classic name. The name should be on the first line as a Markdown heading (# Title). Format the rest of the response as Markdown.`;
            break;
      }
  } else { // Lithuanian prompts
      switch (style) {
        case 'humorous':
          prompt = `Parašyk receptą patiekalui iš šių ingredientų: ${ingredients.join(', ')}. Receptas turi būti juokingas, įžūlus, gali būti su švelniais keiksmažodžiais, lyg jį rašytų kietas, brutalus šefas, kuris nekenčia gaminti, bet daro tai dieviškai. Lietuvių kalba. Suteik patiekalui kūrybišką ir juokingą pavadinimą. Pavadinimas turi būti pirmoje eilutėje kaip Markdown antraštė (# Pavadinimas). Likusį atsakymą formatuok kaip Markdown.`;
          break;
        case 'kid-friendly':
          prompt = `Sukurk paprastą ir linksmą receptą vaikams iš šių ingredientų: ${ingredients.join(', ')}. Visus žingsnius paaiškink labai paprastai, lyg pasakotum pasaką. Lietuvių kalba. Sugalvok juokingą pavadinimą patiekalui. Pavadinimas turi būti pirmoje eilutėje kaip Markdown antraštė (# Pavadinimas). Likusį atsakymą formatuok kaip Markdown.`;
          break;
        case 'in-a-hurry':
          prompt = `Parašyk receptą patiekalui iš šių ingredientų: ${ingredients.join(', ')}. Receptas turi būti kuo greitesnis ir paprastesnis, skirtas labai skubančiam žmogui. Naudok paprastus žingsnius. Lietuvių kalba. Suteik patiekalui paprastą, aiškų pavadinimą. Pavadinimas turi būti pirmoje eilutėje kaip Markdown antraštė (# Pavadinimas). Likusį atsakymą formatuok kaip Markdown.`;
          break;
        case 'crazy-chef':
          prompt = `Parašyk receptą patiekalui iš šių ingredientų: ${ingredients.join(', ')}. Receptas turi būti parašytas iš visiškai pamišusio, nervingo šefo su šizofrenija perspektyvos, kuris kažkur labai skuba. Jis turi nuolat nukrypti nuo temos, kalbėtis su savimi, šokinėti nuo minties prie minties, bet galiausiai pateikti suprantamą (nors ir keistą) receptą. Naudok humorą, keistas metaforas ir staigias replikas. Lietuvių kalba. Patiekalo pavadinimas turi būti toks pat beprotiškas. Pavadinimas turi būti pirmoje eilutėje kaip Markdown antraštė (# Pavadinimas). Likusį atsakymą formatuok kaip Markdown.`;
          break;
        case 'chef-special':
          prompt = `Parašyk unikalų, gurmanišką 'Šefo specialų' receptą naudojant šiuos ingredientus: ${ingredients.join(', ')}. Tai turėtų būti eksperimentinis ir rafinuotas patiekalas, galbūt su neįprastu skonių deriniu ar sudėtingesnėmis technikomis, paaiškintomis paprastai. Lietuvių kalba. Suteik jam elegantišką ir intriguojantį pavadinimą. Pavadinimas turi būti pirmoje eilutėje kaip Markdown antraštė (# Pavadinimas). Likusį atsakymą formatuok kaip Markdown.`;
          break;
        case 'from-the-web':
            prompt = `Veik kaip receptų ieškiklis. Surask 2-3 populiarius ir gerai įvertintus receptus iš interneto, kuriuose naudojami šie ingredientai: ${ingredients.join(', ')}. Kiekvienam receptui nurodyk pavadinimą, ingredientų sąrašą ir nuoseklias instrukcijas. Pabandyk pridėti nuorodą į originalų šaltinį kiekvienam receptui. Visą atsakymą formatuok Markdown formatu, naudodamas 1 lygio antraštę (#) bendram pavadinimui (pvz., "# Populiarūs receptai iš interneto") ir 2 lygio antraštes (##) kiekvienam atskiram receptui.`;
            break;
        case 'classic':
        default:
          prompt = `Sukurk išsamų, klasikinį receptą patiekalui iš šių ingredientų: ${ingredients.join(', ')}. Nurodyk tikslias proporcijas, gaminimo laiką ir žingsnis po žingsnio instrukcijas. Lietuvių kalba. Suteik patiekalui klasikinį pavadinimą. Pavadinimas turi būti pirmoje eilutėje kaip Markdown antraštė (# Pavadinimas). Likusį atsakymą formatuok kaip Markdown.`;
          break;
      }
  }


  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
        const errorMessages = {
            ru: "Не удалось сгенерировать рецепт. Модель вернула пустой ответ.",
            en: "Failed to generate recipe. The model returned an empty response.",
            lt: "Nepavyko sugeneruoti recepto. Modelis grąžino tuščią atsakymą."
        };
        throw new Error(errorMessages[language]);
    }
    return text;
  } catch (error) {
    console.error("Error generating recipe:", error);
    const errorMessages = {
        ru: "Произошла ошибка при генерации рецепта. Пожалуйста, попробуйте еще раз.",
        en: "An error occurred while generating the recipe. Please try again.",
        lt: "Generuojant receptą įvyko klaida. Bandykite dar kartą."
    };
    throw new Error(errorMessages[language]);
  }
};

export const generateSpeechFromText = async (text: string, language: Language): Promise<string> => {
   const errorMessages = {
    ru: {
      noAudio: "Модель не вернула аудиоданные.",
      generationError: "Произошла ошибка при озвучивании рецепта."
    },
    en: {
      noAudio: "The model did not return any audio data.",
      generationError: "An error occurred while voicing the recipe."
    },
    lt: {
      noAudio: "Modelis negrąžino jokių garso duomenų.",
      generationError: "Įgarsinant receptą įvyko klaida."
    }
  };
  const messages = errorMessages[language];

  try {
    // Remove markdown for cleaner speech
    const cleanText = text.replace(/([*#_-]+)/g, '');

    const response = await ai.models.generateContent({
        model: ttsModel,
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
            responseModalities: [Modality.AUDIO],
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error(messages.noAudio);
    }
    return base64Audio;
  } catch (error) {
      console.error("Error generating speech from text:", error);
      throw new Error(messages.generationError);
  }
};

// Fix: Add and export the 'identifyIngredientsFromImage' function.
interface ImagePart {
  data: string;
  mimeType: string;
}

export const identifyIngredientsFromImage = async (image: ImagePart, language: Language): Promise<string[]> => {
    const prompts = {
        ru: "Определи, какие съедобные ингредиенты изображены на этой фотографии. Верни только список ингредиентов через запятую, без лишних слов. Например: 'помидор, огурец, лук'. Если ничего не можешь распознать, верни пустую строку.",
        en: "Identify the edible ingredients in this photo. Return only a comma-separated list of ingredients, with no extra words. For example: 'tomato, cucumber, onion'. If you can't recognize anything, return an empty string.",
        lt: "Atpažink, kokie valgomi ingredientai pavaizduoti šioje nuotraukoje. Grąžink tik ingredientų sąrašą, atskirtą kableliais, be jokių papildomų žodžių. Pavyzdžiui: 'pomidoras, agurkas, svogūnas'. Jei nieko neatpažįsti, grąžink tuščią eilutę."
    };
  const prompt = prompts[language];


  try {
    const imagePart = {
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel,
      contents: { parts: [imagePart, textPart] },
    });
    
    const text = response.text;
    if (!text || text.trim() === "") {
      return [];
    }

    // Split by comma, trim whitespace, and filter out empty strings
    const ingredients = text.split(',').map(i => i.trim()).filter(i => i);
    return ingredients;

  } catch (error) {
    console.error("Error identifying ingredients from image:", error);
    const errorMessages = {
        ru: "Произошла ошибка при анализе изображения. Пожалуйста, попробуйте еще раз.",
        en: "An error occurred while analyzing the image. Please try again.",
        lt: "Analizuojant vaizdą įvyko klaida. Bandykite dar kartą."
    };
    throw new Error(errorMessages[language]);
  }
};