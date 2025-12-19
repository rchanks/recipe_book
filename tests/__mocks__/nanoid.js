// Mock for nanoid ES module
module.exports = {
  customAlphabet: (alphabet, size) => {
    return () => {
      let result = ''
      for (let i = 0; i < size; i++) {
        result += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
      }
      return result
    }
  },
}
