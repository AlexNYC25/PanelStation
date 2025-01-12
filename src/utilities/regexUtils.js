/*
 * Extracts the year from a folder name.
 * @param {string} folderName - The name of the folder.
 * @returns {number} The year found in the folder name or null if no year is found.
 * @example
 *
 * searchForYear("Star Wars Darth Maul - Son of Dathomir (2014)") // 2014
 */
export const searchForYearInComicString = (folderName) => {
  /*
    ^ - Start of the string
    (.*?) - Match any character (except for line terminators) zero or more times
    (?:\s*\((\d{4})\))? - Match zero or more whitespace characters followed by an opening parenthesis, four digits, and a closing parenthesis. The question mark at the end makes the group optional.
    (\s*)? - Match zero or more whitespace characters. The question mark at the end makes the group optional.
    (.*?) - Match any character (except for line terminators) zero or more times
    $ - End of the string
  */
  const dateRegex = /^(.*?)(?:\s*\((\d{4})\))(\s*)?(.*?)$/;
  const match = folderName.match(dateRegex);

  return match && match[2] ? parseInt(match[2], 10) : null;
};
