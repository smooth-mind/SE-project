import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { joinClass } from "@/api/class"
import { toast } from "sonner"

const formSchema = z.object({
    invite_code: z.string().length(7, "Code must be 7 characters"),
})

export type JoinClassPayload = z.infer<typeof formSchema>;

export default function JoinClass() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { invite_code: "" },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        joinClass(values).then(result => {
            if (result.ok)
                toast('Class joined successfully!')
            else
                toast.error(result.error)
        })
    }

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold text-center">Join a Class</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="invite_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class Code</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter 7-character code" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="secondary" className="w-full">Join</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

