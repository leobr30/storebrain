import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateOnerp } from "../actions";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Terminal } from "lucide-react";
// Définition du schéma de validation
const formSchema = z.object({
    onerpType: z.string().min(1, "Veuillez sélectionner un type de fichier"),
    file: z.instanceof(File, { message: "Veuillez sélectionner un fichier CSV" }),
});

// Type pour les données du formulaire
type FormValues = z.infer<typeof formSchema>;

export function OnerpForm() {
    const onerpTypes = [
        { type: "additif-coque", name: "Additif Coque" },
        { type: "creation-fairbelle", name: "Creation Fairbelle" },
        { type: "fairbelle-pictures", name: "Fairbelle Pictures" },
        { type: "create-robbez", name: "Creation Robbez" },
    ];

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            onerpType: "",
        },
    });

    


    const onSubmit = async (data: FormValues) => {
        try {
            const formData = new FormData();
            formData.append("file", data.file);
            const response = await generateOnerp(data.onerpType, formData);
            console.log(response);
        } catch (error) {
            console.error("Erreur lors de l'envoi:", error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Import OneRP</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                    control={form.control}
                    name="onerpType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type de fichier</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un type de fichier" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {onerpTypes.map((onerpType) => (
                                        <SelectItem key={onerpType.type} value={onerpType.type}>
                                            {onerpType.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                {form.watch("onerpType") === "fairbelle-pictures" ? (
                    <Alert variant='soft'>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Information.</AlertTitle>
                    <AlertDescription>
                    Le fichier doit être un fichier Excel avec Image, Reference 18, Reference 9, Reference Platine, Reference Paladium
                    </AlertDescription>
                  </Alert>
                ) : ''}
                {form.watch("onerpType") === "additif-coque" ? (
                    <Alert variant='soft'>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Information.</AlertTitle>
                    <AlertDescription>
                    Le fichier doit être un fichier CSV avec:
                    <ul>
                        <li>
                            1. Reference
                        </li>
                        <li>
                            2. Designation
                        </li>
                        <li>
                            3. Poids
                        </li>
                        <li>
                            4. Prix Achat
                        </li>
                    </ul>
                    </AlertDescription>
                  </Alert>
                ) : ''}
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { ref, name, onBlur, onChange } }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="mb-2">Fichier</FormLabel>
                            <Input
                                type="file"
                                ref={ref}
                                name={name}
                                onBlur={onBlur}
                                onChange={(e) => onChange(e.target.files?.[0])}
                                className={cn("", {
                                    "border-destructive focus:border-destructive":
                                        form.formState.errors.file,
                                })} />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                

                <Button type="submit">Envoyer</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
