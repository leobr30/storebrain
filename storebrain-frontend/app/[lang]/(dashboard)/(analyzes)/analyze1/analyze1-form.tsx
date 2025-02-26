"use client"
//React
import { Dispatch, useState } from 'react'
//UI
import { Button } from '@/components/ui/button'
import { CircularProgress } from "@/components/ui/progress"
import { getAnalyze1 } from '../analyze-action'
import { GroupingResult } from './analyze1-types'
import { z } from "zod"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { REQUIRED } from '@/lib/utils'

type Props = {
    analyzeData: GroupingResult[] | null,
    setAnalyzeData: Dispatch<any>
}

const FormSchema = z.object({
    supplierId: z
        .string({
            required_error: REQUIRED,
        })
        .optional(),
})

export const Analyze1Form = ({ analyzeData, setAnalyzeData }: Props) => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    const [loading, setLoading] = useState<boolean>(false)

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        setLoading(true)
        setAnalyzeData(await getAnalyze1(data.supplierId ?? null))
        setLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 space-y-2.5 gap-4">
                    <div className="col-span-1">
                        <FormField
                            control={form.control}
                            name="supplierId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fournisseur:</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir un fournisseur" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">SOFABI</SelectItem>
                                            <SelectItem value="3">ROBBEZ</SelectItem>
                                            <SelectItem value="8">BABY CHIBI</SelectItem>
                                            <SelectItem value="7">ARPAS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='col-span-2'>
                        {loading ?
                            <CircularProgress value={50} color="primary" loading />
                            :
                            <Button type="submit">Lancée l'analyse</Button>
                        }
                    </div>
                </div>
            </form>
        </Form>

    )
}