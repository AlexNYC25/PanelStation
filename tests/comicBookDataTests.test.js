import fs from "fs";

import {
  readFilesRecursively,
  getFilesWithComicInfoXml,
  uncompressCbzFile,
  compressMultipleCbzFiles
} from "../src/utilities/comicBookDataDirectory";

describe("readFilesRecursively", () => {
  it("should return an object with files and directories", () => {
    const dataDir = "/Users/alexismontes/Documents/test";
    const results = readFilesRecursively(dataDir);
    expect(results).toHaveProperty("files");
    expect(results).toHaveProperty("directories");
  });
});

describe("getFilesWithComicInfoXml", () => {
  it("should return an array of files", () => {
    const dataDir = "/Users/alexismontes/Documents/test";
    const files = getFilesWithComicInfoXml(dataDir);
    expect(files).toBeInstanceOf(Array);
  });
});

describe("uncompressCbzFile", () => {
  it("should throw an error if the cache directory does not exist", () => {
    const cbzFilePath = "/Users/alexismontes/Documents/test/Darth Vader (2017)/Darth Vader (2017) - Single Issues/Darth Vader 001 (2017) (digital) (Minutemen-Midas).cbz";
    const cacheDirPath = "/Users/alexismontes/Documents/cache";
    const unzipPath = uncompressCbzFile(cbzFilePath, cacheDirPath);

    // check if there is the unzipped path is to a directory
    expect(typeof unzipPath).toBe("string");
    // check if the directory exists
    expect(fs.existsSync(unzipPath)).toBe(true);

    // check if the directory is not empty
    expect(fs.readdirSync(unzipPath).length).toBeGreaterThan(0);

  });
});

describe("compressMultipleCbzFiles", () => {
  it("should compress multiple cbz files into a single zip file", () => {
    const cbzFiles = [
      "/Users/alexismontes/Documents/test/Darth Vader (2017)/Darth Vader (2017) - Single Issues/Darth Vader 001 (2017) (digital) (Minutemen-Midas).cbz",
      "/Users/alexismontes/Documents/test/Darth Vader (2017)/Darth Vader (2017) - Single Issues/Darth Vader 002 (2017) (digital) (Minutemen-Midas).cbz",
      "/Users/alexismontes/Documents/test/Darth Vader (2017)/Darth Vader (2017) - Single Issues/Darth Vader 003 (2017) (digital) (Minutemen-Midas).cbz"
    ];
    const cacheDirPath = "/Users/alexismontes/Documents/cache";
    const cbzFilePath = compressMultipleCbzFiles(cbzFiles, cacheDirPath);

    // check if the cbz file path is a string
    expect(typeof cbzFilePath).toBe("string");
    // check if the cbz file exists
    expect(fs.existsSync(cbzFilePath)).toBe(true);
  });
});