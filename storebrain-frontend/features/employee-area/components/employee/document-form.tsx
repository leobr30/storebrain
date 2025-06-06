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
import { X, ChevronLeft, ChevronRight, FileText, CheckCircle, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { EmployeeJobOnboarding } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [hasDocument, setHasDocument] = useState<boolean | null>(null);
  const [initialSections, setInitialSections] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: '',
      items: []
    },
  });

  useEffect(() => {
    const checkDocAvailability = async () => {
      if (isCompleted || responseId) return;

      try {
        const formData = await getDoc();
        if (formData && formData.sections && formData.sections.length > 0) {
          setHasDocument(true);
        } else {
          setHasDocument(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du document :", error);
        setHasDocument(false);
      }
    };

    checkDocAvailability();
  }, [isCompleted, responseId]);

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
      setExpandedItems({});
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

  const toggleItemExpansion = (itemLabel: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemLabel]: !prev[itemLabel]
    }));
  };

  const isTextLong = (text: string) => {
    return text.length > 100 || text.includes('\n');
  };

  const getCompletionProgress = () => {
    const totalItems = sections.slice(0, -1).reduce((acc, section) => acc + (section.items?.length || 0), 0);
    const checkedItems = sections.slice(0, -1).reduce((acc, section) =>
      acc + (section.items?.filter(item => item.selected).length || 0), 0);
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={"ghost"}
          onClick={() => setOpen(true)}
          disabled={!isCompleted && !responseId && hasDocument === false}
        >
          {isCompleted ? "Consulter le Document" : "Démarrer le Document"}
        </Button>
      </SheetTrigger>
      <SheetContent
        closeIcon={<X className="h-5 w-5 relative hover:text-gray-600 transition-colors text-white" />}
        className="flex flex-col h-[95vh] p-0 rounded-t-2xl shadow-2xl"
        side="bottom"
      >
        <SheetHeader className="relative">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
            <SheetTitle className="text-2xl font-bold flex items-center gap-3 text-white">
              <div className="p-2 bg-white/20 rounded-lg">
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <FileText className="w-6 h-6 text-white" />}
              </div>
              {isCompleted ? "Document Complété" : "Accueil Nouveau Vendeur"}
            </SheetTitle>
            {!isCompleted && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-white/80 mb-2">
                  <span>Progression</span>
                  <span>{getCompletionProgress()}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${getCompletionProgress()}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-grow bg-gray-50">
          <div className="p-6">
            {loading || sections.length === 0 || !sections[currentStep] ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-56" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      <div className="bg-white rounded-xl p-6 shadow-md">
                        <h2 className="font-bold text-2xl text-gray-800 mb-2 flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{currentStep + 1}</span>
                          </div>
                          {sections[currentStep].title}
                        </h2>

                        {sections[currentStep].textarea ? (
                          <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4 text-gray-600">
                              <MessageSquare className="w-5 h-5" />
                              <span className="text-sm">Partagez vos observations ou commentaires</span>
                            </div>
                            <FormField
                              control={form.control}
                              name="comment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ajoutez un commentaire..."
                                      className="w-full min-h-[200px] border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                      {...field}
                                      disabled={isCompleted}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ) : (
                          <div className="space-y-3 mt-6">
                            {sections[currentStep].items?.map((item, index) => {
                              const isLong = isTextLong(item.label);
                              const isExpanded = expandedItems[item.label] || !isLong;

                              return (
                                <motion.div
                                  key={item.label}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className={`bg-white rounded-lg border-2 transition-all duration-200 ${item.selected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <div className="p-4">
                                    <div className="flex items-start gap-3">
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
                                                className="mt-1 h-5 w-5"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <div className="flex-grow">
                                        <Label
                                          htmlFor={item.label}
                                          className={`text-gray-700 cursor-pointer leading-relaxed ${!isExpanded && isLong ? 'line-clamp-2' : 'whitespace-pre-line'
                                            }`}
                                        >
                                          {item.label}
                                        </Label>
                                        {isLong && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleItemExpansion(item.label)}
                                            className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
                                          >
                                            {isExpanded ? (
                                              <>
                                                <ChevronUp className="w-4 h-4 mr-1" />
                                                Voir moins
                                              </>
                                            ) : (
                                              <>
                                                <ChevronDown className="w-4 h-4 mr-1" />
                                                Voir plus
                                              </>
                                            )}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </form>
                  </Form>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        <div className="bg-white border-t-2 border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Étape {currentStep + 1} sur {sections.length}
              </div>
              <div className="flex gap-1">
                {sections.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all duration-200 ${index === currentStep
                        ? 'bg-blue-600 w-8'
                        : index < currentStep
                          ? 'bg-blue-400'
                          : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                disabled={currentStep === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>

              {currentStep < sections.length - 1 ? (
                <Button
                  onClick={() => {
                    setCurrentStep((prev) => Math.min(prev + 1, sections.length - 1));
                    if (sections[currentStep].items) {
                      form.setValue('items', sections[currentStep].items)
                    }
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isCompleted}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isCompleted ? "Document complété" : "Valider le document"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}