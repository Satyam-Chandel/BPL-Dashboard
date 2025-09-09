// Test file to verify all components are working without external dependencies
import React from 'react'
import { DashboardAnalytics } from './components/DashboardAnalytics'
import { ActivityFeed } from './components/ActivityFeed'
import { NotificationSystem } from './components/NotificationSystem'
import { CurrencySelector } from './components/CurrencySelector'
import { ExportSystem } from './components/ExportSystem'

export function TestComponents() {
  const [showExport, setShowExport] = React.useState(false)
  
  return (
    <div className="p-8 space-y-8">
      <h1>Component Test Page</h1>
      
      <div className="space-y-4">
        <h2>Currency Selector Test</h2>
        <CurrencySelector
          value="USD"
          onValueChange={(value) => console.log('Currency changed:', value)}
        />
      </div>
      
      <div className="space-y-4">
        <h2>Notification System Test</h2>
        <NotificationSystem />
      </div>
      
      <div className="space-y-4">
        <h2>Dashboard Analytics Test</h2>
        <DashboardAnalytics />
      </div>
      
      <div className="space-y-4">
        <h2>Activity Feed Test</h2>
        <ActivityFeed showUserFilter={true} maxItems={10} />
      </div>
      
      <div className="space-y-4">
        <h2>Export System Test</h2>
        <button onClick={() => setShowExport(true)}>
          Open Export System
        </button>
        <ExportSystem 
          isOpen={showExport} 
          onClose={() => setShowExport(false)} 
        />
      </div>
    </div>
  )
}