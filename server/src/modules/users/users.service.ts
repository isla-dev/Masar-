import { AppError } from '../../utils/AppError';
import { comparePassword, hashPassword } from '../../utils/hashing';
import { usersRepository } from './users.repository';
import { ChangePasswordInputDto, UpdateProfileInputDto } from './users.validation';

function toSafeUser(user: NonNullable<Awaited<ReturnType<typeof usersRepository.findById>>>) {
  const { password_hash, ...safe } = user;
  return safe;
}

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    return toSafeUser(user);
  },

  async updateProfile(userId: string, input: UpdateProfileInputDto) {
    const user = await usersRepository.updateProfile(userId, input);
    if (!user) throw AppError.notFound('User not found');
    return toSafeUser(user);
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await usersRepository.updateProfile(userId, { avatarUrl });
    if (!user) throw AppError.notFound('User not found');
    return toSafeUser(user);
  },

  async changePassword(userId: string, input: ChangePasswordInputDto) {
    const user = await usersRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const valid = await comparePassword(input.currentPassword, user.password_hash);
    if (!valid) throw AppError.unauthorized('Current password is incorrect');

    const newHash = await hashPassword(input.newPassword);
    await usersRepository.updatePassword(userId, newHash);
  },
};
