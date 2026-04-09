import FilteredWord from "../models/FilteredWord.js";

export const containsFilteredWord = async (text) => {
  const allWords = await FilteredWord.find({ type: "text" }); // only text type here
  let lowerText = text.toLowerCase();
  
  let result = {
    hasBannedWords: false,
    action: "none", // "none", "censor", "pending", "block"
    processedText: text,
  };

  const actionPriority = { none: 0, censor: 1, pending: 2, block: 3 };

  for (let w of allWords) {
    if (lowerText.includes(w.word.toLowerCase())) {
      result.hasBannedWords = true;
      
      // Increment hitCount
      await FilteredWord.updateOne({ _id: w._id }, { $inc: { hitCount: 1 } }).catch(e => console.error(e));

      // Update max action based on priority
      if (actionPriority[w.action] > actionPriority[result.action]) {
        result.action = w.action;
      }

      // If action requires censor, replace occurrences with ***
      const regex = new RegExp(w.word, "gi");
      result.processedText = result.processedText.replace(regex, "***");
    }
  }

  return result;
};