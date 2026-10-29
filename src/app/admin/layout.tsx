// Admin section has its own layout — no TBL navbar/footer
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
