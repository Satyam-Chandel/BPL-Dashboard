import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function InteractionDebug() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')

  const handleButtonClick = () => {
    console.log('Button clicked!')
    setCount(prev => prev + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed:', e.target.value)
    setInputValue(e.target.value)
  }

  const handleSelectChange = (value: string) => {
    console.log('Select changed:', value)
    setSelectValue(value)
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Interaction Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Button Test (Count: {count})</p>
          <Button 
            onClick={handleButtonClick}
            className="w-full"
            type="button"
          >
            Click Me ({count})
          </Button>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Input Test</p>
          <Input
            placeholder="Type something..."
            value={inputValue}
            onChange={handleInputChange}
            type="text"
          />
          <p className="text-xs text-muted-foreground mt-1">Value: {inputValue}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Select Test</p>
          <Select value={selectValue} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Selected: {selectValue}</p>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Check browser console for interaction logs
          </p>
        </div>
      </CardContent>
    </Card>
  )
}