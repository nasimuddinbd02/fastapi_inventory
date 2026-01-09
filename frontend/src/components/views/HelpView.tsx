import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Book, LifeBuoy, FileText, ExternalLink, Mail, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HelpView() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Help & Tools</h2>
        <p className="text-muted-foreground">
          Resources, documentation, and tools to help you manage your inventory effectively.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Helper Tools Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>System Tools</CardTitle>
                <CardDescription>Utilities for system maintenance and diagnostics.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                <FileText className="w-4 h-4 text-blue-500" />
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">Export System Logs</span>
                  <span className="text-xs text-muted-foreground">Download diagnostics data (JSON)</span>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                <LifeBuoy className="w-4 h-4 text-green-500" />
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">Connection Test</span>
                  <span className="text-xs text-muted-foreground">Ping database and API services</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                <Book className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Guides on how to use the Inventory System.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <ul className="space-y-3">
               <li>
                 <a href="#" className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group">
                    <span className="text-sm font-medium">Getting Started Guide</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                 </a>
               </li>
               <li>
                 <a href="#" className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group">
                    <span className="text-sm font-medium">Inventory Intake Process</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                 </a>
               </li>
               <li>
                 <a href="#" className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group">
                    <span className="text-sm font-medium">Managing Suppliers & Products</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                 </a>
               </li>
             </ul>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
           <CardTitle>Frequently Asked Questions</CardTitle>
           <CardDescription>Common questions and answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I update stock levels manually?</AccordionTrigger>
              <AccordionContent>
                Go to the <strong>Stock Position</strong> page, select the product, and use the "Adjustment" action. Alternatively, process an Intake or Dispatch order.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I export the Stock Ledger?</AccordionTrigger>
              <AccordionContent>
                Yes, navigate to <strong>Reports &gt; Stock Ledger</strong>. There is an export button in the top right corner of the table.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I add a new user?</AccordionTrigger>
              <AccordionContent>
                User management is found under <strong>Data &gt; Users & Sessions</strong>. You need administrative privileges to add or modify user accounts.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <div className="bg-muted/50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-dashed">
         <div className="flex items-center gap-4">
           <div className="p-3 bg-background rounded-full border shadow-sm">
             <Mail className="w-6 h-6 text-primary" />
           </div>
           <div>
             <h3 className="font-semibold">Still need help?</h3>
             <p className="text-sm text-muted-foreground">Our support team is available 24/7 to assist you.</p>
           </div>
         </div>
         <Button>Contact Support</Button>
      </div>
    </div>
  )
}
