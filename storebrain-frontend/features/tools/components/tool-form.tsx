"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronsUpDownIcon } from "lucide-react";

const ToolForm = ({ onSubmit, formOpen, setFormOpen }: { onSubmit: (formData: FormData) => void, formOpen: boolean, setFormOpen: (formOpen: boolean) => void }) => {
    return (
        <Card>
            <Collapsible open={formOpen} onOpenChange={setFormOpen}>
                <CardHeader className="flex-row justify-between items-center ">
                    <CardTitle>Formulaire
                    </CardTitle>
                    <CollapsibleTrigger>
                        <Button variant="ghost" size="sm">
                            <ChevronsUpDownIcon className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-5">
                        <Alert variant="soft">
                            <AlertTitle>
                                Information
                            </AlertTitle>
                            <AlertDescription>
                                Le fichier doit etre un .csv avec:
                                <ul>
                                    <li>
                                        - Fournisseur ID
                                    </li>
                                    <li>
                                        - Reference
                                    </li>
                                    <li>
                                        - Nouveau prix facon
                                    </li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                        <Label>Fichier</Label>

                        <Input type="file" onChange={(e) => {
                            const formData = new FormData();
                            formData.append('file', e.target.files[0]);
                            onSubmit(formData);
                        }} />

                    </CardContent>
                </CollapsibleContent>
            </Collapsible>



        </Card>
    );
};

export default ToolForm;
