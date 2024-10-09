import { cookies } from 'next/headers'

export async function login(email: string, password: string) {
//   const response = await fetch('http://auth_service/login', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ email, password }),
//   })

//   if (!response.ok) {
//     throw new Error('Ошибка аутентификации')
//   }

//   const data = await response.json()
//   cookies().set('token', data.token, { httpOnly: true, secure: true })
cookies().set('token', "Fake_TOKEN", { httpOnly: true, secure: true })
//   return data.token
return "Fake_TOKEN"
}

export function getToken() {
  return cookies().get('token')?.value
}

export function logout() {
  cookies().delete('token')
}