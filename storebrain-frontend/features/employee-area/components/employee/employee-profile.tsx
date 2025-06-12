"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";

type EmployeeProfileProps = {
    name: string;
    image: string | undefined
}

export const EmployeeProfile = ({ name, image }: EmployeeProfileProps) => {
    return (
        <Card>
            <CardContent className="p-5 flex flex-col items-center">
                <div className="w-[124px] h-[124px] relative rounded-full">
                    <Avatar className="w-full h-full object-cover rounded-full">
                        <AvatarImage alt={name} src={image} />
                        <AvatarFallback className="text-xl">{name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button asChild
                        size="icon"
                        className="h-8 w-8 rounded-full cursor-pointer absolute bottom-0 right-0"
                    >
                        <Label
                            htmlFor="avatar"
                        >
                            <Icon className="w-5 h-5 text-primary-foreground" icon="heroicons:pencil-square" />
                        </Label>

                    </Button>
                </div>
                <p className=" mt-4 text-xl font-semibold text-default-950">{name}</p>
            </CardContent>

        </Card>
    )
}