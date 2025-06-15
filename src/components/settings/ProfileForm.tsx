
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
import { useAuth } from "@/contexts/AuthContext"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile, ProfileUpdate } from "@/api/profiles"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const profileFormSchema = z.object({
  first_name: z.string().max(50, "First name is too long.").optional().or(z.literal('')),
  last_name: z.string().max(50, "Last name is too long.").optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { profile, user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
    },
    mode: "onChange",
  })

  const { mutate: updateProfileMutation, isPending } = useMutation({
    mutationFn: (data: ProfileUpdate) => updateProfile(data),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "There was a problem with your request.",
      })
    },
  })

  function onSubmit(data: ProfileFormValues) {
    const updateData: ProfileUpdate = {};
    if (data.first_name !== (profile?.first_name || "")) {
      updateData.first_name = data.first_name;
    }
    if (data.last_name !== (profile?.last_name || "")) {
      updateData.last_name = data.last_name;
    }
    if (Object.keys(updateData).length > 0) {
      updateProfileMutation(updateData);
    } else {
      toast({
        title: "No changes",
        description: "You haven't made any changes to your profile.",
      })
    }
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
                    <Input placeholder="Your first name" {...field} value={field.value ?? ''} />
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
                    <Input placeholder="Your last name" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input value={user?.email} readOnly disabled />
              <FormDescription>
                You can't change your email address.
              </FormDescription>
            </FormItem>
             <FormItem>
              <FormLabel>Role</FormLabel>
              <Input value={profile?.role || "Not set"} readOnly disabled />
            </FormItem>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Update profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
