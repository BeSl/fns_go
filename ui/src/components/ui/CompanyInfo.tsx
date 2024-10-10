/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
// import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Mail, Loader2, X } from 'lucide-react'
import { checkCompany } from '../../app/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { InputRow } from './InputRow'
import { ResultCard } from './ResultCard'

type FNSResult = {
    ogrn: string
    inn: string
    name: string
    dir: string
    full_name: string
    pdf_url: string
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

  const handleCheckCompany = async (type: 'fns' | 'giis', inn: string) => {
    setIsLoading(true)
    toast({
      title: "Запрос принят",
      description: "Подождите...",
      duration: 3000,
      className: "border-l-4 border-green-500",
    })
    try {
      const result = await checkCompany(type, inn)
      setResults((prev: CheckResult[]) => [...prev, result as CheckResult])
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
      <div className="bg-sky-600 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
          <Image src="/logo.jpg" alt="Логотип сайта" width={40} height={40} className="mr-4"/>
            <h1 className="text-2xl font-bold">Информация о юридических лицах</h1>
          </div>
          <p className="hidden md:block">Проверка ИНН в базах ФНС и ГИИС</p>
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <InputRow onCheck={handleCheckCompany} isLoading={isLoading} />
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
            {results.map((result, index: number) => (
              <ResultCard key={index} result={result} index={index} />
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