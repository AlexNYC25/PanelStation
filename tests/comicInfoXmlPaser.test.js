import { logger } from "../src/utilities/logger.js";
import { 
    extractComicInfoXml,
} from "../src/utilities/comicFileParser.js";

import {
    convertComicInfoXmlTextToJson
} from "../src/utilities/xmlTools.js";


describe("comicInfoXmlPaser", () => {
    it("should return an object with the comic book information", () => {
        const cbzFilePath = "/Users/alexismontes/Documents/test/Darth Vader (2017)/Darth Vader (2017) - Single Issues/Darth Vader 001 (2017) (digital) (Minutemen-Midas).cbz";
        const comicInfo = extractComicInfoXml(cbzFilePath);
        let parsedComicInfo = null;
        convertComicInfoXmlTextToJson(comicInfo).then((result) => {
            parsedComicInfo = result;
            //logger.info(parsedComicInfo.ComicInfo);
            console.log(parsedComicInfo.ComicInfo);
        expect(comicInfo).toBeDefined();
        });

        
    });
});