module.exports = {
  '*.{js,ts}': ['prettier --write', 'eslint --fix', 'eslint'],
  '*.{html,css,json,md}': ['prettier --write'],
  '*.{yml,yaml}': ['prettier --write']
};
