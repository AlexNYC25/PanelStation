export const extractFloatingPointNumbers = (inputString) => {
  // Regular expression to match floating point numbers
  const regex = /-?\d+(\.\d+)?/g;
  const matches = inputString.match(regex);
  return matches ? matches.join(" ") : "";
};
