module.exports = {
  extends: ['taro/react'],
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'warn',
    'import/no-commonjs': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}