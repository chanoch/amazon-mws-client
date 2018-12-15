import crypto from 'crypto'

export default function calculateMD5Hash(content) {
  return crypto.createHash('md5').update(content).digest('base64')
}
