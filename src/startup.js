import fs from 'fs';

let checkComicBookDataDirectoryExists = () => {
    const dataDir = process.env.DATA_DIR;
    if (!fs.existsSync(dataDir)) {
        try {
            fs.mkdirSync(dataDir);
            console.log(`Directory ${dataDir} created successfully.`);
        } catch (err) {
            console.error(`Error creating directory ${dataDir}:`, err);
        }
    } else {
        console.log(`Directory ${dataDir} already exists.`);
    }
}

export { checkComicBookDataDirectoryExists };