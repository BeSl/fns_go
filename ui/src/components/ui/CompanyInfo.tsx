/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Mail, Loader2, X } from 'lucide-react'

type FNSResult = {
  data: {
    ogrn: string
    inn: string
    name: string
    dir: string
    full_name: string
  }
}

type CheckResult = {
  date: string
  result: string | FNSResult
  status: 'loading' | 'success' | 'error'
  type: string
}

export default function CompanyInfo() {
  const [inn, setInn] = useState('')
  const [results, setResults] = useState<CheckResult[]>([])

  const checkCompany = useCallback(async (type: 'fns' | 'giis') => {
    const newResult: CheckResult = {
      date: new Date().toISOString(),
      result: 'Получаем данные от сервиса...',
      status: 'loading',
      type
    }
    setResults(prev => [...prev, newResult])

    const resultIndex = results.length

    try {
      const response = await Promise.race([
        fetch(`http://localhost:9001/check${type}?inn=${inn}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ])

      if (!response || !(response instanceof Response) || !response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      setResults(prev => prev.map((item, index) => 
        index === resultIndex 
          ? { ...item, result: data, status: 'success' }
          : item
      ))
    } catch (error) {
      setResults(prev => prev.map((item, index) => 
        index === resultIndex 
          ? { ...item, result: 'Произошла ошибка при получении данных', status: 'error' }
          : item
      ))
    }
  }, [inn, results.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(prev => prev.map(item => 
        item.status === 'loading' 
          ? { ...item, status: 'error', result: 'Превышено время ожидания ответа' }
          : item
      ))
    }, 10000)

    return () => clearTimeout(timer)
  }, [results])

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen flex flex-col bg-sky-50">
      {/* Баннер с информацией о сайте и логотипом */}
      <div className="bg-sky-600 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
          <Image
            src="/logo.jpg"
              alt="Логотип сайта"
              width={40}
              height={40}
              className="mr-4"
            />
            <h1 className="text-2xl font-bold">Информация о юридических лицах</h1>
          </div>
          <p className="hidden md:block">Проверка ИНН в базах ФНС и ГИИС</p>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Введите ИНН"
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
            />
            <div className="relative border border-sky-300 rounded-lg p-4 pt-6">
              <span className="absolute -top-3 left-4 bg-sky-50 px-2 text-sm text-sky-600 font-medium">
                Доступные проверки
              </span>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => checkCompany('fns')}
                  className="flex-1 bg-sky-500 hover:bg-sky-600"
                >
                  ФНС
                </Button>
                <Button 
                  onClick={() => checkCompany('giis')}
                  className="flex-1 bg-sky-500 hover:bg-sky-600"
                >
                  ГИИС
                </Button>
              </div>
            </div>
          </div>

          {results.length > 0 && (
            <div className="flex justify-end mb-2">
              <Button
                onClick={clearResults}
                variant="outline"
                size="sm"
                className="text-sky-600 border-sky-300 hover:bg-sky-100"
              >
                <X className="w-4 h-4 mr-2" />
                Очистить результаты
              </Button>
            </div>
          )}

          <div className="space-y-4 w-2/3 mx-auto">
            {results.map((result, index) => (
              <Card 
                key={index} 
                className={
                  result.status === 'error' 
                    ? 'bg-red-100' 
                    : result.status === 'success'
                      ? 'bg-green-100'
                      : 'bg-yellow-100'
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {result.status === 'error' ? (
                      <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                    ) : result.status === 'success' ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <Loader2 className="mr-2 h-4 w-4 text-yellow-500 animate-spin" />
                    )}
                    Результат проверки в {result.type.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Дата: {new Date(result.date).toLocaleString()}</p>
                  {result.status === 'success' && result.type === 'fns' && typeof result.result !== 'string' && (
                    <div className="mt-2 space-y-2">
                      <p><strong>ОГРН:</strong> {result.result.data.ogrn}</p>
                      <p><strong>ИНН:</strong> {result.result.data.inn}</p>
                      <p><strong>Наименование:</strong> {result.result.data.name}</p>
                      <p><strong>Руководитель:</strong> {result.result.data.dir}</p>
                      <p><strong>Полное наименование:</strong> {result.result.data.full_name}</p>
                    </div>
                  )}
                  {(result.status !== 'success' || result.type !== 'fns' || typeof result.result === 'string') && (
                    <p>Результат: {JSON.stringify(result.result) }</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Раздел для связи с разработчиком */}
      <div className="bg-sky-200 text-sky-800 p-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-xl font-semibold mb-2">Связь с разработчиком</h2>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <a href="mailto:developer@example.com" className="hover:underline">
            im@vbelyakov1.ru
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}