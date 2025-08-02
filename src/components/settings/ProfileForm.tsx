
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/ClerkAuthContext"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const profileFormSchema = z.object({
  first_name: z.string().max(50, "First name is too long.").optional().or(z.literal('')),
  last_name: z.string().max(50, "Last name is too long.").optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { profile, user } = useAuth()
  const { toast } = useToast()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || user?.firstName || "",
      last_name: profile?.last_name || user?.lastName || "",
    },
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
    // Profile updates are handled by Clerk
    toast({
      title: "Profile updates",
      description: "Profile updates are managed through your Clerk account settings.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          This is how others will see you on the site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your first name" {...field} value={field.value ?? ''} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your last name" {...field} value={field.value ?? ''} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input value={user?.emailAddresses?.[0]?.emailAddress || ''} readOnly disabled />
              <FormDescription>
                You can't change your email address here. Use your Clerk account settings.
              </FormDescription>
            </FormItem>
             <FormItem>
              <FormLabel>Role</FormLabel>
              <Input value={profile?.role || "Not set"} readOnly disabled />
            </FormItem>
            <Button type="submit" disabled>
              Update profile (Managed by Clerk)
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
