
import { redirect } from 'next/navigation'

// This root page now performs a relative redirect to the login page.
export default function RootPage() {
  redirect(`login`)
}
