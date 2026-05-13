import bcrypt from 'bcryptjs';

const hash = '$2b$10$hVCo3lnzVeaRWIgrsMaV8OVRui2V9i9/qc9z3BxvMb9B9HN7iIYNS';
const password = 'Rec@123456';

bcrypt.compare(password, hash).then(res => {
  console.log('Match?', res);
}).catch(err => {
  console.error(err);
});
