import { Repository } from 'typeorm';
import { MockType } from 'src/types/mockType';
import { User } from '../../entities/user.entity';

export const mockUserRepositoryFactory: (
  users: User[],
) => MockType<Repository<User>> = jest.fn((users: User[]) => ({
  create: jest.fn().mockImplementation((entity) => entity),
  save: jest.fn().mockImplementation((newUser: User) => {
    const index = users.findIndex((user) => user.id === newUser.id);
    if (index > -1) {
      users[index] = newUser;
      return users[index];
    } else {
      return users[users.push(newUser)];
    }
  }),
  find: jest.fn().mockReturnValue(users),
  findOneBy: jest
    .fn()
    .mockImplementation(({ id }) => users.find((user) => user.id === id)),
  delete: jest.fn().mockImplementation((id: string) => {
    const index = users.findIndex((user) => user.id === id);
    if (index > -1) {
      users = users.filter((_, i) => i !== index);
      return { affected: 1 };
    } else {
      return { affected: 0 };
    }
  }),
}));
