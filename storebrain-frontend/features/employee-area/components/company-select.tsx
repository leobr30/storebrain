import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Company } from "@/types/company-types"
import { se } from "date-fns/locale"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

type CompanySelectProps = {
    companies: Company[]
}

export const CompanySelect = ({ companies }: CompanySelectProps) => {
    const searchParams = useSearchParams()
    const pathname = usePathname();
    const { replace } = useRouter();

    //TEMPS FIX TO REFRESH SELECT
    const [key, setKey] = useState<number>(+new Date())


    const handleCompanySelect = (companyId: string) => {
        const params = new URLSearchParams(searchParams)
        if (companyId) {
            params.set('company', companyId)
        } else {
            params.delete('company')
            setKey(+new Date())
        }
        console.log(`${pathname}?${params.toString()}`)
        replace(`${pathname}?${params.toString()}`);

    }
    return (
        <Select key={key} onValueChange={(value) => handleCompanySelect(value)} value={searchParams.get('company') ?? undefined}>
            <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Choisir une société" className="whitespace-nowrap" />
            </SelectTrigger>
            <SelectContent>
                {companies?.map(company => <SelectItem
                    value={company.id.toString()}
                >{company.name}</SelectItem>)}


                {searchParams.get('company') &&
                    <>
                        <SelectSeparator />
                       <Button onClick={(e) => {
                        e.stopPropagation()
                        handleCompanySelect(null)
                        setKey(+new Date())
                       }}>Réinitialiser</Button>
                    </>
                }
            </SelectContent>

        </Select>
    )
}