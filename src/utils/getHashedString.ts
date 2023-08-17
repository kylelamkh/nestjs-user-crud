import * as bcrypt from 'bcrypt';

export async function getHashedString(str: string) {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(str, salt);
}
