export const ingest = async (req, res) => {
  try {
    res.send("Files ingested successfully");
  } catch (error) {
    res.status(500).send(`Error ingesting files: ${error.message}`);
  }
};
