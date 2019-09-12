import { ACTION_TYPES } from '../Constants';

const availableLangs = ['sv', 'en'];

export const changeLanguage = (language) => {
  let newLang = 'sv';
  if (language) {
    newLang = availableLangs.includes(language.toLowerCase()) ? language : 'sv';
  }

  return { type: ACTION_TYPES.CHANGE_LANGUAGE, language: newLang };
};
