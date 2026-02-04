import { getPaymentConfig } from '@/actions/payment-actions';
import PaymentSettingsClient from './PaymentSettingsClient';

export default async function PaymentSettingsPage() {
  const config = await getPaymentConfig();

  return <PaymentSettingsClient initialConfig={config} />;
}
