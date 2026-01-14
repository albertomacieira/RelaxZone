const users = [
  {
    id: '1',
    name: 'Relax Zone Admin',
    email: 'admin@relax.zone',
    password: '$2b$10$abcdefghijklmnopqrstuv',
    role: 'ADMIN',
  },
];

const list = async () => users;

const findById = async (id) => users.find((user) => user.id === id);

const findByEmail = async (email) => users.find((user) => user.email === email);

const create = async ({ name, email, password, role }) => {
  const newUser = {
    id: (users.length + 1).toString(),
    name,
    email,
    password,
    role,
  };
  users.push(newUser);
  return newUser;
};

const updateRole = async (id, role) => {
  const user = await findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  user.role = role;
  return user;
};

function toPublic(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

module.exports = { toPublic };


module.exports = { list, findById, findByEmail, create, updateRole, toPublic };
