"use client"
//React
import { Dispatch, useState, useEffect } from 'react'
//UI
import { Button } from '@/components/ui/button'
import { Progress } from "@/components/ui/progress"
import { getAnalyze1 } from '../analyze-action'
import { GroupingResult } from './analyze1-types'
import { z } from "zod"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { REQUIRED } from '@/lib/utils'
import { io } from 'socket.io-client'

type Props = {
    analyzeData: GroupingResult[] | null,
    setAnalyzeData: Dispatch<any>
}

const FormSchema = z.object({
    supplierId: z
        .number({
            required_error: REQUIRED,
        })
        .nullable(),
    rayons: z
        .array(z.string())
        .optional(),
})

export const Analyze1Form = ({ analyzeData, setAnalyzeData }: Props) => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            rayons: [],
            supplierId: null,
        },
    })
    const [loading, setLoading] = useState<boolean>(false)
    const [progress, setProgress] = useState<{ current: number, total: number } | null>(null)
    const [socket, setSocket] = useState<any>(null)

    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string)
        setSocket(newSocket)

        newSocket.on('analyzeProgress', (data) => {            
            setProgress(data)
        })

        return () => {
            newSocket.close()
        }
    }, [])

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        setLoading(true)
        setProgress({ current: 0, total: 0 })

        try {
            const result = await getAnalyze1(data.supplierId ?? 0, data.rayons ?? [])
            setAnalyzeData(result)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
            setProgress(null)
        }
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
                                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
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
                    <div className="col-span-1">
                        <FormField
                            control={form.control}
                            name="rayons"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rayon OR ARGENT:</FormLabel>
                                    <MultiSelect
                                        options={[
                                            { value: 'OR', label: 'OR' },
                                            { value: 'ARGENT', label: 'ARGENT' },
                                        ]}
                                        placeholder="Sélectionner les rayons"
                                        selected={field.value || []}
                                        onChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='col-span-2'>
                        {loading ? (
                            <div className="space-y-2">
                                <Progress 
                                    value={progress ? (progress.current / progress.total) * 100 : 0} 
                                    color="primary"
                                />
                                {progress && (
                                    <p className="text-sm text-center text-muted-foreground">
                                        Traitement des produits : {progress.current} / {progress.total}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <Button type="submit">Lancée l'analyse</Button>
                        )}
                    </div>
                </div>
            </form>
        </Form>
    )
}