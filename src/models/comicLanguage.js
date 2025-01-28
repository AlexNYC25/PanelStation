import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicLanguageTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_language'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_language (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(10) NOT NULL,
      UNIQUE (name, code)
    );
  `;

  const insertDataQuery = `
  INSERT INTO comic_language (name, code) VALUES
    ('Afrikaans', 'af'),
    ('Albanian', 'sq'),
    ('Amharic', 'am'),
    ('Arabic', 'ar'),
    ('Armenian', 'hy'),
    ('Azerbaijani', 'az'),
    ('Basque', 'eu'),
    ('Belarusian', 'be'),
    ('Bengali', 'bn'),
    ('Bosnian', 'bs'),
    ('Bulgarian', 'bg'),
    ('Catalan', 'ca'),
    ('Cebuano', 'ceb'),
    ('Chinese (Simplified)', 'zh-Hans'),
    ('Chinese (Traditional)', 'zh-Hant'),
    ('Corsican', 'co'),
    ('Croatian', 'hr'),
    ('Czech', 'cs'),
    ('Danish', 'da'),
    ('Dutch', 'nl'),
    ('English', 'en'),
    ('Esperanto', 'eo'),
    ('Estonian', 'et'),
    ('Finnish', 'fi'),
    ('French', 'fr'),
    ('Frisian', 'fy'),
    ('Galician', 'gl'),
    ('Georgian', 'ka'),
    ('German', 'de'),
    ('Greek', 'el'),
    ('Gujarati', 'gu'),
    ('Haitian Creole', 'ht'),
    ('Hausa', 'ha'),
    ('Hawaiian', 'haw'),
    ('Hebrew', 'he'),
    ('Hindi', 'hi'),
    ('Hungarian', 'hu'),
    ('Icelandic', 'is'),
    ('Igbo', 'ig'),
    ('Indonesian', 'id'),
    ('Irish', 'ga'),
    ('Italian', 'it'),
    ('Japanese', 'ja'),
    ('Javanese', 'jv'),
    ('Kannada', 'kn'),
    ('Kazakh', 'kk'),
    ('Khmer', 'km'),
    ('Kinyarwanda', 'rw'),
    ('Korean', 'ko'),
    ('Kurdish (Kurmanji)', 'ku'),
    ('Kyrgyz', 'ky'),
    ('Lao', 'lo'),
    ('Latin', 'la'),
    ('Latvian', 'lv'),
    ('Lithuanian', 'lt'),
    ('Luxembourgish', 'lb'),
    ('Macedonian', 'mk'),
    ('Malagasy', 'mg'),
    ('Malay', 'ms'),
    ('Malayalam', 'ml'),
    ('Maltese', 'mt'),
    ('Maori', 'mi'),
    ('Marathi', 'mr'),
    ('Mongolian', 'mn'),
    ('Myanmar (Burmese)', 'my'),
    ('Nepali', 'ne'),
    ('Norwegian', 'no'),
    ('Nyanja (Chichewa)', 'ny'),
    ('Odia (Oriya)', 'or'),
    ('Pashto', 'ps'),
    ('Persian', 'fa'),
    ('Polish', 'pl'),
    ('Portuguese', 'pt'),
    ('Punjabi', 'pa'),
    ('Romanian', 'ro'),
    ('Russian', 'ru'),
    ('Samoan', 'sm'),
    ('Scots Gaelic', 'gd'),
    ('Serbian', 'sr'),
    ('Sesotho', 'st'),
    ('Shona', 'sn'),
    ('Sindhi', 'sd'),
    ('Sinhala', 'si'),
    ('Slovak', 'sk'),
    ('Slovenian', 'sl'),
    ('Somali', 'so'),
    ('Spanish', 'es'),
    ('Sundanese', 'su'),
    ('Swahili', 'sw'),
    ('Swedish', 'sv'),
    ('Tagalog (Filipino)', 'tl'),
    ('Tajik', 'tg'),
    ('Tamil', 'ta'),
    ('Tatar', 'tt'),
    ('Telugu', 'te'),
    ('Thai', 'th'),
    ('Turkish', 'tr'),
    ('Turkmen', 'tk'),
    ('Ukrainian', 'uk'),
    ('Urdu', 'ur'),
    ('Uyghur', 'ug'),
    ('Uzbek', 'uz'),
    ('Vietnamese', 'vi'),
    ('Welsh', 'cy'),
    ('Xhosa', 'xh'),
    ('Yiddish', 'yi'),
    ('Yoruba', 'yo'),
    ('Zulu', 'zu');
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_language table created successfully.");
      await runQuery(insertDataQuery);
      logger.debug("Data inserted into comic_language table successfully.");
    } else {
      logger.debug("comic_language table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_language table:", err);
  }
};

export const deleteComicLanguageTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_language;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_language table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_language table:", err);
  }
};

export const getComicLanguageIdFromCode = async (code) => {
  const query = `
    SELECT id FROM comic_language WHERE code = $1;
  `;

  try {
    const result = await runQuery(query, [code]);
    return result[0].id;
  } catch (err) {
    logger.error("Error getting comic_language id:", err);
  }
};
