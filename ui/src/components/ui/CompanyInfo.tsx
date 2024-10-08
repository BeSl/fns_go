/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Mail, Loader2, X } from 'lucide-react'
import { checkCompany } from '../../app/actions'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCheckCompany = async (type: 'fns' | 'giis') => {
    setIsLoading(true)
    toast({
      title: "Запрос принят",
      description: "Подождите...",
      duration: 3000,
      className: "border-l-4 border-green-500",
    })
    try {
      const result = await checkCompany(type, inn)
      setResults(prev => [...prev, result])
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить данные. Попробуйте еще раз.",
        duration: 5000,
        className: "border-l-4 border-red-500",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
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
                  onClick={() => handleCheckCompany('fns')}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 transition-colors duration-200"
                  disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  ФНС
                </Button>
                <Button 
                  onClick={() => handleCheckCompany('giis')}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 transition-colors duration-200"
                  disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                className="text-sky-600 border-sky-300 hover:bg-sky-100 transition-colors duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Очистить результаты
              </Button>
            </div>
          )}

          <AnimatePresence>
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-2/3 mx-auto"
              >
                <Card 
                  className={`${
                    result.status === 'error' ? 'bg-red-100' : 'bg-green-100'
                  } transition-colors duration-200`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {result.status === 'error' ? (
                        <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
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
                      <p>Результат: {JSON.stringify(result.result)}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
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