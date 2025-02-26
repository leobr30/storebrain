import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Sheet, SheetTitle, SheetHeader, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useFieldArray, useForm } from "react-hook-form";
import { Alert } from "@/types/alert-types";
import { Company } from "@/types/company-types";
import ReactSelect from "react-select";
import { useEffect, useState } from "react";
import { fetchEmployees } from "@/features/employee-area/actions";
const styles = {
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "14px",
    }),
  };


  const customSelect = (companyId: string | null) => {
    const [users, setUsers] = useState<[]>([]);
    useEffect(() => {
        if(companyId) {
            fetchEmployees(companyId)
            .then(users => {
                setUsers(users)
            })
        }
    }, [companyId])
    
    return (
        <ReactSelect
            className="react-select"
            classNamePrefix="select"
            defaultValue={[]}
            styles={styles}
            name="clear"
            options={users}
            isClearable
        />
    )
}

export const AlertSheet = ({ alert, companies }: { alert: Alert, companies: Company[] }) => {

    const { control, register } = useForm<Alert>({
        defaultValues: alert
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'conditions'
    });

    

    return (
        <Sheet>
            <SheetTrigger>
                <Button variant="outline">Modifier</Button>
            </SheetTrigger>
            <SheetContent side='bottom' className="space-y-5">
                <SheetHeader>
                    <SheetTitle>Modification {alert.name}</SheetTitle>
                </SheetHeader>
                <p>{alert.description}</p>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-medium">Conditions</p>
                    <Button variant="outline" onClick={() => append({})}>Ajouter</Button>
                </div>
                {fields.map((field, index) => (
                        <div className="bg-default-100 rounded-md p-4" key={field.id}>
                            <div className="flex flex-wrap items-center gap-2">
                                <p>Lorsqu'une livraison n'est pas posée en vitrine sur</p>
                                <Select >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Choisir un magasin" />
                                    </SelectTrigger>
                                    <SelectContent >
                                        {companies.map((company) => (
                                            <SelectItem value={company.id.toString()}>{company.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p>après</p>
                                <Input type="number" className="w-20" removeWrapper {...register(`conditions.${index}.days`)} />
                                <p>jours, informer </p>                                
                            </div>
    
    
                        </div>
                    )
                )}
            </SheetContent>
        </Sheet>
    )
}