import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Iltimos, .env.local faylida MONGODB_URI ni to‘g‘ri qo‘shing.\n" +
    "Masalan: mongodb+srv://..."
  );
}

/** * Global o'zgaruvchini e'lon qilish (Next.js development rejimida 
 * har safar ulanishni yangilamasligi uchun)
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    /** * Bu yerda MONGODB_URI orqasiga "as string" qo'shdik. 
     * Bu TypeScript-ga: "Xavotir olma, bu aniq matn (string)" degan buyruqdir.
     */
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}