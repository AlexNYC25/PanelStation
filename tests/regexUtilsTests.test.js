import { searchForYearInComicString } from "../src/utilities/regexUtils";

describe("searchForYearInComicString", () => {
  it("should return the year found in the folder name", () => {
    const folderName = "Star Wars Darth Maul - Son of Dathomir (2014) [Vol. 1]";
    const year = searchForYearInComicString(folderName);
    expect(year).toBe(2014);
  });

  it("should return null if no year is found in the folder name", () => {
    const folderName = "Star Wars Darth Maul - Son of Dathomir";
    const year = searchForYearInComicString(folderName);
    expect(year).toBe(null);
  });

  it("should return null if the year is not in parentheses", () => {
    const folderName = "Star Wars Darth Maul - Son of Dathomir 2014";
    const year = searchForYearInComicString(folderName);
    expect(year).toBe(null);
  });

});
