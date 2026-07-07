import type { ReactNode } from 'react'

import { Step10SystemCheck } from './steps/Step10SystemCheck'
import { Step11ApacheCheck } from './steps/Step11ApacheCheck'
import { Step12VhostCheck } from './steps/Step12VhostCheck'
import { Step13FsRightsCheck } from './steps/Step13FsRightsCheck'
import { Step14Environment } from './steps/Step14Environment'
import { Step20DatabaseConnection } from './steps/Step20DatabaseConnection'
import { Step31ModuleSelection } from './steps/Step31ModuleSelection'

export interface WizardStepDef {
  id: string
  label: string
  render: (onStatusChange: (passed: boolean) => void) => ReactNode
}

/** Registre des étapes du wizard — dans l'ordre du carousel legacy. Ajouter une étape ici
 *  suffit à la faire apparaître dans la barre de progression et la navigation Suivant/Précédent. */
export const SETUP_STEPS: WizardStepDef[] = [
  { id: 'sysconfig', label: 'Système', render: (cb) => <Step10SystemCheck onStatusChange={cb} /> },
  { id: 'apache', label: 'Apache', render: (cb) => <Step11ApacheCheck onStatusChange={cb} /> },
  { id: 'vhost', label: 'Vhost', render: (cb) => <Step12VhostCheck onStatusChange={cb} /> },
  { id: 'fsrights', label: 'Droits fichiers', render: (cb) => <Step13FsRightsCheck onStatusChange={cb} /> },
  { id: 'environment', label: 'Environnement', render: (cb) => <Step14Environment onStatusChange={cb} /> },
  { id: 'dbconn', label: 'Base de données', render: (cb) => <Step20DatabaseConnection onStatusChange={cb} /> },
  { id: 'modules', label: 'Modules', render: (cb) => <Step31ModuleSelection onStatusChange={cb} /> },
]
