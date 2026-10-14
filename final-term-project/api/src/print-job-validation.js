function validateCreatePrintJob(data) {
  const required = [
    'customer_name',
    'file_name',
    'pages',
    'copies',
    'color_mode',
    'shop_id'
  ];

  if (!data || required.some(key => data[key] === undefined || data[key] === null || data[key] === '')) {
    return 'Missing required fields';
  }

  if (
    !Number.isInteger(Number(data.pages)) ||
    Number(data.pages) < 1 ||
    Number(data.pages) > 200 ||
    !Number.isInteger(Number(data.copies)) ||
    Number(data.copies) < 1 ||
    Number(data.copies) > 20
  ) {
    return 'Invalid pages (1-200) or copies (1-20)';
  }

  return null;
}

module.exports = { validateCreatePrintJob };
