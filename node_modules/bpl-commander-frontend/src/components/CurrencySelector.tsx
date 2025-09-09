import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { SUPPORTED_CURRENCIES, CurrencyInfo } from '../utils/centralizedDb'

interface CurrencySelectorProps {
  value: string
  onValueChange: (currency: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function CurrencySelector({ 
  value, 
  onValueChange, 
  disabled = false, 
  className = "",
  placeholder = "Select currency" 
}: CurrencySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {SUPPORTED_CURRENCIES.map((currency: CurrencyInfo) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{currency.symbol}</span>
              <span>{currency.code}</span>
              <span className="text-muted-foreground">- {currency.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Hook for currency formatting
export function useCurrency() {
  const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)
    if (!currency) return `${amount} ${currencyCode}`
    
    try {
      const formatter = new Intl.NumberFormat(currency.locale || 'en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces
      })
      return formatter.format(amount)
    } catch {
      return `${currency.symbol}${amount.toFixed(currency.decimalPlaces)}`
    }
  }

  const getCurrencySymbol = (currencyCode: string): string => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)
    return currency?.symbol || currencyCode
  }

  return { formatCurrency, getCurrencySymbol }
}