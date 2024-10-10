/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Download } from 'lucide-react'
import { motion } from 'framer-motion'

interface FNSResult {
    ogrn: string
    inn: string
    name: string
    dir: string
    full_name: string
    pdf_url: string
}

interface CheckResult {
  date: string
  result: string | FNSResult
  status: 'loading' | 'success' | 'error'
  type: string
}

interface ResultCardProps {
  result: CheckResult
  index: number
}

export function ResultCard({ result, index }: ResultCardProps) {
  return (
    <motion.div
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
              <p><strong>ОГРН:</strong> {result.result.ogrn}</p>
              <p><strong>ИНН:</strong> {result.result.inn}</p>
              <p><strong>Наименование:</strong> {result.result.name}</p>
              <p><strong>Руководитель:</strong> {result.result.dir}</p>
              <p><strong>Полное наименование:</strong> {result.result.full_name}</p>
              {result.result.pdf_url && (
                <div className="mt-4">
                  <a
                    href={result.result.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Скачать выписку ЕГРЮЛ (PDF)
                  </a>
                </div>
              )}
            </div>
          )}
          {(result.status !== 'success' || result.type !== 'fns' || typeof result.result === 'string') && (
            <p>Результат:  {JSON.stringify(result.result)}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}