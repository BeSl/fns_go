import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'

interface InputRowProps {
  onCheck: (type: 'fns' | 'giis', inn: string) => void
  isLoading: boolean
}

export function InputRow({ onCheck, isLoading }: InputRowProps) {
  const [inn, setInn] = useState('')

  return (
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
            onClick={() => onCheck('fns', inn)}
            className="flex-1 bg-sky-500 hover:bg-sky-600 transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            ФНС
          </Button>
          <Button 
            onClick={() => onCheck('giis', inn)}
            className="flex-1 bg-sky-500 hover:bg-sky-600 transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            ГИИС
          </Button>
        </div>
      </div>
    </div>
  )
}