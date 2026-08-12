import type { ReactNode } from 'react'

import type { I18nKey } from '@/i18n/dictionaries'
import { Step10SystemCheck } from './steps/Step10SystemCheck'
import { Step11ApacheCheck } from './steps/Step11ApacheCheck'
import { Step12VhostCheck } from './steps/Step12VhostCheck'
import { Step13FsRightsCheck } from './steps/Step13FsRightsCheck'
import { Step14Environment } from './steps/Step14Environment'
import { Step20DatabaseConnection } from './steps/Step20DatabaseConnection'
import { Step31ModuleSelection } from './steps/Step31ModuleSelection'
import { Step32Install } from './steps/Step32Install'
import { Step33ModuleConfiguration } from './steps/Step33ModuleConfiguration'
import { Step40Finish } from './steps/Step40Finish'

/**
 * Enregistre l'action à exécuter quand l'utilisateur quitte l'étape vers l'avant (clic sur
 * Suivant) — équivalent des `addEnvironments`/`addNewUser` déclenchés par le bouton Next du
 * carousel legacy : les étapes de saisie n'ont pas de bouton Enregistrer à elles. L'action
 * renvoie `false` pour bloquer la navigation (erreur serveur). Appeler avec `null` pour se
 * désinscrire (démontage de l'étape).
 */
export type RegisterBeforeNext = (action: (() => Promise<boolean>) | null) => void

export interface WizardStepDef {
  id: string
  /** Clé i18n du libellé d'étape (traduite à l'affichage dans SetupWizardPage). */
  labelKey: I18nKey
  /**
   * Point de non-retour : une fois cette étape ATTEINTE, la navigation arrière est verrouillée
   * (bouton Précédent + pastilles de la barre de progression). L'installation écrit en base et
   * déploie les modules — rejouer les étapes amont (sélection des modules, connexion DB…)
   * casserait ce qui vient d'être installé.
   */
  pointOfNoReturn?: boolean
  render: (onStatusChange: (passed: boolean) => void, registerBeforeNext: RegisterBeforeNext) => ReactNode
}

/** Registre des étapes du wizard — dans l'ordre du carousel legacy. Ajouter une étape ici
 *  suffit à la faire apparaître dans la barre de progression et la navigation Suivant/Précédent. */
export const SETUP_STEPS: WizardStepDef[] = [
  { id: 'sysconfig', labelKey: 'setup.step.system', render: (cb) => <Step10SystemCheck onStatusChange={cb} /> },
  { id: 'apache', labelKey: 'setup.step.apache', render: (cb) => <Step11ApacheCheck onStatusChange={cb} /> },
  { id: 'vhost', labelKey: 'setup.step.vhost', render: (cb) => <Step12VhostCheck onStatusChange={cb} /> },
  { id: 'fsrights', labelKey: 'setup.step.fsrights', render: (cb) => <Step13FsRightsCheck onStatusChange={cb} /> },
  { id: 'environment', labelKey: 'setup.step.environment', render: (cb, reg) => <Step14Environment onStatusChange={cb} registerBeforeNext={reg} /> },
  { id: 'dbconn', labelKey: 'setup.step.database', render: (cb) => <Step20DatabaseConnection onStatusChange={cb} /> },
  { id: 'modules', labelKey: 'setup.step.modules', render: (cb, reg) => <Step31ModuleSelection onStatusChange={cb} registerBeforeNext={reg} /> },
  { id: 'install', labelKey: 'setup.step.install', pointOfNoReturn: true, render: (cb) => <Step32Install onStatusChange={cb} /> },
  { id: 'moduleconfig', labelKey: 'setup.step.config', render: (cb, reg) => <Step33ModuleConfiguration onStatusChange={cb} registerBeforeNext={reg} /> },
  { id: 'finish', labelKey: 'setup.step.finish', render: (cb) => <Step40Finish onStatusChange={cb} /> },
]
