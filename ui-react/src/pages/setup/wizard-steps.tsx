import type { ReactNode } from 'react'

import type { I18nKey } from '@/i18n/dictionaries'
import { Step10SystemCheck } from './steps/Step10SystemCheck'
import { Step11ApacheCheck } from './steps/Step11ApacheCheck'
import { Step12VhostCheck } from './steps/Step12VhostCheck'
import { Step13FsRightsCheck } from './steps/Step13FsRightsCheck'
import { Step14Environment } from './steps/Step14Environment'
import { Step20DatabaseConnection } from './steps/Step20DatabaseConnection'
import { Step31ModuleSelection } from './steps/Step31ModuleSelection'

export interface WizardStepDef {
  id: string
  /** Clé i18n du libellé d'étape (traduite à l'affichage dans SetupWizardPage). */
  labelKey: I18nKey
  render: (onStatusChange: (passed: boolean) => void) => ReactNode
}

/** Registre des étapes du wizard — dans l'ordre du carousel legacy. Ajouter une étape ici
 *  suffit à la faire apparaître dans la barre de progression et la navigation Suivant/Précédent. */
export const SETUP_STEPS: WizardStepDef[] = [
  { id: 'sysconfig', labelKey: 'setup.step.system', render: (cb) => <Step10SystemCheck onStatusChange={cb} /> },
  { id: 'apache', labelKey: 'setup.step.apache', render: (cb) => <Step11ApacheCheck onStatusChange={cb} /> },
  { id: 'vhost', labelKey: 'setup.step.vhost', render: (cb) => <Step12VhostCheck onStatusChange={cb} /> },
  { id: 'fsrights', labelKey: 'setup.step.fsrights', render: (cb) => <Step13FsRightsCheck onStatusChange={cb} /> },
  { id: 'environment', labelKey: 'setup.step.environment', render: (cb) => <Step14Environment onStatusChange={cb} /> },
  { id: 'dbconn', labelKey: 'setup.step.database', render: (cb) => <Step20DatabaseConnection onStatusChange={cb} /> },
  { id: 'modules', labelKey: 'setup.step.modules', render: (cb) => <Step31ModuleSelection onStatusChange={cb} /> },
]
