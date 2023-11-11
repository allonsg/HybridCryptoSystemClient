export const copyToClipboard = (text) => {
  if (!navigator.clipboard || !navigator.clipboard.writeText || !text) {
    console.error('Clipboard API is not supported in this browser.');
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log(text);
    })
    .catch(error => {
      console.error(
        'Error copying text to clipboard:',
        error.message || 'An error occurred.',
      );
    });
};
