import { getSession } from '@/lib/session';
import LogoutButton from './LogoutButton';

export default async function HeaderNav() {
  const member = await getSession();
  if (!member) return null;

  const display = member.name ?? member.email.split('@')[0];

  return (
    <div className="identity-connected">
      <span>{display}</span>
      <LogoutButton />
    </div>
  );
}
