'use server'

import { revalidatePath } from 'next/cache'
import { getToken } from './lib/auth'

type FNSResult = {
  
    ogrn: string
    inn: string
    name: string
    dir: string
    full_name: string
  
}

type CheckResult = {
  date: string
  result: string | FNSResult
  status: 'success' | 'error'
  type: string
}

export async function checkCompany(type: 'fns' | 'giis', inn: string): Promise<CheckResult> {
  const token = getToken()
  if (!token) {
    throw new Error('Не авторизован')
  }

  try {
    const response = await fetch(`http://backend:9000/check${type}/${inn}`, {
      // const response = await fetch(`http://127.0.0.1:9001/check${type}/${inn}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
    })
  

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    console.log(data)
    revalidatePath('/')

    return {
      date: new Date().toISOString(),
      result: data,
      status: 'success',
      type
    }
  } catch (error) {
    console.error('Error checking company:', error)
    return {
      date: new Date().toISOString(),
      result: 'Произошла ошибка при получении данных',
      status: 'error',
      type
    }
  }
}