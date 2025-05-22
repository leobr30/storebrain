'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getDoc, saveEmployeeResponse, handleGeneratePdfAndSendEmail, markDocumentAsCompleted, getFormWithResponse } from './document-form-action';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { EmployeeJobOnboarding } from '../../types';

const formSchema = z.object({
  comment: z.string().optional(),
  items: z.array(z.object({
    label: z.string(),
    selected: z.boolean()
  })).optional()
});

interface DocumentFormProps {
  setOpen: (open: boolean) => void;
  open: boolean;
  onSubmitSuccess: (updatedStep: EmployeeJobOnboarding | null) => void;
  employeeId: number;
  stepId: number;
  status: string;
  responseId?: string;
}

export default function DocumentForm({ setOpen, open, onSubmitSuccess, employeeId, stepId, status, responseId }: DocumentFormProps) {
  const [isCompleted, setIsCompleted] = useState(status === "COMPLETED");
  const { data: session } = useSession();
  const username = session?.user?.username;
  const userId = session?.user?.id;
  const emailDestinataire = "gabriel.beduneau@diamantor.fr";

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formId, setFormId] = useState<string | null>(null);
  const [initialSections, setInitialSections] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: '',
      items: []
    },
  });

  useEffect(() => {
    setIsCompleted(status === "COMPLETED");
  }, [status]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        let formData;
        if (responseId) {
          formData = await getFormWithResponse(responseId);
          if (!formData || !formData.form || !formData.responses) throw new Error('Données du formulaire invalides');
          setFormId(formData.formId);
          const initialSectionsData = [...formData.form.sections.map((section, index) => ({
            id: index + 1,
            title: `${index + 1}° ${section.title}`,
            items: section.items.map((item: any) => ({
              label: item.label,
              selected: formData.responses.find((r: any) => r.title === `${index + 1}° ${section.title}`)?.items.find((i: any) => i.label === item.label)?.selected || false,
            })),
          })), { id: 'comment', title: 'Commentaire - Autres', textarea: true }];
          setInitialSections(initialSectionsData);
          setSections(initialSectionsData);
          form.reset({ comment: formData.comment || '' });
        } else {
          formData = await getDoc();
          if (!formData || !formData.sections || !formData.id) throw new Error('Données du formulaire invalides');
          setFormId(formData.id);
          const initialSectionsData = [...formData.sections.map((section, index) => ({
            id: index + 1,
            title: `${index + 1}° ${section.title}`,
            items: section.items.map((item: any) => ({ label: item.label, selected: false })),
          })), { id: 'comment', title: 'Commentaire - Autres', textarea: true }];
          setInitialSections(initialSectionsData);
          setSections(initialSectionsData);
          form.reset({ comment: formData.comment || '' });
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du formulaire:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [responseId]);

  useEffect(() => {
    if (open && initialSections.length > 0) {
      setSections(initialSections);
      form.reset({ comment: '' });
      setCurrentStep(0);
    }
  }, [open, initialSections]);


  const handleCheckboxChange = (itemLabel: string, sectionIndex: number) => {
    setSections(prevSections => {
      return prevSections.map((section, index) => {
        if (index === sectionIndex && section.items) {
          return {
            ...section,
            items: section.items.map(item => {
              if (item.label === itemLabel) {
                return { ...item, selected: !item.selected };
              }
              return item;
            })
          };
        }
        return section;
      });
    });
  };

  const handleSubmit = async () => {
    if (!userId || !formId) {
      toast.error("❌ Erreur de session ou formulaire.");
      console.error("❌ userId ou formId est null :", { userId, formId });
      return;
    }

    try {
      const payload = {
        userId,
        formId,
        employeeId,
        stepId,
        currentUserId: userId,
        responses: sections.filter((s) => s.items).map((s) => ({
          title: s.title,
          items: s.items?.map((item) => ({ label: item.label, selected: item.selected })),
        })),
        comment: form.getValues("comment"),
      };

      console.log("📨 Données envoyées à saveEmployeeResponse :", payload);

      const response = await saveEmployeeResponse(payload);
      if (username) {
        await handleGeneratePdfAndSendEmail(response.id, emailDestinataire, username);
      }

      toast.success("Formulaire soumis avec succès !");
      setOpen(false);
      setTimeout(() => {
        onSubmitSuccess(response.updatedStep);
      }, 500);
    } catch (error) {
      console.error("❌ Erreur lors de la soumission :", error);
      toast.error("Échec de l'enregistrement");
      onSubmitSuccess(null);
    }
  };


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"ghost"} onClick={() => setOpen(true)}>
          {isCompleted ? "Consulter le Document" : "Démarrer le Document"}
        </Button>
      </SheetTrigger>
      <SheetContent closeIcon={<X className="h-5 w-5 relative" />} className="flex flex-col h-[90vh] p-0" side="bottom">
        <SheetHeader>
          <SheetTitle className="p-3 border-b border-gray-200">
            {isCompleted ? "Document Complété" : "Accueil Nouveau Vendeur"}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow p-4">
          {loading || sections.length === 0 || !sections[currentStep] ? (
            <Skeleton className="h-5 w-40 mx-auto my-6" />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                <h2 className="font-semibold text-xl text-gray-800 mb-3">{sections[currentStep].title}</h2>
                {sections[currentStep].textarea ? (
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Ajoutez un commentaire..."
                            className="w-full border border-gray-300 rounded-md"
                            {...field}
                            disabled={isCompleted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-3">
                    {sections[currentStep].items?.map((item, index) => (
                      <div key={item.label} className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm border border-gray-300">
                        <FormField
                          control={form.control}
                          name={`items.${index}.selected`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={item.selected}
                                  onCheckedChange={() => {
                                    handleCheckboxChange(item.label, currentStep);
                                    form.setValue(`items.${index}.selected`, !item.selected);
                                  }}
                                  id={item.label}
                                  disabled={isCompleted}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Label htmlFor={item.label} className="flex-grow text-gray-700">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </Form>
          )}
        </ScrollArea>
        <Separator className="my-4" />
        <SheetFooter className="p-4 flex justify-between items-center bg-white border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {currentStep + 1} / {sections.length}
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} disabled={currentStep === 0} variant="outline">Précédent</Button>
            {currentStep < sections.length - 1 ? (
              <Button onClick={() => {
                setCurrentStep((prev) => Math.min(prev + 1, sections.length - 1));
                if (sections[currentStep].items) {
                  form.setValue('items', sections[currentStep].items)
                }
              }}>Suivant</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isCompleted} className="bg-green-600 hover:bg-green-700 text-white">
                {isCompleted ? "Consulter" : "Valider"}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
