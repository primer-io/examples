import { AppTopbar, Button, H1, H2 } from '@primer-io/goat';
import { apiConfigSchema } from '../../../config/apiConfig.ts';
import {
  clientSessionSchema,
  clientUISchema,
} from '../../../config/clientSession.ts';
import { dropInConfigSchema } from '../../../config/dropinCongfig/dropinConfig.ts';
import { ConfigForm } from '../../components/ConfigForm/ConfigForm.tsx';
import { ErrorDisplay } from '../../components/ErrorDisplay/ErrorDisplay.tsx';
import { Loading } from '../../components/Loading/Loading.tsx';
import { PageContainer } from '../../components/PageContainer';
import { SessionSummary } from '../../components/SessionSummary/SessionSummary.tsx';
import { useAPIConfig } from '../../hooks/useAPIConfig.ts';
import { useClientSession } from '../../hooks/useClientSession.ts';
import { useDropInConfig } from '../../hooks/useDropInConfig.ts';
import { usePrimerDropIn } from '../../hooks/usePrimerDropIn.ts';
import { formatMoney } from '../../utils/currency.ts';
import { formatValuesToString } from '../../utils/formatValuesToString.ts';
import styles from './DropIn.module.scss';

const dropInContainer = 'dropin-container';

export const DropIn = () => {
  const apiConfig = useAPIConfig();
  const dropInConfig = useDropInConfig();

  const clientSession = useClientSession(
    apiConfig.config?.apiKey,
    apiConfig.config?.environment,
  );

  const dropIn = usePrimerDropIn(
    `#${dropInContainer}`,
    clientSession.clientSession?.clientToken,
    dropInConfig.config,
  );

  const error = clientSession.error || dropIn.error;

  return (
    <>
      <AppTopbar.Portal>
        <AppTopbar.Actions>
          <ConfigForm
            value={dropInConfig.config}
            schema={dropInConfigSchema}
            onSubmit={dropInConfig.setConfig}
            strings={{
              trigger: 'Configure Checkout',
              header: 'Configure Checkout SDK Settings',
            }}
          />
          <ConfigForm
            value={apiConfig.config}
            schema={apiConfigSchema}
            onSubmit={apiConfig.setConfig}
            strings={{
              trigger: 'Configure API',
              header: 'Configure API Settings',
            }}
          />
          <ConfigForm
            value={clientSession.config}
            schema={clientSessionSchema}
            uiSchema={clientUISchema}
            onSubmit={clientSession.setConfig}
            strings={{
              trigger: 'Client Session',
              header: 'Configure Client Session',
            }}
          />
        </AppTopbar.Actions>
      </AppTopbar.Portal>
      <PageContainer className={styles.container}>
        <H1>SDK Web Drop-In</H1>
        <div className={styles.actions}>
          <Button
            disabled={
              !apiConfig.config?.apiKey || !apiConfig.config?.environment
            }
            loading={clientSession.isLoading}
            onClick={clientSession.createClientSession}
          >
            Create Client Session
          </Button>
          <Button
            disabled={
              !apiConfig.config?.apiKey ||
              !apiConfig.config?.environment ||
              !clientSession.clientSession?.clientToken
            }
          >
            Update Client Session
          </Button>
        </div>
        {error && <ErrorDisplay>{formatValuesToString(error)}</ErrorDisplay>}
        <main className={styles.main}>
          <div className={styles.details}>
            <H2>Client Session</H2>
            <SessionSummary
              entries={[
                { name: 'API Key', value: apiConfig.config?.apiKey },
                {
                  name: 'Environment',
                  value: apiConfig.config?.environment,
                },
                {
                  name: 'Client Token',
                  value: clientSession.clientSession?.clientToken,
                },
                {
                  name: 'Amount',
                  value:
                    clientSession.clientSession?.amount &&
                    clientSession.clientSession.currencyCode
                      ? formatMoney(
                          clientSession.clientSession.amount,
                          clientSession.clientSession.currencyCode,
                        )
                      : 'N/A',
                },
              ]}
            />
          </div>
          <div>
            {dropIn.isLoading && <Loading />}
            <div id={dropInContainer} className={styles.dropinContainer} />
          </div>
        </main>
      </PageContainer>
    </>
  );
};
