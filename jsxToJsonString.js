/**
 * Escapes a JSX/HTML-like string for safe JSON inclusion.
 * - Replaces line breaks with \n
 * - Escapes double quotes
 * - Trims and compresses whitespace where needed
 */
function escapeJSXtoJSONString(input) {
  return input
    .replace(/\\/g, "\\\\") // escape backslashes
    .replace(/"/g, '\\"') // escape double quotes
    .replace(/\r?\n/g, "\\n") // convert newlines
    .replace(/\s+/g, " ") // optional: compress multiple spaces
    .trim();
}

// Example usage:
const jsx = `
  <h2>VPC</h2>
  <p>
    Amazon Virtual Private Cloud (Amazon VPC) enables you to launch
    AWS resources into a virtual network that you've defined.
  </p>
`;

const escaped = escapeJSXtoJSONString(jsx);

const json = {
  info: escaped,
};

console.log(JSON.stringify(json, null, 2));

// Optional: write to file
// fs.writeFileSync('output.json', JSON.stringify(json, null, 2));
