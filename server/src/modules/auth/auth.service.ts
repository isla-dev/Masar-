import { usersRepository } from '../users/users.repository';
import { comparePassword, hashPassword } from '../../utils/hashing';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../utils/AppError';
import { LoginInput, RegisterInput } from './auth.validation';

function toSafeUser(user: Awaited<ReturnType<typeof usersRepository.findByEmail>>) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await usersRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await usersRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: input.role,
      preferredLanguage: input.preferredLanguage,
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    return { user: toSafeUser(user), accessToken, refreshToken };
  },

  async login(input: LoginInput) {
    const user = await usersRepository.findByEmail(input.email);
    if (!user || !user.is_active) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const valid = await comparePassword(input.password, user.password_hash);
    if (!valid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    return { user: toSafeUser(user), accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const user = await usersRepository.findById(payload.sub);
    if (!user || !user.is_active) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    return { accessToken, user: toSafeUser(user) };
  },
};
