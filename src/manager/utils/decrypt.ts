import { createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util'


export async function decrypt(field : string): Promise<string>{
    const data = Buffer.from(field, 'hex')
    const iv = data.slice(0,16)
    const toDecipher = data.slice(16)
    const password = process.env.PASSWORD
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer
    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([
        decipher.update(toDecipher),
        decipher.final(),
    ])
    return decryptedText.toString()
}