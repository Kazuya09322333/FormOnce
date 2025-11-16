import RootLayout, { type RootLayoutProps } from '@layouts/rootLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Form',
  description: 'Form Page',
}

export type FormLayoutProps = RootLayoutProps

export const FormLayout = ({ children, ...props }: FormLayoutProps) => {
  return (
    <RootLayout theme="light" {...props}>
      <div className="relative h-[100vh] w-full">{children}</div>
    </RootLayout>
  )
}
