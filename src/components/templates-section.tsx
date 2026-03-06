import type { Templates } from "@/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface TemplatesSectionProps {
  templates: Templates
}

export function TemplatesSection({ templates }: TemplatesSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Templates and Tools</h2>
        <p className="text-sm text-text-muted mt-1">
          Reference templates for course documentation. Fill these in your own workspace.
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["position-statement"]}>
        {templates.positionStatement && (
          <AccordionItem
            value="position-statement"
            className="bg-card border border-border rounded-2xl px-5 mb-3 overflow-hidden"
          >
            <AccordionTrigger className="text-sm font-semibold text-text-secondary py-4 hover:no-underline hover:text-text-primary transition-colors">
              Position Statement
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              {templates.positionStatement.description && (
                <p className="text-sm text-text-muted mb-4">
                  {templates.positionStatement.description}
                </p>
              )}
              <div className="grid gap-3 md:grid-cols-3">
                {templates.positionStatement.elements?.map((element, i) => (
                  <div
                    key={i}
                    className="bg-surface rounded-xl p-4 border border-border-subtle"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-faint mb-1">
                      Element {i + 1}
                    </p>
                    <p className="text-sm text-text-tertiary">{element}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {templates.aiUseLog && (
          <AccordionItem
            value="ai-use-log"
            className="bg-card border border-border rounded-2xl px-5 mb-3 overflow-hidden"
          >
            <AccordionTrigger className="text-sm font-semibold text-text-secondary py-4 hover:no-underline hover:text-text-primary transition-colors">
              AI Use Log
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              {templates.aiUseLog.description && (
                <p className="text-sm text-text-muted mb-4">
                  {templates.aiUseLog.description}
                </p>
              )}
              {templates.aiUseLog.sections && (
                <div className="space-y-2">
                  {templates.aiUseLog.sections.map((section, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-sm text-text-tertiary"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-surface-hover text-text-muted text-xs font-medium flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {templates.recordOfResistance && (
          <AccordionItem
            value="record-of-resistance"
            className="bg-card border border-border rounded-2xl px-5 mb-3 overflow-hidden"
          >
            <AccordionTrigger className="text-sm font-semibold text-text-secondary py-4 hover:no-underline hover:text-text-primary transition-colors">
              Record of Resistance
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              {templates.recordOfResistance.description && (
                <p className="text-sm text-text-muted mb-4">
                  {templates.recordOfResistance.description}
                </p>
              )}
              {templates.recordOfResistance.fields && (
                <div className="space-y-3">
                  {templates.recordOfResistance.fields.map((field, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-text-secondary mb-1.5">{field}</p>
                      <div className="h-16 border border-dashed border-border rounded-xl bg-surface flex items-center justify-center text-xs text-text-faint">
                        Your response here
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </section>
  )
}
