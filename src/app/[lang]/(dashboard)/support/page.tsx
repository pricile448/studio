import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpContactForm } from '@/components/help/help-contact-form';
import { Lightbulb, Mail, MessageSquareQuote } from 'lucide-react';

export default async function SupportPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  const helpDict = dict.help;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{helpDict.title}</h1>
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="h-auto flex-wrap gap-1">
          <TabsTrigger value="faq"><MessageSquareQuote className="mr-2 h-4 w-4" />{helpDict.faqTitle}</TabsTrigger>
          <TabsTrigger value="contact"><Mail className="mr-2 h-4 w-4" />{helpDict.contactTitle}</TabsTrigger>
        </TabsList>
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>{helpDict.faqTitle}</CardTitle>
              <CardDescription>{helpDict.faqDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {helpDict.faq.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>{helpDict.contactTitle}</CardTitle>
              <CardDescription>{helpDict.contactDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <HelpContactForm dict={helpDict} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
