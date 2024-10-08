db.auth('root', 'example')

db = db.getSiblingDB('hermes')

db.createUser({
  user: 'root',
  pwd: 'example',
  roles: [
    {
      role: 'readWrite',
      db: 'hermes',
    },
  ],
})