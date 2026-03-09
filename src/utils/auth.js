import { storage } from './storage'

export const authStorage = {
  getUsers: ()       => storage.get('users', []),
  saveUsers: (users) => storage.set('users', users),
  getSession: ()     => storage.get('session', null),
  saveSession: (u)   => storage.set('session', u),
  clearSession: ()   => storage.remove('session'),
}

export const validateEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const validatePassword = password => ({
  valid:    password.length >= 6,
  message:  password.length < 6 ? 'Mínimo de 6 caracteres' : '',
})

export const hashPassword = async password => {
  // Simple deterministic hash for demo — replace with bcrypt in production
  let h = 0
  for (let i = 0; i < password.length; i++) {
    h = ((h << 5) - h) + password.charCodeAt(i)
    h |= 0
  }
  return String(h)
}
