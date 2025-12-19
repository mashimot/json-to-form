export function wrapLines(lines: string[], separator: string = '\n'): string {
  return lines.join(separator);
}

export function capitalizeFirstLetter(str = ''): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lowercaseFirstLetter(str = ''): string {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function camelCasedString(value = '', isFirstLetterLowerCase = false): string {
  if (!value) return '';

  const onlyLettersAndNumbers = value.toLowerCase().match(/[a-z0-9]+/gi);

  if (!onlyLettersAndNumbers) return '';

  const camelCase = onlyLettersAndNumbers
    .map((word, i) => (i === 0 ? word : capitalizeFirstLetter(word)))
    .join('');

  return isFirstLetterLowerCase
    ? lowercaseFirstLetter(camelCase)
    : capitalizeFirstLetter(camelCase);
}
