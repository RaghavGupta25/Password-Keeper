import { createCipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

export async function encrypt(field: string): Promise<any> {
    const iv = randomBytes(16)
    const password = process.env.PASSWORD
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer
    const cipher = createCipheriv('aes-256-ctr', key,iv)
	
	const encryptedText = Buffer.concat([
        cipher.update(field),
        cipher.final()
    ])

    const toStore = Buffer.concat([iv, encryptedText])
    return toStore.toString('hex')
}

