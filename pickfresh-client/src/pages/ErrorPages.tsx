import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { Button, Card } from "../components/ui";

const ErrorShell = ({ code, title, body }: { code: string; title: string; body: string }) => (
  <main className="container-px grid min-h-[70vh] place-items-center py-10">
    <Seo title={title} description={body} />
    <Card className="max-w-xl p-8 text-center">
      <p className="text-sm font-bold text-primary-600">{code}</p>
      <h1 className="mt-3 text-4xl font-black">{title}</h1>
      <p className="mt-3 muted-copy">{body}</p>
      <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
    </Card>
  </main>
);

export const NotFoundPage = () => <ErrorShell code="404" title="Page not found" body="This grocery aisle does not exist." />;
export const ForbiddenPage = () => <ErrorShell code="403" title="Access denied" body="Your current role cannot open this area." />;
export const UnauthorizedPage = () => <ErrorShell code="401" title="Login required" body="Please login to continue." />;
export const ServerErrorPage = () => <ErrorShell code="500" title="Server error" body="Something failed while loading PickFresh." />;
export const MaintenancePage = () => <ErrorShell code="Maintenance" title="Freshness break" body="PickFresh is temporarily under maintenance." />;
export const OfflinePage = () => <ErrorShell code="Offline" title="You are offline" body="Reconnect to sync cart, orders and notifications." />;
